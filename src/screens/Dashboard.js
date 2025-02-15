import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  Image,
  TouchableOpacity,
  ScrollView,
  Switch,
  Modal,
  Alert,
  FlatList,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {
  widthPercentageToDP as w,
  heightPercentageToDP as h,
} from '../utils/responsive';
import {SafeAreaView} from 'react-native-safe-area-context';
import HeaderDashboard from '../components/HeaderDashboard';
import {useNavigation} from '@react-navigation/native';
import {
  getJadwalKuliah,
  hapusDataKuliah,
  updateAktifKuliah,
  getJadwalTugas,
  hapusDataTugas,
  updateAktifTugas,
} from '../Database/Database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Notifikasi from './notifikasi/Notifikasi';

const Dashboard = () => {
  const navigasi = useNavigation();
  const [kategori, setKategori] = useState({title: 'kuliah'});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dataJadwal, setDataJadwal] = useState([]);
  const [dataTugas, setDataTugas] = useState([]);
  const [idUser, setIdUser] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [subMenu, setSubMenu] = useState([
    {title: 'kuliah', screen: 'tambahJadwal'},
    {title: 'tugas', screen: 'tambahTugas'},
    {title: 'history'},
  ]);

  useEffect(() => {
    // console.log(jadwal);
    checkUserSession();
    // checkKumpul();
  }, []);

  useEffect(() => {
    if (idUser) {
      fetch(idUser);
    }
  }, [refreshTrigger, idUser]);

  const checkUserSession = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('idUser');
      // const dataModal = await AsyncStorage.getItem('dataModalStorage');
      // console.log('Dashboard tangkap data Modal : ', dataModal);

      if (storedUserId) {
        setIdUser(storedUserId);
      } else {
        Alert.alert('ERROR', 'Akun User tidak Valid!', [
          {
            text: 'OKE',
            onPress: () => {
              navigasi.dispatch(StackActions.replace('Login'));
            },
          },
        ]);
      }
    } catch (err) {
      console.log(`Gagal memuat session: ${err}`);
    }
  };

  const fetch = async idUser => {
    try {
      const hasilK = await getJadwalKuliah(idUser);
      const hasilT = await getJadwalTugas(idUser);

      setDataTugas(hasilT);
      setDataJadwal(hasilK);
    } catch (error) {
      console.log(`Gagal Ambil data Jadwal : ${error}`);
    }
  };

  const headerMainView = () => {
    return (
      <View style={{backgroundColor: '#F5F5F5'}}>
        <View
          style={{
            marginTop: h(2),
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <FlatList
            data={subMenu}
            style={{
              paddingTop: h(0.5),
              paddingBottom: h(0.8),
              marginBottom: h(-0.3),
            }}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({item}) => (
              <TouchableOpacity
                style={{
                  backgroundColor:
                    kategori.title == item.title ? '#2A2A2A' : '#ffffff',
                  opacity: kategori.title == item.title ? 0.85 : 1,
                  marginHorizontal: w(5),
                  paddingRight: w(4.2),
                  paddingLeft: w(4.2),
                  paddingTop: h(0.8),
                  paddingBottom: h(0.8),
                  borderRadius: w(3),
                  elevation: 2,
                }}
                onPress={() => setKategori(item)}>
                <Text
                  style={{
                    textTransform: 'capitalize',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: w(4.2),
                    color: kategori.title == item.title ? '#ffffff' : 'black',
                  }}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
        <View style={styles.headerMain}>
          <Text
            style={{
              color: 'black',
              fontSize: w(4.5),
              fontWeight: 'bold',
              marginLeft: w(5),
              textTransform: 'capitalize',
            }}>
            {kategori.title === 'history' ? null : 'Jadwal '}
            {kategori.title !== 'history'
              ? kategori.title
              : 'history tugas'}{' '}
            Anda{' '}
          </Text>
          {kategori.title !== 'history' ? (
            <Image
              source={require('../assets/icons/book.png')}
              style={{width: w(6), height: h(3), marginLeft: w(-26)}}
              resizeMode={'cover'}
            />
          ) : (
            <Image
              source={require('../assets/icons/book.png')}
              style={{width: w(6), height: h(3), marginRight: w(43)}}
              resizeMode={'cover'}
            />
          )}
          {kategori.title == 'history' ? null : (
            <TouchableOpacity
              style={{
                width: w(8),
                height: h(4),
                backgroundColor: '#2A2A2A',
                elevation: 3,
                borderRadius: w(5),
                marginRight: w(6),
                opacity: 0.85,
                marginTop: h(-0.6),
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() =>
                navigasi.navigate(
                  kategori.title == 'kuliah' ? 'TambahJadwal' : 'TambahTugas',
                )
              }>
              <Image
                source={require('../assets/icons/plus.png')}
                resizeMode={'center'}
                style={{width: w(5), height: h(2.5)}}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const openModal = item => {
    setSelectedItem(item);
    setModalVisible(true);
  };
  const closeModal = () => {
    setSelectedItem(null);
    setModalVisible(false);
  };

  const buttonModal = item => {
    const deleteData = async item => {
      Alert.alert('INFO', 'Apakah Anda yakin ingin Hapus', [
        {text: 'Batal', style: 'Cancel'},
        {
          text: 'Hapus',
          onPress: async () => {
            try {
              if (kategori.title == 'kuliah') {
                if (item.idKuliah) {
                  await hapusDataKuliah(item.idKuliah);

                  Alert.alert(
                    'INFO',
                    `Berhasil Hapus Mata Kuliah : ${item.namaMatkul}`,
                    [
                      {
                        text: 'OKE',
                      },
                    ],
                  );
                  // Agar bisa langsung refresh Data yg tampil
                  fetch(item.idUser);
                } else {
                  Alert.alert(
                    'INFO',
                    `idKuliah tidak ditemukan : ${item.idKuliah}`,
                  );
                }
              } else if (kategori.title == 'tugas') {
                if (item.idTugas) {
                  await hapusDataTugas(item.idTugas);

                  Alert.alert(
                    'INFO',
                    `Berhasil Hapus data Tugas dengan Mata Kuliah : ${item.namaMatkul}`,
                    [
                      {
                        text: 'OKE',
                      },
                    ],
                  );
                  // Agar bisa langsung refresh Data yg tampil
                  fetch(item.idUser);
                } else {
                  Alert.alert(
                    'INFO',
                    `idTugas tidak ditemukan : ${item.idTugas}`,
                  );
                }
              }
            } catch (error) {
              Alert.alert('ERROR', 'Gagal Menghapus Data');
              console.log(`Gagal Hapus Data : ${error}`);
            }
          },
        },
      ]);
    };

    const dataJadwal = item;
    let data = [];
    if (kategori.title == 'kuliah') {
      data = [
        {
          label: 'Edit Jadwal Kuliah',
          icon: require('../assets/icons/jadwalSet.png'),
          link: 'EditJadwal',
        },
        {
          label: 'Hapus Jadwal Kuliah',
          icon: require('../assets/icons/trash.png'),
        },
      ];
    } else {
      data = [
        {
          label: 'Edit Jadwal Tugas',
          icon: require('../assets/icons/jadwalSet.png'),
          link: 'EditTugas',
        },
        {
          label: 'hapus jadwal Tugas',
          icon: require('../assets/icons/trash.png'),
        },
      ];
    }

    return data.map(({label, icon, link}, key) => (
      <View key={key}>
        <TouchableOpacity
          style={styles.buttonModal}
          onPress={() => {
            if (label == 'Edit Jadwal Kuliah' || label == 'Edit Jadwal Tugas') {
              navigasi.navigate(link, {dataJadwal}, setModalVisible(false));
            } else {
              deleteData(dataJadwal);
              setModalVisible(false);
            }
          }}>
          <Image source={icon} style={{width: w(6), height: h(3)}} />
          <Text style={styles.buttonModalText}>{label}</Text>
        </TouchableOpacity>
      </View>
    ));
  };

  const aturAktif = async (id, jenisData) => {
    let itemToUpdate = [];
    if (jenisData == 'kuliah') {
      let jadwalBaru = dataJadwal.map(item =>
        item.idKuliah === id ? {...item, aktifkan: !item.aktifkan} : item,
      );
      setDataJadwal(jadwalBaru);
      itemToUpdate = jadwalBaru.find(item => item.idKuliah === id);
      try {
        await updateAktifKuliah(id, itemToUpdate.aktifkan);
        Alert.alert(
          'INFO',
          `Status Aktivasi Alarm ${
            itemToUpdate.namaMatkul
          } berhasil diperbarui menjadi ${
            itemToUpdate.aktifkan ? 'Aktif' : 'Tidak Aktif'
          }.`,
        );
        setRefreshTrigger(prev => prev + 1);
      } catch (error) {
        // If update fails, revert the local state
        setDataJadwal(
          dataJadwal.map(item =>
            item.idKuliah === id ? {...item, aktifkan: !item.aktifkan} : item,
          ),
        );

        Alert.alert('ERROR', 'Gagal memperbarui status Aktivasi Alarm.');
        console.error(`Error updating status: ${error}`);
      }
    } else if (jenisData == 'tugas') {
      let jadwalBaru = dataTugas.map(item =>
        item.idTugas === id ? {...item, aktifkan: !item.aktifkan} : item,
      );
      setDataTugas(jadwalBaru);
      itemToUpdate = jadwalBaru.find(item => item.idTugas === id);
      try {
        await updateAktifTugas(id, itemToUpdate.aktifkan);
        Alert.alert(
          'INFO',
          `Status Aktivasi Alarm Tugas ${
            itemToUpdate.namaTugas
          } berhasil diperbarui menjadi ${
            itemToUpdate.aktifkan ? 'Aktif' : 'Tidak Aktif'
          }.`,
        );
        setRefreshTrigger(prev => prev + 1);
      } catch (error) {
        // If update fails, revert the local state
        setDataTugas(
          dataTugas.map(item =>
            item.idTugas === id ? {...item, aktifkan: !item.aktifkan} : item,
          ),
        );

        Alert.alert('ERROR', 'Gagal memperbarui status Aktivasi Alarm Tugas.');
        console.error(`Error updating status Tugas: ${error}`);
      }
    }
    // console.log(itemToUpdate);
  };

  const handleUpdate = (id, kumpul) => {
    setDataTugas(prev =>
      prev.map(item =>
        item.idTugas === id ? {...item, kumpul: kumpul} : item,
      ),
    );
  };

  return (
    <View style={styles.container}>
      <Notifikasi refreshTrigger={refreshTrigger} onUpdate={handleUpdate} />
      <StatusBar backgroundColor={'#2A2A2A'} barStyle={'light-content'} />
      {/* Agar setiap perubahan baik edit dan hapus lngsng terefresh data yg tampil di HEADER */}
      {idUser || dataJadwal.length > 0 ? (
        <HeaderDashboard
          idUser={idUser}
          dataJadwal={dataJadwal}
          dataTugas={dataTugas}
        />
      ) : null}
      {headerMainView()}
      <SafeAreaView style={styles.containerScroll}>
        {kategori.title === 'kuliah' ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{
              paddingLeft: w(2),
              paddingRight: w(2),
            }}>
            {dataJadwal.map((item, key) => (
              <View key={key} style={styles.card}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    marginTop: h(1.1),
                    paddingHorizontal: w(2.2),
                  }}>
                  <View
                    style={{
                      flexDirection: 'column',
                    }}>
                    <Text
                      style={{
                        width: w(65),
                        fontSize: w(4),
                        fontWeight: 'bold',
                        textTransform: 'capitalize',
                      }}>
                      {item.namaMatkul}
                    </Text>
                    <View
                      style={{
                        width: w(28),
                        height: h(0.1),
                        backgroundColor: '#0F4473',
                        borderRadius: w(3),
                        marginTop: h(0.6),
                      }}
                    />

                    <Text style={styles.textDescCard}>
                      kelas{' '}
                      <Text
                        style={{
                          color:
                            item.tipeJadwal == 'Reguler'
                              ? '#E8304E'
                              : '#0F4473',
                        }}>
                        {item.tipeJadwal}
                      </Text>
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={{marginTop: h(1)}}
                    onPress={() => openModal(item)}>
                    <Image
                      source={require('../assets/icons/settings.png')}
                      style={{width: w(8), height: h(3.6)}}
                      resizeMode={'center'}
                    />
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    marginLeft: w(6),
                    marginRight: w(6),
                    justifyContent: 'space-around',
                    marginTop: h(1.5),
                  }}>
                  <View style={{alignItems: 'center'}}>
                    <Text style={styles.textDescCard}>{item.hari}</Text>
                    <Text style={styles.textDescCard}>Hari</Text>
                  </View>
                  <View style={{alignItems: 'center'}}>
                    <Text style={styles.textDescCard2}>{item.kelas}</Text>
                    <Text style={styles.textDescCard}>Kelas</Text>
                  </View>
                  <View style={{alignItems: 'center'}}>
                    <Text style={styles.textDescCard2}>{item.ruangan}</Text>
                    <Text style={styles.textDescCard}>Ruangan</Text>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    marginTop: h(1.5),
                    justifyContent: 'space-between',
                  }}>
                  <Text
                    style={{
                      color: 'black',
                      opacity: 0.7,
                      fontSize: w(3.8),
                      textTransform: 'capitalize',
                      marginLeft: w(6.5),
                      marginTop: w(4),
                      fontWeight: '500',
                    }}>
                    Jadwal: {item.jamMulai} - {item.jamSelesai} wita
                  </Text>

                  <View
                    style={{
                      flexDirection: 'column',
                      alignItems: 'center',
                      marginRight: w(1),
                    }}>
                    <Text
                      style={{
                        color: item.aktifkan ? '#00B038' : '#E8304E',
                        paddingRight: w(2),
                      }}>
                      {item.aktifkan ? 'Aktif' : 'Tidak Aktif'}
                    </Text>

                    <Switch
                      trackColor={{false: '#767577', true: '#E8304E'}} // Warna track
                      thumbColor={item.aktifkan ? '#f5dd4b' : '#f4f3f4'} // Warna tombol
                      ios_backgroundColor="#3e3e3e" // Warna background untuk iOS
                      onValueChange={() => aturAktif(item.idKuliah, 'kuliah')} // Fungsi saat switch berubah
                      value={item.aktifkan ? true : false} // Nilai switch (true/false)
                    />
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{
              paddingLeft: w(2),
              paddingRight: w(2),
            }}>
            {dataTugas.map((item, key) => (
              <View key={key} style={styles.card}>
                <View
                  style={{
                    flexDirection: 'row',
                    marginTop: h(1.1),
                    marginLeft: w(4.8),
                    marginRight: w(4.8),
                  }}>
                  <View
                    style={{
                      flexDirection: 'column',
                    }}>
                    <Text
                      style={{
                        width: w(65),
                        fontSize: w(4),
                        fontWeight: 'bold',
                        textTransform: 'capitalize',
                      }}>
                      {item.namaMatkul}
                    </Text>
                    <View
                      style={{
                        width: w(28),
                        height: h(0.1),
                        backgroundColor: '#0F4473',
                        borderRadius: w(3),
                        marginTop: h(0.6),
                      }}
                    />
                    <Text
                      style={{
                        marginTop: h(0.6),
                        textTransform: 'capitalize',
                        color: 'black',
                        fontWeight: '500',
                        width: w(60),
                      }}>
                      {item.namaTugas}
                    </Text>
                  </View>
                  {kategori.title == 'tugas' ? (
                    <TouchableOpacity
                      style={{marginTop: h(1), marginLeft: w(5.5)}}
                      onPress={() => openModal(item)}>
                      <Image
                        source={require('../assets/icons/settings.png')}
                        style={{width: w(8), height: h(3.6)}}
                        resizeMode={'center'}
                      />
                    </TouchableOpacity>
                  ) : null}
                </View>
                <View
                  style={{
                    flexDirection: 'column',
                    marginLeft: w(4.5),
                    alignItems: 'flex-start',
                    marginTop: h(0.5),
                  }}>
                  <Text style={styles.textDescCardTugas}>
                    Hari/Tgl : {item.tanggal}
                  </Text>
                  <Text style={styles.textDescCardTugas}>
                    Kelas : {item.kelas}
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      marginBottom: h(1.5),
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.textDescCardTugas}>
                      Pukul : {item.pukul}
                    </Text>

                    {kategori.title == 'tugas' ? (
                      <View
                        style={{
                          flexDirection: 'column',
                          alignItems: 'center',
                          marginLeft: item.aktifkan ? w(4) : w(-3),
                        }}>
                        <Text
                          style={{
                            color: item.aktifkan ? '#00B038' : '#E8304E',
                            textAlign: 'center',
                            paddingRight: w(2),
                            fontSize: w(3.5),
                          }}>
                          {item.aktifkan ? 'Aktif' : 'Tidak Aktif'}
                        </Text>

                        <Switch
                          trackColor={{false: '#767577', true: '#E8304E'}} // Warna track
                          thumbColor={item.aktifkan ? '#f5dd4b' : '#f4f3f4'} // Warna tombol
                          ios_backgroundColor="#3e3e3e" // Warna background untuk iOS
                          onValueChange={() => aturAktif(item.idTugas, 'tugas')} // Fungsi saat switch berubah
                          value={item.aktifkan ? true : false} // Nilai switch (true/false)
                        />
                      </View>
                    ) : (
                      <View
                        style={{
                          alignItems: 'center',
                          marginLeft: item.kumpul ? w(-2) : w(-10),
                        }}>
                        <Text
                          style={{
                            color: item.kumpul ? '#00B038' : '#E8304E',
                            textAlign: 'center',
                            textTransform: 'capitalize',
                            fontSize: w(3.5),
                          }}>
                          {item.kumpul ? 'terkumpul' : 'belum dikumpul'}
                        </Text>
                        <View
                          style={{
                            width: w(5),
                            height: h(2.5),
                            borderRadius: w(3),
                            borderColor: 'black',
                            borderWidth: 2,
                            marginTop: h(0.5),
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                          {item.kumpul ? (
                            <Image
                              source={require('../assets/icons/check.png')}
                              resizeMode={'center'}
                              style={{width: w(4.2), height: h(3)}}
                            />
                          ) : (
                            <Image
                              source={require('../assets/icons/question.png')}
                              resizeMode={'center'}
                              style={{width: w(4.2), height: h(3)}}
                            />
                          )}
                        </View>
                      </View>
                    )}
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    justifyContent: 'flex-end',
                    marginTop: h(-2),
                  }}></View>
              </View>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
      {/* MODAL */}
      {selectedItem && (
        <Modal
          animationType="slide" // Animasi modal: 'slide', 'fade', atau 'none'
          transparent={true} // Membuat background modal menjadi transparan
          visible={modalVisible} // Kontrol visibilitas modal
          onRequestClose={closeModal}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text
                style={{
                  color: 'black',
                  fontWeight: 'bold',
                  textTransform: 'capitalize',
                  fontSize: w(6),
                  marginTop: h(0.5),
                  marginBottom: w(2.2),
                }}>
                setting alarm
              </Text>
              <Text
                style={{
                  marginBottom: h(2),
                  fontSize: w(3.3),
                  color: 'black',
                  opacity: 0.75,
                  fontWeight: '400',
                }}>
                {selectedItem.namaMatkul}
              </Text>
              {buttonModal(selectedItem)}

              {/* Tombol untuk menutup modal */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}>
                <Text
                  style={{
                    color: '#ffffff',
                    fontWeight: '500',
                    textTransform: 'capitalize',
                    fontSize: w(4.4),
                  }}>
                  close
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerMain: {
    flexDirection: 'row',
    marginTop: h(3),
    marginLeft: w(1.3),
    marginRight: w(1.3),
    justifyContent: 'space-between',
  },
  containerScroll: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingTop: h(-1),
    marginTop: h(2),
  },
  card: {
    width: w('88%'),
    paddingBottom: h(1.8),
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {width: 10, height: 0},
    elevation: 1,
    marginBottom: h(2.5),
    borderRadius: w(2),
  },
  textDescCard: {
    paddingTop: h(0.2),
    color: 'black',
    opacity: 0.7,
    fontWeight: '450',
    fontSize: w(4),
    textTransform: 'capitalize',
  },
  textDescCard2: {
    color: 'black',
    opacity: 0.7,
    fontWeight: '450',
    fontSize: w(4),
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  textDescCardTugas: {
    paddingTop: h(0.6),
    color: 'black',
    opacity: 1,
    fontWeight: '450',
    fontSize: w(3.8),
    textTransform: 'capitalize',
    width: w(65),
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Background semi-transparan
  },
  modalContent: {
    width: w('82%'),
    paddingTop: w(2),
    paddingBottom: w(4),
    backgroundColor: '#F5F5F5',
    borderRadius: w(3),
    alignItems: 'center',
    elevation: 5,
  },
  buttonModal: {
    width: w('68%'),
    height: h(5),
    backgroundColor: '#ffffff',
    borderRadius: w(2),
    marginBottom: h(3),
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: w(3),
  },
  buttonModalText: {
    color: 'black',
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
    backgroundColor: '#E8304E',
    paddingVertical: h(1.2),
    paddingHorizontal: w(10),
    borderRadius: w(1.5),
    elevation: 3,
    marginTop: h(1),
  },
});
