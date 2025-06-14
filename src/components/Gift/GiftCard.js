import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { colors, fontSizes, fonts } from '../../utils/styles';
import ShoppingBagIcon from '../../../assets/icons/bag-shopping.svg';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

const GiftCard = ({ item }) => {
  const { t } = useTranslation();
  function formatDate(inputDate) {
    return moment(inputDate).format('DD-MM-YYYY [at] hh:mm A');
  }

  return item.source === 'store' ? (
    <TouchableOpacity
      style={[styles.head, { backgroundColor: colors.whiteGray }]}>
      <View style={styles.main}>
        <View style={[styles.circle, { backgroundColor: colors.primary }]}>
          <ShoppingBagIcon />
        </View>

        <View style={{ flex: 1 }}>
          <View style={styles.rowContainer}>
            <Text allowFontScaling={false} style={styles.title}>
              {item?.code}
            </Text>
            <View>
              <Text
                allowFontScaling={false}
                style={[styles.price, { fontSize: 14 }]}>
                {item?.amount}
                <Text
                  allowFontScaling={false}
                  style={[styles.currency, { fontSize: 12 }]}>
                  {' '}
                  {item?.currency?.code}
                </Text>
              </Text>
            </View>
          </View>

          <View style={styles.numSubtitle}>
            <Text allowFontScaling={false} style={styles.date}>
              {formatDate(item?.createdAt)}{' '}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  ) : (
    <TouchableOpacity
      style={[
        styles.head,
        {
          backgroundColor:
            item.id % 2 === 0 ? colors.lightSky : colors.lightYellow,
        },
      ]}>
      <View style={styles.main}>
        <Text allowFontScaling={false} style={styles.title}>
          {item?.code}
        </Text>

        <Text allowFontScaling={false} style={styles.price}>
          {item?.amount?.toFixed(2)}
          <Text allowFontScaling={false} style={styles.currency}>
            {' '}
            {item?.currency?.code}
          </Text>
        </Text>
      </View>
      <View style={styles.main}>
        <View style={styles.statusNew}>
          <Text allowFontScaling={false} style={styles.status}>
            Status:
            <Text
              allowFontScaling={false}
              style={[styles.status, { fontFamily: fonts.regular }]}>
              {' '}
              {item.type}{' '}
            </Text>
          </Text>
          <Text
            allowFontScaling={false}
            style={[styles.status, { fontFamily: fonts.regular }]}>
            {item.isUsed ? 'Used' : 'New'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  head: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
  },
  title: {
    fontSize: fontSizes.xSmall,
    fontFamily: fonts.medium,
    color: colors.black,
  },
  numSubtitle: {
    flexDirection: 'row',
    gap: 3,
    alignItems: 'center',
  },
  price: {
    fontSize: fontSizes.medium,
    color: colors.black,
    fontFamily: fonts.bold,
  },
  currency: {
    fontSize: fontSizes.xSmall,
    color: colors.black,
    fontFamily: fonts.medium,
  },
  main: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 10,
  },
  status: {
    fontSize: 14,
    color: colors.black,
    fontFamily: fonts.semiBold,
  },
  statusNew: {
    flexDirection: 'row',
    gap: 3,
    alignItems: 'center',
  },
  circle: {
    width: 47,
    height: 47,
    borderRadius: 47 / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateTitle: {
    alignSelf: 'center',
    gap: 5,
  },
  date: {
    fontSize: 8,
    fontFamily: fonts.regular,
    color: colors.black,
  },

  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default GiftCard;
