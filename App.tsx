import React, {useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {NavigationContainer} from '@react-navigation/native';
import SplashSc from './src/screens/SplashSc';
import SplashSc2 from './src/screens/SplashSc2';
import Login from './src/screens/Login';
import BuatAkun from './src/screens/crud/Akun';
import Dashboard from './src/screens/Dashboard';
import TambahJadwal from './src/screens/crud/Kuliah/TambahJadwal';
import EditJadwal from './src/screens/crud/Kuliah/EditJadwal';
import TambahTugas from './src/screens/crud/Tugas/TambahTugas';
import {
  getDatabase,
  buatAkun,
  buatJadwalKuliah,
  cekTabel,
  cekAllTabel,
  hapusTabel,
} from './src/Database/Database';

const Stack = createNativeStackNavigator();

const App = () => {
  useEffect(() => {
    const initApp = async () => {
      try {
        getDatabase();
        cekAllTabel();
      } catch (error) {
        console.log('Gagal menjalan Perintah Query', error);
      }
    };
    initApp();
  }, []);
  return (
    <>
      {/* <Notifikasi /> */}
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{headerShown: false}}>
          <Stack.Screen name="Splash" component={SplashSc} />
          <Stack.Screen name="Splash2" component={SplashSc2} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="BuatAkun" component={BuatAkun} />
          <Stack.Screen name="Dashboard" component={Dashboard} />
          <Stack.Screen name="TambahJadwal" component={TambahJadwal} />
          <Stack.Screen name="EditJadwal" component={EditJadwal} />
          <Stack.Screen name="TambahTugas" component={TambahTugas} />
          {/* <Stack.Screen
            name="ModalPesan"
            component={ModalPesan}
            options={{presentation: 'modal'}}
          /> */}
          {/* <Stack.Screen name="Notifikasi" component={Notifikasi} /> */}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

export default App;
