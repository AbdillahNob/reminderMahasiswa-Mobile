import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {
  widthPercentageToDP as w,
  heightPercentageToDP as h,
} from '../utils/responsive';
import {StackActions, useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getAkunDetail} from '../Database/Database';

const HeaderDashboard = ({idUser, dataJadwal, dataTugas}) => {
  const navigation = useNavigation();
  const [dataUser, setDataUser] = useState(null);
  const [hariIni, setHariIni] = useState([]);
  const [totalJadwal, setTotalJadwal] = useState(0);
  const [tugasHariIni, setTugasHariIni] = useState([]);
  const [totalTugas, setTotalTugas] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (idUser) {
        try {
          const hasil = await getAkunDetail(idUser);
          setDataUser(hasil[0] || null);
        } catch (error) {
          console.log('Error fetching user data:', error);
        }
      }
    };

    const fetchJadwal = async () => {
      if (dataJadwal && Array.isArray(dataJadwal)) {
        const now = new Date();
        const today = now.getDay();
        // console.log('Tangkah Jadwal : ', dataJadwal)

        // Pemetaan hari ke angka
        const hariKeAngka = {
          Minggu: 0,
          Senin: 1,
          Selasa: 2,
          Rabu: 3,
          Kamis: 4,
          Jumat: 5,
          Sabtu: 6,
        };

        const jadwalToday = dataJadwal.filter(
          item => hariKeAngka[item.hari] === today,
        );

        setHariIni(jadwalToday);
        setTotalJadwal(dataJadwal.length);
      } else {
        setHariIni([]);
        setTotalJadwal(0);
      }
    };

    const fetchTugas = async () => {
      if (dataTugas && Array.isArray(dataTugas)) {
        const now = new Date();

        // Format tanggal hari ini
        const todayDate = `${now.getDate().toString().padStart(2, '0')}/${(
          now.getMonth() + 1
        )
          .toString()
          .padStart(2, '0')}/${now.getFullYear()}`;

        // Filter tugas yang sesuai dengan tanggal hari ini
        const jadwalToday = dataTugas.filter(item => {
          if (item.tanggal && typeof item.tanggal === 'string') {
            return item.tanggal === todayDate;
          }
          return false;
        });

        setTugasHariIni(jadwalToday);
        setTotalTugas(dataTugas.length);
      } else {
        setTugasHariIni([]);
        setTotalTugas(0);
      }
    };

    fetchData();
    fetchJadwal();
    fetchTugas();
  }, [idUser, dataJadwal, dataTugas]);

  const logout = async () => {
    Alert.alert('INFO', 'Apakah anda yakin ingin Log Out?', [
      {text: 'Batal', style: 'cancel'},
      {
        text: 'Log Out',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('idUser');
            Alert.alert('INFO', 'Berhasil Logout', [
              {
                text: 'OK',
                onPress: () => {
                  navigation.reset({
                    index: 0,
                    routes: [{name: 'Login'}],
                  });
                },
              },
            ]);
          } catch (err) {
            console.log(`Gagal Logout: ${err}`);
          }
        },
      },
    ]);
  };

  const schedule = () => {
    const ketKuliah = [
      {label: 'Kuliah Hari ini', value: hariIni.length},
      {label: 'total kuliah', value: totalJadwal},
      {label: 'Tugas Hari ini', value: tugasHariIni.length},
      {label: 'total Tugas', value: totalTugas},
    ];
    return ketKuliah.map(({label, value}, key) => {
      return (
        <View key={key}>
          <View
            style={{
              flexDirection: 'column',
              alignItems: 'center',
              paddingHorizontal: w(2),
            }}>
            <Text
              style={{
                color: '#ffffff',
                fontSize: w(4),
                fontWeight: 'bold',
              }}>
              {value}
            </Text>
            <Text
              style={{
                color: '#ffffff',
                fontSize: w(3.2),
                textTransform: 'capitalize',
              }}>
              {label}
            </Text>
          </View>
        </View>
      );
    });
  };

  return (
    <View style={styles.header}>
      <View
        style={{
          marginTop: h(-2),
          marginRight: w(4),
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}>
        <Text
          style={{
            color: 'green',
            fontSize: w(3.5),
            fontWeight: 'bold',
            marginRight: w(1.8),
          }}>
          LOG OUT
        </Text>
        <TouchableOpacity onPress={() => logout()}>
          <Image
            source={require('../assets/icons/logOut.png')}
            resizeMode={'center'}
            style={{width: w(5), height: h(2.5)}}
          />
        </TouchableOpacity>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: h(2),
          justifyContent: 'space-between',
          paddingBottom: h(1),
        }}>
        <View
          style={{
            flexDirection: 'column',
            marginRight: w(-10),
            marginTop: h(-2.5),
          }}>
          <Text
            style={{
              color: '#ffffff',
              fontSize: w(5),
              fontWeight: 'bold',
              marginTop: h(2),
              marginLeft: w(3.5),
              marginRight: w(-20),
              textTransform: 'capitalize',
              letterSpacing: w(0.1),
              width: w(70),
            }}>
            Hai, {dataUser ? dataUser.namaLengkap : 'Pengguna'}
          </Text>
          <Text
            style={{
              color: '#ffffff',
              fontWeight: '300',
              fontSize: w(2.6),
              marginLeft: w(3.5),
              textTransform: 'capitalize',
              width: w(68),
            }}>
            Mahasiswa {dataUser ? dataUser.namaPerguruan : '-'}
          </Text>
        </View>
        <Image
          source={require('../assets/images/logoAlarm.png')}
          style={{
            width: w(16),
            height: h(8),
            marginRight: w(10),
            top: h(2),
          }}
          resizeMode="cover"
        />
      </View>
      <View
        style={{
          alignItems: 'flex-start',
          paddingLeft: w(3.5),
          flexDirection: 'row',
        }}>
        <Text
          style={{
            color: '#ffffff',
            fontSize: w(2.7),
            width: w(45),
          }}>
          Anda akan diingatkan sebanyak 2X dari setiap jadwal dan tugas kuliah
          anda
        </Text>
        <Image
          source={require('../assets/icons/alarm-clock.png')}
          resizeMode={'center'}
          style={{height: h(2), width: w(4), marginTop: h(0.8)}}
        />
      </View>

      <View
        style={{
          marginTop: h(1.5),
          flexDirection: 'row',
          justifyContent: 'center',
        }}>
        {schedule()}
      </View>

      <View
        style={{
          top: h(4.6),
          alignItems: 'center',
          marginTop: h(-2.2),
        }}>
        <View
          style={{
            backgroundColor: '#ffffff',
            width: w(70),
            height: h(0.3),
            borderRadius: w(5),
            elevation: 4,
          }}
        />
      </View>
    </View>
  );
};

export default HeaderDashboard;

const styles = StyleSheet.create({
  header: {
    width: w('100%'),
    paddingTop: h(5),
    paddingBottom: h(5),
    backgroundColor: '#2A2A2A',
    opacity: 0.94,
    justifyContent: 'center',
  },
});
