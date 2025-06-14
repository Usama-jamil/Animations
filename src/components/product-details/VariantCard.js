import React, { useState } from 'react';
import { Text, View, StyleSheet, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, fonts } from '../../utils/styles';

const VariantCard = ({ item, isHorizontal, index, selected, currency }) => {
  const { t } = useTranslation();
  const [variantItem, setVariantItem] = useState({
    variantTitle: { label: t('variantTitle'), value: item?.variantTitle || '' },
    SizeType: { label: t('SizeType'), value: item?.sizeType?.title || '' },
    SizeValue: { label: t('SizeValue'), value: item?.sizeValue?.value || '' },
    Color: { label: t('Color'), value: item?.color || '' },
    PriceItem: {
      label: t('PriceItem'),
      value: `${(item?.price || 0).toFixed(2)} ${currency}`
    },

    totalStock: { label: t('totalStock'), value: item?.totalStock || '0' },
  });

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.whiteGray },
        isHorizontal ? styles.marginRight : styles.marginBottom,
        selected && styles.selectedBorder, // Apply selected border style
      ]}>
      {Object.keys(variantItem).map((key, index) => (
        <View key={index} style={styles.rowContainer}>
          <View
            style={[
              styles.titleContainer,
              isHorizontal ? styles.isHorizontal : styles.isVertical,
            ]}>
            {/* Display the label */}
            <Text allowFontScaling={false} style={styles.text}>
              {variantItem[key].label}
            </Text>
          </View>
          {/* Display the value */}
          <Text
            allowFontScaling={false}
            style={[
              styles.text,
              { textAlign: 'center' },
              isHorizontal ? styles.isHorizontal : styles.isVertical,
            ]}>
            {variantItem[key].value}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default VariantCard;

const styles = StyleSheet.create({
  container: {
    padding: 15,
    borderRadius: 10,
  },
  marginRight: {
    marginRight: 10,
  },
  marginBottom: {
    marginBottom: 10,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  titleContainer: {
    borderRightWidth: 1,
    borderRightColor: colors.grey,
    borderStyle: 'dashed',
    marginBottom: 3,
    paddingRight: 5,
  },
  isHorizontal: {
    width: 120,
  },
  isVertical: {
    width: (Dimensions.get('window').width - 40) / 2 - 20,
  },
  text: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.lightBlack,
    lineHeight: 17,
    paddingVertical: 5,
  },
  selectedBorder: {
    borderWidth: 1,
    borderColor: colors.primary, // Apply primary color as border
  },
});
