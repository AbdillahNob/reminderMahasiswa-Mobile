import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  Modal,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {
  widthPercentageToDP as w,
  heightPercentageToDP as h,
} from '../../utils/responsive';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {updateKumpulTugas} from '../../Database/Database';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';

const ModalPesan = ({dataModal, dataModalJenis, type, onUpdate}) => {
  const [modalVisible, setModalVisible] = useState(true);
  const [jenisModal, setJenisModal] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filePath, setFilePath] = useState('');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [isFolderSelectionMode, setIsFolderSelectionMode] = useState(false);

  useEffect(() => {
    setJenisModal(dataModalJenis);
  }, []);

  const deskripsi = () => {
    let data = [];
    if (type === 'Kuliah') {
      data = [
        {value: dataModal.namaMatkul},
        {label: 'hari', value: dataModal.hari},
        {label: 'ruangan', value: dataModal.ruangan},
        {label: 'kelas', value: dataModal.kelas},
      ];
    } else {
      data = [
        {value: dataModal.namaMatkul},
        {label: 'Tugas', value: dataModal.namaTugas},
        {label: 'Tanggal', value: dataModal.tanggal},
        {label: 'Kelas', value: dataModal.kelas},
      ];
    }

    return data.map(({label, value}, key) => (
      <View key={key} style={{alignItems: 'flex-start'}}>
        {label ? (
          <Text
            style={{
              color: 'black',
              fontWeight: 'medium',
              marginBottom: h(1.5),
              textAlign: 'left',
              fontSize: w(4),
              textTransform: 'capitalize',
            }}>
            {label}: {value}
          </Text>
        ) : (
          <Text
            style={{
              color: 'black',
              fontWeight: 'bold',
              marginBottom: h(1.5),
              textAlign: 'center',
              fontSize: w(4.8),
            }}>
            {value}
          </Text>
        )}
      </View>
    ));
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  // Fungsi untuk meminta izin penyimpanan (untuk Android)
  const requestStoragePermission = async () => {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      if (parseInt(Platform.Version, 10) >= 33) {
        // Untuk Android 13 ke atas (API 33+)
        const permissions = [
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
        ];

        const grantedPermissions = await PermissionsAndroid.requestMultiple(
          permissions,
        );

        return (
          grantedPermissions['android.permission.READ_MEDIA_IMAGES'] ===
            'granted' ||
          grantedPermissions['android.permission.READ_MEDIA_VIDEO'] ===
            'granted' ||
          grantedPermissions['android.permission.READ_MEDIA_AUDIO'] ===
            'granted'
        );
      } else {
        // Untuk Android 12 ke bawah
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Izin Penyimpanan',
            message:
              'Aplikasi memerlukan akses ke penyimpanan untuk menyimpan file',
            buttonNeutral: 'Tanya Nanti',
            buttonNegative: 'Batal',
            buttonPositive: 'OK',
          },
        );

        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.error('Error requesting permissions:', err);
      return false;
    }
  };

  // Fungsi untuk memilih folder
  const pickFolder = async () => {
    setIsFolderSelectionMode(true);

    // Cek dan minta izin penyimpanan jika belum
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert(
        'Izin Diperlukan',
        'Aplikasi memerlukan izin penyimpanan untuk menyimpan file',
      );
      setIsFolderSelectionMode(false);
      return;
    }

    try {
      // Tampilkan opsi folder yang tersedia
      const options = [
        {
          label: 'Folder Unduhan (Download)',
          value: RNFS.DownloadDirectoryPath,
        },
        {
          label: 'Folder Gambar',
          value: RNFS.PicturesDirectoryPath,
        },
      ];

      // Filter opsi yang tersedia (beberapa mungkin tidak tersedia di semua perangkat)
      const availableOptions = await Promise.all(
        options.map(async option => {
          if (option.value) {
            try {
              const exists = await RNFS.exists(option.value);
              return exists ? option : null;
            } catch (err) {
              return null;
            }
          }
          return null;
        }),
      );

      const filteredOptions = availableOptions.filter(Boolean);

      if (filteredOptions.length === 0) {
        Alert.alert(
          'Error',
          'Tidak dapat menemukan folder yang tersedia di perangkat Anda',
        );
        setIsFolderSelectionMode(false);
        return;
      }

      // Tampilkan dialog untuk memilih folder
      Alert.alert(
        'Pilih Lokasi Penyimpanan',
        'Silakan pilih folder untuk menyimpan file:',
        [
          ...filteredOptions.map(option => ({
            text: option.label,
            onPress: () => {
              setSelectedFolder(option.value);
              setIsFolderSelectionMode(false);
              // Setelah memilih folder, langsung pilih file
              pickFileAndUpload(option.value);
            },
          })),
          {
            text: 'Batal',
            style: 'cancel',
            onPress: () => setIsFolderSelectionMode(false),
          },
        ],
      );
    } catch (error) {
      console.error('Error picking folder:', error);
      Alert.alert('Error', 'Gagal memilih folder: ' + error.message);
      setIsFolderSelectionMode(false);
    }
  };

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [
          DocumentPicker.types.pdf,
          DocumentPicker.types.doc,
          DocumentPicker.types.docx,
          DocumentPicker.types.images,
        ],
      });

      if (!result || result.length === 0) {
        Alert.alert('Dibatalkan', 'Pemilihan file dibatalkan');
        return null;
      }

      return result[0];
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        Alert.alert('Dibatalkan', 'Pemilihan file dibatalkan');
      } else {
        Alert.alert('Error', 'Gagal memilih file: ' + err.message);
      }
      return null;
    }
  };

  const getFolderName = folderPath => {
    const parts = folderPath.split('/');
    return parts[parts.length - 1] || 'folder yang dipilih';
  };

  const pickFileAndUpload = async folderPath => {
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      // Pilih file
      const fileResult = await pickFile();
      if (!fileResult) {
        setIsProcessing(false);
        return;
      }

      // Memastikan folder utama ada
      const mainFolder = folderPath;
      const appFolder = `${mainFolder}`;

      try {
        const exists = await RNFS.exists(appFolder);
        if (!exists) {
          await RNFS.mkdir(appFolder);
        }
      } catch (err) {
        console.error('Error creating app folder:', err);
        // Jika gagal membuat folder TugasMahasiswa, gunakan folder utama
      }

      // Buat subfolder dengan nama mata kuliah jika tersedia
      let destinationFolder = appFolder;
      if (dataModal.namaMatkul) {
        const subjectFolder = `${appFolder}/${dataModal.namaMatkul.replace(
          /[^a-zA-Z0-9]/g,
          '_',
        )}`;

        try {
          const subjectFolderExists = await RNFS.exists(subjectFolder);
          if (!subjectFolderExists) {
            await RNFS.mkdir(subjectFolder);
          }
          destinationFolder = subjectFolder;
        } catch (err) {
          console.error('Error creating subject folder:', err);
          // Jika gagal membuat folder mata kuliah, gunakan folder aplikasi
        }
      }

      // Ambil detail file
      const sourcePath = fileResult.uri;
      const fileName = fileResult.name;
      let destPath = `${destinationFolder}/${fileName}`;

      // Periksa jika file sudah ada
      const fileExists = await RNFS.exists(destPath);
      if (fileExists) {
        const timestamp = new Date().getTime();
        const newFileName = `${fileName.split('.')[0]}_${timestamp}.${fileName
          .split('.')
          .pop()}`;
        destPath = `${destinationFolder}/${newFileName}`;
      }

      // Salin file ke tujuan
      await RNFS.copyFile(sourcePath, destPath);
      setFilePath(destPath);

      // Perbarui status tugas di database
      await updateKumpulTugas(dataModal.idTugas, true);
      if (onUpdate) {
        onUpdate(dataModal.idTugas, true);
      }

      // Simpan jalur file untuk digunakan nanti jika diperlukan
      await AsyncStorage.setItem(`task_file_${dataModal.idTugas}`, destPath);

      setModalVisible(false);
      Alert.alert(
        'Sukses',
        `File berhasil disimpan di ${getFolderName(
          folderPath,
        )}.\n\nLokasi lengkap: ${destPath}`,
        [{text: 'OK'}],
      );
    } catch (error) {
      console.error('Error handling upload:', error);
      Alert.alert('Error', 'Gagal menyimpan file: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpload = async () => {
    // Mulai proses dengan memilih folder
    await pickFolder();
  };

  const button = ket => {
    if (type === 'Kuliah') {
      return (
        <TouchableOpacity
          style={styles.buttonModal}
          onPress={() => setModalVisible(false)}>
          <Text style={styles.buttonModalText}>
            Oke terima telah diingatkan
          </Text>
        </TouchableOpacity>
      );
    } else {
      const data =
        ket === 'sekarang'
          ? [{value: 'Upload Tugas'}, {value: 'Tugas ini tidak saya kumpulkan'}]
          : [
              {value: 'Upload Tugas'},
              {value: 'Tugas ini sedang saya kerjakan'},
            ];
      return data.map(({value}, key) => (
        <View key={key}>
          <TouchableOpacity
            style={styles.buttonModal}
            onPress={() =>
              value === 'Upload Tugas' ? handleUpload() : closeModal()
            }
            disabled={isProcessing || isFolderSelectionMode}>
            <Text style={styles.buttonModalText}>{value}</Text>
          </TouchableOpacity>
        </View>
      ));
    }
  };

  return (
    <>
      <StatusBar backgroundColor={'#0F4473'} barStyle={'light-content'} />
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={closeModal}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Image
              source={require('../../assets/images/logoAlarm.png')}
              style={{width: w(16), height: h(8), elevation: 2}}
              resizeMode="contain"
            />
            <Text style={styles.modalTextTitle}>
              {type === 'Tugas' ? 'jadwal kumpul tugas' : 'jadwal kuliah anda'}
            </Text>
            <Text style={styles.modalText}>
              {type === 'Tugas'
                ? `Pukul : ${dataModal.pukul}`
                : `${dataModal.jamMulai} - ${dataModal.jamSelesai}`}
            </Text>
            <View style={styles.divider} />
            <View style={styles.descriptionContainer}>{deskripsi()}</View>
            {isProcessing ? (
              <View style={{marginVertical: h(2)}}>
                <Text style={{color: '#0F4473', fontSize: w(4)}}>
                  Sedang memproses...
                </Text>
              </View>
            ) : isFolderSelectionMode ? (
              <View style={{marginVertical: h(2)}}>
                <Text style={{color: '#0F4473', fontSize: w(4)}}>
                  Silakan pilih folder...
                </Text>
              </View>
            ) : (
              button(jenisModal)
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

export default ModalPesan;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: w('82%'),
    paddingTop: w(4),
    paddingBottom: w(4),
    backgroundColor: '#F5F5F5',
    borderRadius: w(3),
    alignItems: 'center',
    elevation: 5,
  },
  buttonModal: {
    width: w('68%'),
    height: h(5),
    backgroundColor: '#0F4473',
    borderRadius: w(2),
    marginBottom: h(2),
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonModalText: {
    color: 'white',
    fontSize: w(4),
    fontWeight: '500',
    marginLeft: w(2),
    textTransform: 'capitalize',
  },
  modalText: {
    fontSize: w(5),
    color: '#333',
  },
  modalTextTitle: {
    color: '#E8304E',
    fontWeight: 'bold',
    textTransform: 'capitalize',
    fontSize: w(6),
    marginTop: h(0.5),
    marginBottom: w(2.2),
  },
  divider: {
    width: w('70%'),
    height: h(0.2),
    backgroundColor: 'black',
    borderRadius: w(4),
    marginBottom: h(1.5),
  },
  descriptionContainer: {
    marginBottom: h(1),
    marginLeft: w(7),
    marginRight: w(7),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
