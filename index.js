/**
 * @format
 */

import {AppRegistry, Alert} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import notifee, {EventType} from '@notifee/react-native';

// Background event handler
notifee.onBackgroundEvent(async ({type, detail}) => {
  console.log('Event di latar belakang:', type, detail);

  // Tangani jenis event
  if (type === EventType.ACTION_PRESS && detail.pressAction.id === 'stop') {
    console.log('Tombol "Matikan Alarm" ditekan');
  }
});

AppRegistry.registerComponent(appName, () => App);
