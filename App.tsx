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
import EditTugas from './src/screens/crud/Tugas/EditTugas';
import {
  getDatabase,
  buatAkun,
  buatJadwalKuliah,
  buatJadwalTugas,
  cekTabel,
  cekAllTabel,
  hapusTabel,
} from './src/Database/Database';
// import {GoogleSignin} from '@react-native-google-signin/google-signin';

// GoogleSignin.configure({
//   scopes: ['https://www.googleapis.com/auth/drive'], // Ubah scope agar bisa baca/tulis Drive
//   webClientId: 'YOUR_WEB_CLIENT_ID',
// });

const Stack = createNativeStackNavigator();

const App = () => {
  useEffect(() => {
    getDatabase();
    buatAkun();
    buatJadwalKuliah();
    buatJadwalTugas();
    cekAllTabel();
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
          <Stack.Screen name="EditTugas" component={EditTugas} />
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
