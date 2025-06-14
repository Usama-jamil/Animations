import React, {useState} from 'react';
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  FlatList,
} from 'react-native';
import {colors, fonts} from '../../utils/styles';
import {useTranslation} from 'react-i18next';
import moment from 'moment';
import Debit from '../../../assets/icons/debit.svg';
import Credit from '../../../assets/icons/credit.svg';
import { color } from '@rneui/base';

const WalletCard = ({item, index}) => {
 
  function formatDate(inputDate) {
    return moment(inputDate).format('DD-MM-YYYY [at] hh:mm A');
  }

  return (
    <TouchableOpacity
      style={[
        styles.head,
        {backgroundColor: colors.whiteGray},
      ]}>
      <View style={styles.main}>
        <Text allowFontScaling={false} style={styles.title}>
          {item?.booking?.note}
        </Text>
        <View style={styles.num_subtitle}>
          {item?.type === 'debit' ? (
            <Debit width={16} height={16} />
          ) : (
            <Credit width={16} height={16} />
          )}

          <Text allowFontScaling={false} style={styles.num}>
            {item?.amount}
          </Text>
          <Text
            allowFontScaling={false}
            style={[
              styles.num,
              {fontSize: 12, alignSelf: 'center', fontFamily: fonts.regular},
            ]}>
            {item?.booking?.currency?.code}
          </Text>
        </View>
      </View>
      <View style={styles.date}>
        <Text allowFontScaling={false} style={styles.date_txt}>
          {formatDate(item?.createdAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  head: {
    padding: 12,

    borderRadius: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.black,
    flex: 1,
  },
  num_subtitle: {
    flexDirection: 'row',
    gap: 3,
    alignItems: 'center',
  },
  num: {
    fontSize: 14,
    color: colors.black,
    fontFamily: fonts.semiBold,
  },
  main: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  date: {
    alignSelf: 'flex-end',
  },
  date_txt: {
    fontSize: 8,
    color: colors.black,
    fontFamily: fonts.regular,
  },
});

export default WalletCard;
