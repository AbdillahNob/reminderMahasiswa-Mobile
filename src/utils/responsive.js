import {Dimensions} from 'react-native';

// Dapatkan dimensi layar perangkat
const {width, height} = Dimensions.get('window');

// Konversi ukuran lebar menjadi persentase
export const widthPercentageToDP = percentage => {
  const screenWidth = parseFloat(percentage);
  return (width * screenWidth) / 100;
};

// Konversi ukuran tinggi menjadi persentase
export const heightPercentageToDP = percentage => {
  const screenHeight = parseFloat(percentage);
  return (height * screenHeight) / 100;
};
