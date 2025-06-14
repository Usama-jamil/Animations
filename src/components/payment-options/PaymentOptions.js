import React from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import {fonts, colors} from '../../utils/styles';

const PaymentOption = ({iconSource, title, onPress}) => {
  return (
    <View style={styles.row}>
      <View style={styles.infoContainer}>
        <Image source={iconSource} style={styles.paymentIcon} />
        <Text style={styles.title}>{title}</Text>
      </View>
      <TouchableOpacity style={styles.paymentButton} onPress={onPress}>
        <Text style={styles.buttonText}>Link</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  paymentIcon: {
    width: 24,
    height: 24,
  },
  title: {
    fontFamily: fonts.medium,
    fontSize: 16,
  },
  paymentButton: {
    paddingVertical: 5,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'rgba(0, 0, 0, 0.05)',
    borderWidth: 1,
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.primary,
  },
});

export default PaymentOption;
