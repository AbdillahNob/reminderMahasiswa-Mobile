import {
  Image,
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {
  heightPercentageToDP as h,
  widthPercentageToDP as w,
} from '../../utils/responsive';
import {StatusBar} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {insertAkun, getAkun} from '../../Database/Database';

const BuatAkun = () => {
  const navigation = useNavigation();
  const [namaLengkap, setNamaLengkap] = useState('');
  const [nidn, setNidn] = useState('');
  const [namaPerguruan, setNamaPerguruan] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [konfirPass, setKonfirPass] = useState('');
  const [data, setData] = useState('');

  useEffect(() => {
    // Utk cek data" ditabel AkunUser
    const fetchData = async () => {
      try {
        const hasil = await getAkun();
        setData(hasil);
      } catch (error) {
        console.log(`Gagal AMBIL DATA : ${error}`);
      }
    };
    fetchData();
  }, []);

  const handleSubmission = async () => {
    if (
      namaLengkap &&
      nidn &&
      namaPerguruan &&
      username &&
      password &&
      konfirPass
    ) {
      try {
        if (password == konfirPass) {
          await insertAkun(
            namaLengkap,
            nidn,
            namaPerguruan,
            username,
            password,
          );
          Alert.alert('INFO', 'Berhasil Menambahkan Akun', [
            {text: 'OKE', onPress: () => navigasi()},
          ]);
        } else {
          Alert.alert(
            'info',
            'Konfirmasi Password anda harus sama dengan password',
          );
        }
      } catch (error) {
        console.log(`Gagal menyimpan Data : ${error}`);
      }
    } else {
      Alert.alert('ERROR', 'Harap isi semua kolom inputan!');
    }
  };

  const navigasi = () => {
    navigation.navigate('Login');
  };

  const input = () => {
    const data = [
      {
        label: 'Nama Lengkap',
        placeholder: 'Masukkan Nama Lengkap Anda',
        icon: require('../../assets/icons/namaLengkap.png'),
      },
      {
        label: 'Nidn',
        placeholder: 'Masukkan Nidn Anda',
        icon: require('../../assets/icons/Nidn.png'),
      },
      {
        label: 'Nama Perguruan Tinggi/Institut',
        placeholder: 'Masukkan Nama Perguruan Anda',
        icon: require('../../assets/icons/perguruanTinggi.png'),
      },
      {
        label: 'Username',
        placeholder: 'Masukkan Username Anda',
        icon: require('../../assets/icons/User.png'),
      },
      {
        label: 'Password',
        placeholder: 'Masukkan Password Anda',
        icon: require('../../assets/icons/Password.png'),
      },
      {
        label: 'Konfirmasi Password',
        placeholder: 'Konfirmasi Password Anda',
        icon: require('../../assets/icons/Password.png'),
      },
    ];

    return data.map(({label, placeholder, icon}, key) => (
      <View key={key} style={{marginTop: h(2.4)}}>
        <Text
          style={{
            marginLeft: w(8),
            marginBottom: h(1),
            fontWeight: 'bold',
            fontSize: w(4),
          }}>
          {label}
        </Text>
        <View
          style={{
            width: w(85),
            height: h(5),
            backgroundColor: '#ffffff',
            elevation: 1,
            borderTopRightRadius: w(6),
            borderBottomRightRadius: w(6),
            marginLeft: w(8),
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Image
            source={icon}
            style={{width: w(4), height: h(4), marginLeft: w(3)}}
            resizeMode={'center'}
          />
          {label == 'Password' || label == 'Konfirmasi Password' ? (
            <TextInput
              placeholder={placeholder}
              style={styles.textInput}
              placeholderTextColor={'black'}
              onChangeText={value => validasiInput(value, label)}
              secureTextEntry={true}
            />
          ) : (
            <TextInput
              placeholder={placeholder}
              placeholderTextColor={'black'}
              style={styles.textInput}
              onChangeText={value => validasiInput(value, label)}
            />
          )}
        </View>
      </View>
    ));
  };

  const validasiInput = (value, label) => {
    switch (label) {
      case 'Nama Lengkap':
        setNamaLengkap(value);
        break;
      case 'Nidn':
        setNidn(value);
        break;
      case 'Nama Perguruan Tinggi/Institut':
        setNamaPerguruan(value);
        break;
      case 'Username':
        setUsername(value);
        break;
      case 'Password':
        setPassword(value);
        break;
      case 'Konfirmasi Password':
        setKonfirPass(value);
        break;
      default:
        break;
    }
  };

  return (
    <View style={{marginTop: h(20), flex: 1}}>
      <StatusBar
        backgroundColor={'transparent'}
        translucent={true}
        barStyle={'light-content'}
      />
      <View style={{position: 'absolute', top: h(-20)}}>
        <Image
          source={require('../../assets/images/dosenMengajar.jpg')}
          style={{width: w('100%'), height: h(40)}}
          resizeMode={'cover'}
        />
      </View>
      <ScrollView>
        <View style={styles.container}>
          <Text
            style={{
              fontSize: w(7),
              fontWeight: 'bold',
              textTransform: 'uppercase',
              textAlign: 'center',
              marginTop: h(3),
              paddingBottom: h(2),
            }}>
            Buat Akun
          </Text>
          {input()}
          <View
            style={{
              alignItems: 'center',
              marginBottom: h(4),
              marginTop: h(3.4),
            }}>
            <TouchableOpacity
              style={{
                width: w(75),
                height: h(7),
                backgroundColor: '#0F4473',
                justifyContent: 'center',
                borderRadius: w(8),
              }}
              onPress={() => handleSubmission()}>
              <Text
                style={{
                  color: 'white',
                  textAlign: 'center',
                  fontSize: w(6),
                  textTransform: 'uppercase',
                }}>
                buat
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default BuatAkun;

const styles = StyleSheet.create({
  container: {
    width: w('100%'),
    backgroundColor: '#F0F4FF',
    borderTopLeftRadius: w(8),
    borderTopRightRadius: w(8),
  },
  textInput: {
    marginLeft: w(2),
    color: 'black',
    width: w(80),
  },
});
