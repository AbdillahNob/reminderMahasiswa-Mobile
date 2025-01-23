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
} from '../../../utils/responsive';
import {StatusBar} from 'react-native';
import {DateTimePickerAndroid} from '@react-native-community/datetimepicker';
import {StackActions, useNavigation} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import {insertJadwalKuliah} from '../../../Database/Database';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EditTugas = () => {
  const [namaMataKuliah, setNamaMataKuliah] = useState('');
  const [namaTugas, setNamaTugas] = useState('');
  const [kelas, setKelas] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [pukul, setPukul] = useState('');
  const [idUser, setIdUser] = useState('');

  const route = useRoute();
  const navigation = useNavigation();
  const dataTugas = route.params.dataJadwal;

  const handleSubmission = async () => {
    const updateNamaMatkul = namaMataKuliah || dataTugas.namaMatkul;
    const updateNamaTugas = namaTugas || dataTugas.namaTugas;
    const updateTanggal = tanggal || dataTugas.tanggal;
    const updateKelas = kelas || dataTugas.kelas;
    const updatePukul = pukul || dataTugas.pukul;

    try {
      await insertJadwalKuliah(
        dataTugas.idTugas,
        updateNamaMatkul,
        updateNamaTugas,
        updateTanggal,
        updateKelas,
        updatePukul,
      );
      Alert.alert('INFO', 'Berhasil Menambah Data Jadwal', [
        {text: 'OKE', onPress: () => navigasi()},
      ]);
    } catch (err) {
      console.log(`Gagal mengirim Data Jadwal baru ${err}`);
    }
  };

  const navigasi = () => {
    navigation.dispatch(StackActions.replace('Dashboard'));
  };

  const input = () => {
    const data = [
      {
        label: 'Nama Mata Kuliah',
        placeholder: dataTugas.namaMatkul,
      },
      {label: 'Nama Tugas', placeholder: dataTugas.namaTugas},
      {
        label: 'Tanggal',
        placeholder: dataTugas.tanggal,
      },
      {
        label: 'Kelas',
        placeholder: dataTugas.kelas,
      },

      {
        label: 'Pukul',
        placeholder: dataTugas.pukul,
      },
    ];

    return data.map(({label, placeholder}, key) => {
      return inputView(label, placeholder, key);
    });
  };
  const inputView = (label, placeholder, key) => {
    let content;
    if (label == 'Pukul') {
      content = (
        <TextInput
          placeholderTextColor={'black'}
          placeholder={placeholder}
          keyboardType="default"
          style={styles.textInput}
          onPress={() => validasiDate(label)}
        />
      );
    } else if (label == 'Tanggal') {
      content = (
        <TextInput
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
      mode: label == 'Tanggal' ? 'date' : 'time',
      value: new Date(),
      onChange: (event, selectedTime) => {
        if (selectedTime) {
          label == 'Pukul'
            ? setPukul(formatTime(selectedTime))
            : setTanggal(selectedTime);
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
    } else if (label == 'Nama Tugas') {
      setNamaTugas(value);
    } else if (label == 'Kelas') {
      setKelas(value);
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
          source={require('../../../assets/images/mengajarTeknologi.jpg')}
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
            Edit Jadwal Tugas
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
                backgroundColor: '#2A2A2A',
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

export default EditTugas;

const styles = StyleSheet.create({
  container: {
    width: w('100%'),
    backgroundColor: '#F5F5F5',
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
