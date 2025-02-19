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
// import DocumentPicker from 'react-native-document-picker';
// import {GoogleSignin} from '@react-native-google-signin/google-signin';
// import RNFS from 'react-native-fs';

const ModalPesan = ({dataModal, dataModalJenis, type, onUpdate}) => {
  const [modalVisible, setModalVisible] = useState(true);
  const [jenisModal, setJenisModal] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // GoogleSignin.configure({
  //   scopes: ['https://www.googleapis.com/auth/drive.file'],
  //   webClientId: 'YOUR_WEB_CLIENT_ID', // Ganti dengan Web Client ID dari Google Console
  // });

  // GoogleSignin.configure({
  //   scopes: ['https://www.googleapis.com/auth/drive'],
  //   webClientId: 'YOUR_WEB_CLIENT_ID',
  // });

  useEffect(() => {
    setJenisModal(dataModalJenis);
    // checkAsyncStorage();
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

  // const pickDocument = async () => {
  //   try {
  //     const result = await DocumentPicker.pick({
  //       type: [
  //         DocumentPicker.types.pdf,
  //         DocumentPicker.types.doc,
  //         DocumentPicker.types.docx,
  //       ],
  //     });
  //     console.log('File terpilih:', result);
  //     return result[0]; // Mengembalikan file yang dipilih
  //   } catch (err) {
  //     if (DocumentPicker.isCancel(err)) {
  //       console.log('Pemilihan file dibatalkan');
  //     } else {
  //       console.error(err);
  //     }
  //   }
  // };
  // const signInWithGoogle = async () => {
  //   try {
  //     await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
  //     const userInfo = await GoogleSignin.signIn();
  //     const tokens = await GoogleSignin.getTokens();
  //     console.log('User Info:', userInfo);
  //     console.log('Access Token:', tokens.accessToken);

  //     if (!tokens.accessToken) {
  //       Alert.alert('Error', 'Gagal mendapatkan Access token dari google');
  //       return null;
  //     }

  //     return tokens.accessToken;
  //   } catch (error) {
  //     console.error('Error login Google:', error);
  //   }
  // };

  // const uploadToGoogleDrive = async file => {
  //   try {
  //     const accessToken = await signInWithGoogle();
  //     if (!accessToken) {
  //       Alert.alert('Error', 'Gagal mendapatkan akses Google');
  //       return false; // Kembalikan false jika gagal login
  //     }

  //     const fileMetadata = {
  //       name: file.name,
  //       mimeType: file.type,
  //     };

  //     const form = new FormData();
  //     // form.append(
  //     //   'metadata',
  //     //   new Blob([JSON.stringify(fileMetadata)], {type: 'application/json'}),
  //     // );
  //     form.append('metadata', {
  //       string: JSON.stringify(fileMetadata),
  //       type: 'application/json',
  //     });

  //     form.append('file', {
  //       uri: file.uri,
  //       type: file.type,
  //       name: file.name,
  //     });

  //     const response = await fetch(
  //       'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
  //       {
  //         method: 'POST',
  //         headers: {
  //           Authorization: `Bearer ${accessToken}`,
  //           'Content-Type': 'multipart/form-data',
  //         },
  //         body: form,
  //       },
  //     );

  //     if (!response.ok) {
  //       throw new Error(`Upload gagal dengan status ${response.status}`);
  //     }

  //     const result = await response.json();
  //     console.log('File berhasil diunggah:', result);
  //     Alert.alert('Sukses', 'File berhasil diunggah ke Google Drive');
  //     return true; // Berhasil upload
  //   } catch (error) {
  //     console.error('Error mengunggah:', error);
  //     return false; // Gagal upload
  //   }
  // };

  // const handleUpload = async () => {
  //   const file = await pickDocument();
  //   if (file) {
  //     const success = await uploadToGoogleDrive(file); // Tungg Upload ke Google Drive smpi Selesai
  //     if (success) {
  //       cekListTugas();
  //     } else {
  //       Alert.alert('INFO', 'Gagal Upload File ke GoogleDrive');
  //     }
  //   }
  // };

  const cekListTugas = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const hasilKumpul = !dataModal.kumpul;

      await updateKumpulTugas(dataModal.idTugas, hasilKumpul);
      if (onUpdate) {
        onUpdate(dataModal.idTugas, hasilKumpul);
      }

      setModalVisible(false);
      Alert.alert('Info', 'Save pengumpulan tugas berhasil');
    } catch (error) {
      console.log('Error CekListTugas : ', error);
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
          ? [
              {value: 'Tugas ini telah saya Kumpul'},
              {value: 'Tugas ini tidak saya kumpulkan'},
            ]
          : [
              {value: 'Tugas ini telah saya Kumpul'},
              {value: 'Tugas ini sedang saya kerjakan'},
            ];
      return data.map(({value}, key) => (
        <View key={key}>
          <TouchableOpacity
            style={styles.buttonModal}
            onPress={() =>
              value === 'Tugas ini telah saya Kumpul'
                ? cekListTugas()
                : closeModal()
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
            {button(jenisModal)}
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
