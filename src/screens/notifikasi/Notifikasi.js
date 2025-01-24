import React, {useEffect, useState} from 'react';
import {Alert, PermissionsAndroid, Platform} from 'react-native';
import notifee, {
  AndroidColor,
  AndroidImportance,
  EventType,
  TriggerType,
} from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getJadwalKuliah, getJadwalTugas} from '../../Database/Database';
import ModalPesan from './ModalPesan';

const Notifikasi = ({refreshTrigger, onUpdate}) => {
  const [idUser, setIdUser] = useState('');
  const [dataJadwal, setDataJadwal] = useState([]);
  const [dataTugas, setDataTugas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [dataModal, setDataModal] = useState(null);
  const [dataModalJenis, setDataModalJenis] = useState(null);
  const [type, setType] = useState(null);

  useEffect(() => {
    const initializeNotification = async () => {
      await requestPermissionNotifee();
      await createNotificationChannel();
      await cekUserSession();
      await cekDataStorage();
    };

    initializeNotification();

    // Foreground event listener
    const unsubscribeForeground = notifee.onForegroundEvent(
      async ({type, detail}) => {
        if (type === EventType.ACTION_PRESS) {
          const item = detail.notification.data?.item;
          const jenisModal = detail.notification.data?.jenisModal;
          const type = detail.notification.data?.type;

          if (!item || !jenisModal) {
            console.log(
              'Data dari jadwal yg aktif tidak ada atau jenisModal tidak ada !',
            );
            return;
          }
          if (detail.pressAction.id === 'stop') {
            await handleAlarmAction(item, jenisModal, type);
          } else if (detail.pressAction.id === 'open_modal') {
            await handleAlarmAction(item, jenisModal, type);
          }
        }
      },
    );

    const unsubscribeBackground = notifee.onBackgroundEvent(
      async ({type, detail}) => {
        try {
          if (type === EventType.ACTION_PRESS) {
            const item = detail.notification.data?.item;
            const jenisModal = detail.notification.data?.jenisModal;
            const type = detail.notification.data?.type;
            // console.log('Jadwal yg sedang aktif alarmnya', item);

            if (!item || !jenisModal) {
              console.log(
                'Data dari jadwal yg aktif tidak ada atau jenisModal tidak ada !',
              );
              return;
            }
            if (detail.pressAction.id === 'stop') {
              await handleAlarmAction(item, jenisModal, type);
            } else if (detail.pressAction.id === 'open_modal') {
              await handleAlarmAction(item, jenisModal, type);
            }
          }
        } catch (error) {
          console.log('Notifee onBackgroundEvet  error : ', error);
        }
      },
    );

    return () => {
      unsubscribeForeground();
      unsubscribeBackground;
    };
  }, []);

  useEffect(() => {
    if (idUser) {
      fetchJadwal(idUser);
    }
  }, [refreshTrigger, idUser]);

  useEffect(() => {
    if (dataJadwal.length > 0) {
      const sortedJadwal = dataJadwal.sort((a, b) => {
        const daysOfWeek = {
          Senin: 1,
          Selasa: 2,
          Rabu: 3,
          Kamis: 4,
          Jumat: 5,
          Sabtu: 6,
        };
        // Sorting Hari
        const dayA = daysOfWeek[a.hari] || 0;
        const dayB = daysOfWeek[b.hari] || 0;

        if (dayA !== dayB) return dayA - dayB;

        // Sorting Waktu
        const [hoursA, minutesA] = a.jamMulai.split(':').map(Number);
        const [hoursB, minutesB] = b.jamMulai.split(':').map(Number);

        return hoursA * 60 + minutesA - (hoursB * 60 + minutesB);
      });

      scheduleAlarm(sortedJadwal, 'Kuliah');
    }
    if (dataTugas.length > 0) {
      const sortedTugas = dataTugas.sort((a, b) => {
        const dateA = new Date(a.tanggal);
        const dateB = new Date(b.tanggal);
        return dateA - dateB;
      });
      scheduleAlarm(sortedTugas, 'Tugas');
    }
  }, [dataJadwal, dataTugas]);

  const cekUserSession = async () => {
    try {
      const storedIdUser = await AsyncStorage.getItem('idUser');
      if (storedIdUser) {
        setIdUser(storedIdUser);
      } else {
        console.log('Tidak User yang Login');
      }
    } catch (err) {
      console.error('Error checking user session:', err);
    }
  };

  const fetchJadwal = async userId => {
    try {
      const hasilK = await getJadwalKuliah(userId);
      const hasilT = await getJadwalTugas(userId);
      console.log('Data Tugas Notifikasi : ', hasilT);
      // console.log('Data Kuliah Notifikasi : ', hasilK);
      setDataJadwal(hasilK);
      setDataTugas(hasilT);
    } catch (err) {
      console.error('Error fetching schedule:', err);
    }
  };

  const cekDataStorage = async () => {
    try {
      const storedData = await AsyncStorage.getItem('dataModalStorage');
      const storedJenis = await AsyncStorage.getItem('jenisModalStorage');

      if (storedData && storedJenis) {
        setDataModal(JSON.parse(storedData));
        setDataModalJenis(JSON.parse(storedJenis));
        setShowModal(true);
      }
    } catch (err) {
      console.error('Error loading stored modal data:', err);
    }
  };

  const requestPermissionNotifee = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Notification permission granted.');
      } else {
        console.log('Notification permission denied.');
      }
    }
  };

  const createNotificationChannel = async () => {
    await notifee.createChannel({
      id: 'alarm-channel-v3',
      name: 'Alarm Pengingat Jadwal',
      importance: AndroidImportance.HIGH,
      sound: 'alarm_tone',
      vibration: true,
    });
  };

  const scheduleAlarm = async (schedules, type) => {
    const now = new Date();

    for (const item of schedules) {
      // Validasi Alarm yg Aktif
      if (!item.aktifkan) continue;

      let alarmDate;

      // Vadliasi Notifikasi Tugas atau Kuliah
      if (type === 'Tugas') {
        // if(item.kumpul) continue;

        const [day, month, year] = item.tanggal.split('/').map(Number);
        const [hours, minutes] = item.pukul.split(':').map(Number);

        alarmDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
      } else {
        const daysOfWeek = {
          Senin: 1,
          Selasa: 2,
          Rabu: 3,
          Kamis: 4,
          Jumat: 5,
          Sabtu: 6,
        };
        const hariAngka = daysOfWeek[item.hari];
        if (!hariAngka) continue;

        const [hours, minutes] = item.jamMulai.split(':').map(Number);
        alarmDate = new Date(now);
        alarmDate.setDate(now.getDate() + ((hariAngka - now.getDay() + 7) % 7));
        alarmDate.setHours(hours, minutes, 0, 0);
      }

      const secondNotificationTime = new Date(alarmDate);
      secondNotificationTime.setMinutes(alarmDate.getMinutes() - 15);

      const alarmTimes = [
        {
          label: '15 Menit Sebelum',
          time: secondNotificationTime,
          jenisModal: 'sebelum 15',
        },
        {label: 'Saatnya masuk', time: alarmDate, jenisModal: 'sekarang'},
      ];

      for (const {label, time, jenisModal} of alarmTimes) {
        if (time >= now) {
          await notifee.createTriggerNotification(
            {
              title: '⏰ Alarm Berbunyi!',
              body:
                type == 'Tugas'
                  ? `Pengingat ${label} Tugas : ${item.namaTugas} Jadwal : ${item.pukul} pada Tanggal : ${item.tanggal}`
                  : `Pengingat ${label} Jadwal : ${item.jamMulai} pada ${item.hari}`,
              android: {
                channelId: 'alarm-channel-v3',
                color: AndroidColor.RED,
                sound: 'alarm_tone',
                ongoing: true,
                loopSound: true,
                importance: AndroidImportance.HIGH,
                fullScreenAction: {
                  id: 'default',
                  launchActivity: 'default',
                },
                pressAction: {
                  id: 'open_modal',
                  launchActivity: 'default',
                },
                actions: [
                  {
                    title: '🛑 Matikan Alarm',
                    pressAction: {
                      id: 'stop',
                      launchActivity: 'default',
                    },
                  },
                ],
              },
              data: {
                jenisModal: jenisModal,
                item: item,
                type: type,
              },
            },
            {
              type: TriggerType.TIMESTAMP,
              timestamp: time.getTime(),
              alarmManager: {allowWhileIdle: true},
            },
          );
        }
      }
      console.log(`Jadwal Alarm 1 hari Sblm: ${firstNotificationTime}`);
      console.log(`Jadwal Alarm 15 Menit Sblm: ${secondNotificationTime}`);
      console.log(`Jadwal Alarm Asli: ${alarmDate}`);
    }
  };

  const handleAlarmAction = async (item, jenisModal, type) => {
    await stopAlarm();

    // Apabila Notifikasi Bunyi, utk menghindari create ulang Async Storage setelah apliksai di tutup dilatar belakang
    await AsyncStorage.setItem('dataModalStorage', JSON.stringify(item));
    await AsyncStorage.setItem('jenisModalStorage', JSON.stringify(jenisModal));

    setDataModal(item);
    setDataModalJenis(jenisModal);
    setType(type);
    setShowModal(true);
  };

  const stopAlarm = async () => {
    try {
      await notifee.cancelAllNotifications();
      console.log('All notifications canceled.');
    } catch (error) {
      console.log('Stop Alarm error : ', error);
    }
  };

  return (
    <>
      {showModal && (
        <ModalPesan
          dataModal={dataModal}
          dataModalJenis={dataModalJenis}
          type={type}
          onUpdate={(id, kumpul) => {
            onUpdate(id, kumpul); // Propagate the update to the parent
            setShowModal(false);
          }}
        />
      )}
    </>
  );
};

export default Notifikasi;
