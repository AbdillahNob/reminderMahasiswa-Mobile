import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  Modal,
  TouchableOpacity,
  Image,
  Alert,
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

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [
          DocumentPicker.types.pdf,
          DocumentPicker.types.doc,
          DocumentPicker.types.docx,
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

  const getDestinationFolder = async () => {
    // Define default location in app's document directory
    const appFolder = `${RNFS.DocumentDirectoryPath}/TugasMahasiswa`;

    try {
      // Check if directory exists, if not create it
      const exists = await RNFS.exists(appFolder);
      if (!exists) {
        await RNFS.mkdir(appFolder);
      }

      // Create a subfolder with subject name if available
      let subjectFolder = appFolder;
      if (dataModal.namaMatkul) {
        subjectFolder = `${appFolder}/${dataModal.namaMatkul.replace(
          /[^a-zA-Z0-9]/g,
          '_',
        )}`;
        const subjectFolderExists = await RNFS.exists(subjectFolder);
        if (!subjectFolderExists) {
          await RNFS.mkdir(subjectFolder);
        }
      }

      return subjectFolder;
    } catch (error) {
      console.error('Error creating folder:', error);
      // Return default folder if something went wrong
      return appFolder;
    }
  };

  const handleUpload = async () => {
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      // First pick the file
      const fileResult = await pickFile();
      if (!fileResult) {
        setIsProcessing(false);
        return;
      }

      // Get the destination folder
      const folderPath = await getDestinationFolder();

      // Get file details
      const sourcePath = fileResult.uri;
      const fileName = fileResult.name;
      const destPath = `${folderPath}/${fileName}`;

      // Check if file already exists
      const fileExists = await RNFS.exists(destPath);
      if (fileExists) {
        const timestamp = new Date().getTime();
        const newFileName = `${fileName.split('.')[0]}_${timestamp}.${fileName
          .split('.')
          .pop()}`;
        destPath = `${folderPath}/${newFileName}`;
      }

      // Copy file to destination
      await RNFS.copyFile(sourcePath, destPath);
      setFilePath(destPath);

      // Update task status in database
      await updateKumpulTugas(dataModal.idTugas, true);
      if (onUpdate) {
        onUpdate(dataModal.idTugas, true);
      }

      // Save the file path to use it later if needed
      await AsyncStorage.setItem(`task_file_${dataModal.idTugas}`, destPath);

      setModalVisible(false);
      Alert.alert('Sukses', `Tugas berhasil disimpan di ${destPath}`);
    } catch (error) {
      console.error('Error handling upload:', error);
      Alert.alert('Error', 'Gagal menyimpan file: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
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
            }>
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
              {type === 'Tugas' ? 'jadwal tugas anda' : 'jadwal kuliah anda'}
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
