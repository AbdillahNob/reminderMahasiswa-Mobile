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
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getAkunDetail} from '../Database/Database';

const HeaderDashboard = ({idUser, dataJadwal}) => {
  const navigation = useNavigation();
  const [dataUser, setDataUser] = useState(null);
  const [hariIni, setHariIni] = useState([]);
  const [totalJadwal, setTotalJadwal] = useState(0);

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

    fetchData();
    fetchJadwal();
  }, [idUser, dataJadwal]);

  const logout = async () => {
    Alert.alert('INFO', 'Apakah anda yakin ingin Log Out?', [
      {text: 'Batal', style: 'cancel'},
      {
        text: 'Log Out',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('idUser');
            Alert.alert('INFO', 'Berhasil Logout', [
              {text: 'OKE', onPress: () => navigation.replace('Login')},
            ]);
          } catch (err) {
            console.log(`Gagal Logout: ${err}`);
          }
        },
      },
    ]);
  };

  const schedule = () => {
    return (
      <>
        <View
          style={{
            flexDirection: 'column',
            alignItems: 'center',
            paddingHorizontal: w(1.2),
          }}>
          <Text style={{color: '#ffffff', fontSize: w(4), fontWeight: 'bold'}}>
            {hariIni.length}
          </Text>
          <Text style={{color: '#ffffff', fontSize: w(3.2)}}>
            Jadwal Hari ini
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'column',
            alignItems: 'center',
            paddingHorizontal: w(1.2),
          }}>
          <Text style={{color: '#ffffff', fontSize: w(4), fontWeight: 'bold'}}>
            {totalJadwal}
          </Text>
          <Text style={{color: '#ffffff', fontSize: w(3.2)}}>Total Jadwal</Text>
        </View>
      </>
    );
  };

  return (
    <View style={styles.header}>
      <View
        style={{
          marginTop: h(-1),
          marginLeft: w(4),
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <TouchableOpacity onPress={() => logout()}>
          <Image
            source={require('../assets/icons/logOut.png')}
            resizeMode={'center'}
            style={{width: w(5), height: h(2.5)}}
          />
        </TouchableOpacity>
        <Text
          style={{
            color: 'green',
            fontSize: w(3.5),
            fontWeight: 'bold',
            marginLeft: w(1.5),
          }}>
          LOG OUT
        </Text>
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
            marginTop: h(1.2),
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
            }}>
            dosen {dataUser ? dataUser.namaPerguruan : '-'}
          </Text>
        </View>
        <Image
          source={require('../assets/images/logoAlarm.png')}
          style={{
            width: w(16),
            height: h(8),
            marginRight: w(5.5),
            marginTop: h(1),
          }}
          resizeMode="cover"
        />
      </View>

      <View
        style={{
          marginTop: h(3),
          paddingLeft: w(3.5),
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <Image
          source={require('../assets/icons/alarm-clock.png')}
          style={{width: w(5), height: h(4)}}
          resizeMode="center"
        />
        <Text
          style={{
            color: '#ffffff',
            fontSize: w(2.7),
            width: w(45),
            paddingLeft: w(2),
          }}>
          Anda akan diingatkan sebanyak 3X dari setiap jadwal mengajar anda
        </Text>
        {schedule()}
      </View>

      <View
        style={{
          top: h(4.6),
          alignItems: 'center',
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
    backgroundColor: '#0F4473',
    justifyContent: 'center',
  },
});
