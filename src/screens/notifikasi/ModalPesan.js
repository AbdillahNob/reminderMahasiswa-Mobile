import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  Modal,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {
  widthPercentageToDP as w,
  heightPercentageToDP as h,
} from '../../utils/responsive';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {updateKumpulTugas} from '../../Database/Database';

const ModalPesan = ({dataModal, dataModalJenis, type, onUpdate}) => {
  const [modalVisible, setModalVisible] = useState(true);
  const [jenisModal, setJenisModal] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setJenisModal(dataModalJenis);
    checkAsyncStorage();
  }, []);

  const checkAsyncStorage = async () => {
    const TdataModalStorage = await AsyncStorage.getItem('dataModalStorage');
    const TjenisModalStorage = await AsyncStorage.getItem('jenisModalStorage');
    console.log('Modal Tangkap Nilai : ', TdataModalStorage);
    console.log('Modal tangkap Jenis : ', TjenisModalStorage);

    AsyncStorage.removeItem('showModal');
    await AsyncStorage.removeItem('dataModalStorage');
    await AsyncStorage.removeItem('jenisModalStorage');

    console.log(
      'Berhasil hapus data Notifikasi dari AsyncStorage: ',
      TdataModalStorage,
    );
    console.log(
      'Berhasil hapus Jenis Modal Notifikasi dari AsyncStorage: ',
      TjenisModalStorage,
    );
  };

  const deskripsi = () => {
    let data = [];
    if (type == 'Kuliah') {
      data = [
        {value: dataModal.namaMatkul},
        {label: 'hari', value: dataModal.hari},
        {label: 'ruangan', value: dataModal.ruangan},
        {label: 'kelas', value: dataModal.kelas},
      ];
    } else {
      data = [
        {value: dataModal.namaMatkul},
        {label: 'Tanggal', value: dataModal.tanggal},
        {label: 'Kelas', value: dataModal.kelas},
        {label: 'Pukul', value: dataModal.pukul},
      ];
    }

    return data.map(({label, value}, key) => (
      <View key={key} style={{alignItems: 'flex-start'}}>
        <Text
          style={{
            color: 'black',
            fontWeight: 'bold',
            marginBottom: h(1.5),
            textAlign: 'center',
            fontSize: w(4.8),
          }}>
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
              {label} : {value}
            </Text>
          ) : (
            value
          )}
        </Text>
      </View>
    ));
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const cekListTugas = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      setModalVisible(false);
      const hasilKumpul = !dataModal.kumpul;
      console.log('Hasil Kumpul : ', hasilKumpul);

      // const updateData = {...dataModal, kumpul: hasilKumpul};
      // await AsyncStorage.setItem('updateKumpul', JSON.stringify(updateData));
      await updateKumpulTugas(dataModal.idTugas, hasilKumpul);

      // Panggil fungsi onUpdate untuk memberitahu parent bahwa data telah berubah
      if (onUpdate) {
        onUpdate(dataModal.idTugas, hasilKumpul);
      }

      Alert.alert('Info', 'Save pengumpulan tugas', [
        {text: 'oke', onPress: () => console.log('Kumpul Tugas Update')},
      ]);
    } catch (error) {
      console.log('Error CekListTugas : ', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const button = ket => {
    let keterangan = ket;

    // utk Validasi apakah alarm ini jadwalKuliah atau Tugas
    if (type == 'Kuliah') {
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
        keterangan === 'sekarang'
          ? [
              {value: 'Tugas ini telah saya kumpulkan'},
              {value: 'Tugas ini tidak saya kumpulkan'},
            ]
          : [
              {value: 'Tugas ini telah saya kumpulkan'},
              {value: 'Tugas ini sedang saya kerjakan'},
            ];
      return data.map(({value}, key) => (
        <View key={key}>
          <TouchableOpacity
            style={styles.buttonModal}
            onPress={() =>
              value === 'Tugas ini telah saya kumpulkan'
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
      {jenisModal == 'sekarang' ? (
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
              <Text
                style={{
                  color: '#E8304E',
                  fontWeight: 'bold',
                  textTransform: 'capitalize',
                  fontSize: w(6),
                  marginTop: h(0.5),
                  marginBottom: w(2.2),
                }}>
                kelas mengajar anda
              </Text>
              <Text
                style={{
                  marginBottom: h(1),
                  fontSize: w(5),
                  fontWeight: 'bold',
                  color: 'black',
                  TextAlign: 'center',
                  textTransform: 'capitalize',
                }}>
                {type === 'Tugas'
                  ? dataModal.pukul
                  : dataModal.jamMulai - dataModal.jamSelesai}
              </Text>
              <View
                style={{
                  width: w('70%'),
                  height: h(0.2),
                  backgroundColor: 'black',
                  borderRadius: w(4),
                  marginBottom: h(1.5),
                }}
              />
              <View
                style={{
                  marginBottom: h(1),
                  marginLeft: w(7),
                  marginRight: w(7),
                }}>
                {deskripsi()}
              </View>
              {button('sekarang')}
              {/* Tombol untuk menutup modal */}
            </View>
          </View>
        </Modal>
      ) : (
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
              <Text
                style={{
                  color: '#E8304E',
                  fontWeight: 'bold',
                  textTransform: 'capitalize',
                  fontSize: w(6),
                  marginTop: h(0.5),
                  marginBottom: w(2.2),
                }}>
                kelas mengajar anda
              </Text>
              <Text
                style={{
                  marginBottom: h(1),
                  fontSize: w(5),
                  fontWeight: 'bold',
                  color: 'black',
                  TextAlign: 'center',
                }}>
                {type === 'Tugas'
                  ? dataModal.pukul
                  : dataModal.jamMulai - dataModal.jamSelesai}
              </Text>
              <View
                style={{
                  width: w('70%'),
                  height: h(0.2),
                  backgroundColor: 'black',
                  borderRadius: w(4),
                  marginBottom: h(1.5),
                }}
              />
              <View
                style={{
                  marginBottom: h(1),
                  marginLeft: w(7),
                  marginRight: w(7),
                }}>
                {deskripsi()}
              </View>
              {button(jenisModal)}
              {/* Tombol untuk menutup modal */}
            </View>
          </View>
        </Modal>
      )}
    </>
  );
};

export default ModalPesan;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Background semi-transparan
  },
  modalContent: {
    width: w('82%'),
    paddingTop: w(4),
    paddingBottom: w(4),
    backgroundColor: '#F0F4FF',
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
  closeButton: {
    backgroundColor: '#0F4473',
    paddingVertical: h(1.2),
    paddingHorizontal: w(10),
    borderRadius: w(1.5),
    elevation: 3,
    marginTop: h(1),
  },
});
