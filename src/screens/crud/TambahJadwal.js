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
import React, {useEffect, useState} from 'react';
import {
  heightPercentageToDP as h,
  widthPercentageToDP as w,
} from '../../utils/responsive';
import {StatusBar} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {DateTimePickerAndroid} from '@react-native-community/datetimepicker';
import {StackActions, useNavigation} from '@react-navigation/native';
import {insertJadwal} from '../../Database/Database';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TambahJadwal = () => {
  const [namaMataKuliah, setNamaMataKuliah] = useState('');
  const [semester, setSemester] = useState('');
  const [hari, setHari] = useState('');
  const [kelas, setKelas] = useState('');
  const [ruangan, setRuangan] = useState('');
  const [jamMulai, setJamMulai] = useState('');
  const [jamSelesai, setJamSelesai] = useState('');
  const [tipeJadwal, setTipeJadwal] = useState('');
  const [aktifkan, setAktifkan] = useState(false);
  const [idUser, setIdUser] = useState('');

  const navigation = useNavigation();
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('idUser');

        // Jika idUser ditemukan
        if (storedUserId) {
          setIdUser(storedUserId);
        } else {
          Alert.alert('ERROR', 'Akun Login tidak terdeteksi!', [
            {
              text: 'OKE',
              onPress: () => {
                navigation.dispatch(StackActions.replace('Dashboard'));
              },
            },
          ]);
        }
      } catch (err) {
        console.log(`Gagal memuat session: ${err}`);
      }
    };

    checkUserSession();
  }, []);

  const handleSubmission = async () => {
    console.log(idUser);
    if (
      idUser &&
      namaMataKuliah &&
      semester &&
      hari &&
      kelas &&
      ruangan &&
      jamMulai &&
      jamSelesai &&
      tipeJadwal
    ) {
      try {
        await insertJadwal(
          idUser,
          namaMataKuliah,
          semester,
          hari,
          kelas,
          ruangan,
          jamMulai,
          jamSelesai,
          tipeJadwal,
          aktifkan,
        );
        Alert.alert('INFO', 'Berhasil Menambah Data Jadwal', [
          {text: 'OKE', onPress: () => navigasi()},
        ]);
      } catch (err) {
        console.log(`Gagal mengirim Data Jadwal baru ${err}`);
      }
    } else {
      Alert.alert('INFO', 'Error Harap semua inputan di isi!');
    }
  };

  const navigasi = () => {
    navigation.dispatch(StackActions.replace('Dashboard'));
  };

  const input = () => {
    const data = [
      {
        label: 'Nama Mata Kuliah',
        placeholder: 'Masukkan Nama Mata Kuliah',
      },
      {
        label: 'Semester',
        placeholder: '--- Pilih Semester ---',
      },
      {
        label: 'Hari',
        placeholder: '--- Pilih Hari ---',
      },
      {
        label: 'Kelas',
        placeholder: 'Masukkan Nama Kelas',
      },
      {
        label: 'Ruangan',
        placeholder: 'Masukkan Ruangan',
      },
      {
        label: 'Jam Mulai',
        placeholder: 'Masukkan Jam Mulai',
      },
      {
        label: 'Jam Selesai',
        placeholder: 'Masukkan Jam Selesai',
      },
      {
        label: 'Tipe Jadwal',
        placeholder: '--- Pilih Tipe Jadwal ---',
      },
    ];

    return data.map(({label, placeholder}, key) => {
      return inputView(label, placeholder, key);
    });
  };
  const inputView = (label, placeholder, key) => {
    let content;
    if (label == 'Hari') {
      content = (
        <Picker
          selectedValue={hari}
          style={styles.picker}
          onValueChange={itemValue => setHari(itemValue)}>
          <Picker label="--Pilih Hari--" value="" style={{color: 'black'}} />
          <Picker.Item label="Senin" value="Senin" style={{color: 'black'}} />
          <Picker.Item label="Selasa" value="Selasa" style={{color: 'black'}} />
          <Picker.Item label="Rabu" value="Rabu" style={{color: 'black'}} />
          <Picker.Item label="Kamis" value="Kamis" style={{color: 'black'}} />
          <Picker.Item label="Jumat" value="Jumat" style={{color: 'black'}} />
          <Picker.Item label="Sabtu" value="Sabtu" style={{color: 'black'}} />
        </Picker>
      );
    } else if (label == 'Tipe Jadwal' || label == 'Semester') {
      let data = [];
      if (label == 'Semester') {
        data = [1, 2, 3, 4, 5, 6, 7];
      } else {
        data = ['Utama', 'Tambahan'];
      }

      content = (
        <Picker
          selectedValue={label == 'Semester' ? semester : tipeJadwal}
          style={styles.picker}
          onValueChange={itemValue =>
            label == 'Semester'
              ? setSemester(itemValue)
              : setTipeJadwal(itemValue)
          }>
          <Picker.Item label={placeholder} value="" style={{color: 'black'}} />
          {data.map((value, key) => (
            <Picker.Item
              key={key}
              label={value}
              value={value}
              style={{color: 'black'}}
            />
          ))}
        </Picker>
      );
    } else if (label == 'Jam Mulai' || label == 'Jam Selesai') {
      content = (
        <TextInput
          value={label == 'Jam Mulai' ? jamMulai : jamSelesai}
          placeholder={placeholder}
          placeholderTextColor={'black'}
          keyboardType="default"
          style={styles.textInput}
          onPress={() => validasiDate(label)}
        />
      );
    } else {
      content = (
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={'black'}
          style={styles.textInput}
          onChangeText={value => validasiInput(value, label)}
        />
      );
    }

    return (
      <View key={key} style={{marginTop: h(2.5)}}>
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
            backgroundColor: '#ffffff',
            elevation: 1,
            borderTopRightRadius: w(6),
            borderBottomRightRadius: w(6),
            marginLeft: w(8),
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          {content}
        </View>
      </View>
    );
  };

  // TIPE Inputan Jadwal
  const validasiDate = label => {
    DateTimePickerAndroid.open({
      mode: 'time',
      value: new Date(),
      onChange: (event, selectedTime) => {
        if (selectedTime) {
          label == 'Jam Mulai'
            ? setJamMulai(formatTime(selectedTime))
            : setJamSelesai(formatTime(selectedTime));
        }
      },
    });
  };

  // Format Inputan jadwal
  const formatTime = time => {
    const hours = String(time.getHours()).padStart(2, '0');
    const minutes = String(time.getMinutes()).padStart(2, '0');
    const seconds = String(time.getSeconds()).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
  };

  const validasiInput = (value, label) => {
    if (label == 'Nama Mata Kuliah') {
      setNamaMataKuliah(value);
    } else if (label == 'Kelas') {
      setKelas(value);
    } else if (label == 'Ruangan') {
      setRuangan(value);
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
          source={require('../../assets/images/mengajarTeknologi.jpg')}
          style={{width: w('100%'), height: h(40)}}
          resizeMode={'cover'}
        />
      </View>
      <ScrollView>
        <View style={styles.container}>
          <Text
            style={{
              fontSize: w(5.5),
              fontWeight: 'bold',
              textTransform: 'uppercase',
              textAlign: 'center',
              marginTop: h(3),
              marginBottom: h(1.5),
            }}>
            Buat Jadwal Mengajar
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

export default TambahJadwal;

const styles = StyleSheet.create({
  container: {
    width: w('100%'),
    backgroundColor: '#F0F4FF',
    borderTopLeftRadius: w(8),
    borderTopRightRadius: w(8),
  },
  picker: {
    paddingHorizontal: w('100%'),
    height: h(7),
  },
  textInput: {
    marginVertical: h(1),
    marginLeft: w(2),
    width: w(80),
    color: 'black',
  },
});
