import {View, Text, Image, StyleSheet, Alert} from 'react-native';
import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';
import {StackActions} from '@react-navigation/native';
import {useNavigation} from '@react-navigation/native';
import {
  widthPercentageToDP as w,
  heightPercentageToDP as h,
} from '../utils/responsive';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SplashSc = () => {
  const navigation = useNavigation();

  useEffect(() => {
    setTimeout(() => {
      const checkUserSession = async () => {
        try {
          const storedUserId = await AsyncStorage.getItem('idUser');
          if (storedUserId) {
            // Jika idUser ditemukan, arahkan ke Dashboard
            navigation.dispatch(StackActions.replace('Dashboard'));
          } else {
            navigation.dispatch(StackActions.replace('Splash2'));
          }
        } catch (err) {
          console.log(`Gagal memuat session: ${err}`);
        }
      };

      checkUserSession();
    }, 2500);
  });

  return (
    <View style={style.container}>
      <StatusBar backgroundColor={'#0F4473'} barStyle={'light-content'} />
      <View style={{alignItems: 'center'}}>
        <Image
          source={require('../assets/images/logoAlarm.png')}
          style={{width: w(30), height: h(15)}}
          resizeMode="contain"
        />
        <Text
          style={{
            textAlign: 'center',
            marginTop: h(0.8),
            fontSize: w(8),
            color: '#F0A7A7',
          }}>
          ALARM APP
        </Text>
      </View>
    </View>
  );
};

export default SplashSc;

const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F4473',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
