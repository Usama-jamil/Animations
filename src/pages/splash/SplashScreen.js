import React from 'react';
import {StyleSheet, Image, View} from 'react-native';
import {colors} from '../../utils/styles';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Image
        style={styles.spalshBgImg}
        source={require('../../../assets/images/splash.png')}
      />
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgrounds,
  },
  spalshBgImg: {
    width: 200,
    height: 100,
    resizeMode: 'contain',
  },
});
