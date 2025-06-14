import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {fontSizes, fonts, colors} from '../../utils/styles';
const BookingWaiting = ({image, title, description}) => {
  return (
    <View style={styles.waitingSection}>
      {image}

      <Text
        allowFontScaling={false}
        style={[styles.waitingTitle, {marginTop: 15}]}>
        {title}
      </Text>
      <Text allowFontScaling={false} style={styles.waitingSubtitle}>
        {description}
      </Text>
    </View>
  );
};

export default BookingWaiting;

const styles = StyleSheet.create({
  waitingSection: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  waitingTitle: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
  waitingSubtitle: {
    fontSize: fontSizes.mSmall,
    fontFamily: fonts.regular,
    color: colors.lightBlack,
  },
});
