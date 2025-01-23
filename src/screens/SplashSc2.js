import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {StatusBar} from 'react-native';
import {
  widthPercentageToDP as w,
  heightPercentageToDP as h,
} from '../utils/responsive';
import {StackActions, useNavigation} from '@react-navigation/native';
import Buttons from '../components/Buttons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SplashSc2 = () => {
  const navigation = useNavigation();
  const [cekPaham, setCekPaham] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={'#0F4473'} barStyle={'light-content'} />
      <View style={styles.container2}>
        <Text
          style={{
            fontWeight: 'bold',
            fontSize: w(8),
            textAlign: 'center',
          }}>
          Pengingat Jadwal Mengajar Dosen
        </Text>
        <Text
          style={{
            fontSize: w(3.6),
            marginTop: h(1.5),
            textAlign: 'center',
            color: '#948B8B',
            paddingHorizontal: w(12),
          }}>
          Aplikasi ini akan mengingatkan terkait jadwal mengajar anda secara
          otomatis dan memberikan feedback terhadap mahasiswa dan staf FO (Front
          Office)
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: h(3),
            paddingRight: w(7),
          }}>
          <TouchableOpacity
            style={{
              width: w(4.2),
              height: h(2),
              borderWidth: w(0.2),
              backgroundColor: '#ffffff',
              marginTop: h(0.2),
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: w(2),
            }}
            onPress={() => setCekPaham(!cekPaham)}>
            {cekPaham ? (
              <Image
                source={require('../assets/icons/check.png')}
                style={{width: w(3.7), height: h(4)}}
                resizeMode="center"
              />
            ) : null}
          </TouchableOpacity>
          <Text style={{marginLeft: w(1.7)}}>
            Saya telah paham atas penjelasan diatas
          </Text>
        </View>
        {cekPaham ? (
          <TouchableOpacity
            style={{
              width: w(75),
              height: h(7),
              marginTop: h(2.5),
              justifyContent: 'center',
              backgroundColor: '#0F4473',
              borderRadius: w(5),
            }}
            onPress={() => navigation.dispatch(StackActions.replace('Login'))}>
            <Text
              style={{
                textAlign: 'center',
                color: 'white',
                fontSize: w(5.5),
                fontWeight: 'bold',
                marginBottom: h(0.5),
              }}>
              Selanjutnya
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <View
        style={{
          width: w('100%'),
          position: 'absolute',
          top: h(1.4),
          alignItems: 'center',
        }}>
        <Image
          source={require('../assets/images/mengajarTeknologi.jpg')}
          style={{
            height: h(55),
            width: w(75),
            borderTopLeftRadius: w(5),
            borderTopRightRadius: w(5),
            borderBottomLeftRadius: w(38),
            borderBottomRightRadius: w(38),
          }}
          resizeMode="cover"
        />
      </View>
    </View>
  );
};

export default SplashSc2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F4473',
    justifyContent: 'flex-end',
  },
  container2: {
    width: w('100%'),
    height: h(74.5),
    backgroundColor: '#ffffff',
    paddingTop: h(34.5),
    alignItems: 'center',
  },
});
