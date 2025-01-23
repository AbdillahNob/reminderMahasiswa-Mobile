import {View, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import {
  heightPercentageToDP as h,
  widthPercentageToDP as w,
} from '../utils/responsive';
import {useNavigation} from '@react-navigation/native';

const Buttons = ({teks, navigasi}) => {
  const navigation = useNavigation();
  return (
    <View>
      <TouchableOpacity
        style={{
          width: w(75),
          height: h(7),
          backgroundColor: '#0F4473',
          justifyContent: 'center',
          borderRadius: w(8),
        }}
        onPress={() => navigation.navigate(navigasi)}>
        <Text
          style={{
            color: 'white',
            textAlign: 'center',
            fontSize: w(6),
            textTransform: 'uppercase',
          }}>
          {teks}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Buttons;
