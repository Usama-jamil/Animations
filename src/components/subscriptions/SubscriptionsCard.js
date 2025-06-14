import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';

// Styles
import { colors, fontSizes, fonts } from '../../utils/styles';

// Third Party
import moment from 'moment';

// Assets
import CalendarIcon from '../../../assets/icons/calendar.svg';
import OnSiteIcon from '../../../assets/icons/on_site.svg';
import { useNavigation, useRoute } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import { useTranslation } from 'react-i18next';

const SubscriptionsCard = ({ item, index }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation()
  console.log('item', item?.subscriptions?.detail);

  return (
    <TouchableOpacity
      style={[
        styles.itemContainer,
        {
          backgroundColor: colors.whiteGray,
        },
      ]}
      onPress={() =>
        navigation.navigate('SubscriptionDetail', {
          id: item?.subscriptions?.subscription?._id,
          subscriptionId: item?.subscriptions?._id,
          state: false,
          bookingId: item?._id,
          status: item?.status
        })
      }>
      <View style={styles.rowContainer}>
        <FastImage
          source={{ uri: item?.subscriptions?.subscription?.images[0] }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.contentContainer}>
          <Text allowFontScaling={false} style={styles.title}>
            {item?.subscriptions?.subscription?.title}
          </Text>
          <View style={styles.priceContainer}>
            <Text allowFontScaling={false} style={styles.price}>
              {item?.subscriptions?.subscription?.price?.toFixed(2)}
            </Text>
            <Text allowFontScaling={false} style={styles.currency}>
              {item?.currency?.code}
            </Text>
          </View>
          <Text allowFontScaling={false} style={styles.category}>
            {item?.subscriptions?.subscription?.category?.name}
          </Text>
          {/* <View style={styles.typeRowContainer}>
            <OnSiteIcon />
            <Text allowFontScaling={false} style={styles.type}>{item?.type}</Text>
          </View> */}
        </View>
      </View>
      <View style={styles.dateContainer}>
        <View style={styles.rowContainer}>
          <CalendarIcon />
          <Text allowFontScaling={false} style={styles.date}>
            {t('StartDate')}{' '}
            {moment(item?.subscriptions?.startDate).format('DD-MM-YYYY')}
          </Text>
        </View>
        <View style={styles.rowContainer}>
          <CalendarIcon />
          <Text allowFontScaling={false} style={styles.date}>
            {t('EndDate')}  {moment(item?.subscriptions?.endDate).format('DD-MM-YYYY')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default SubscriptionsCard;

const styles = StyleSheet.create({
  itemContainer: {
    marginVertical: 10,
    borderRadius: 10,
    padding: 10,
    backgroundColor: colors.lightBlue,
  },
  typeRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowContainer: {
    flexDirection: 'row',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  contentContainer: {
    marginLeft: 15,
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  price: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.bold,
    color: colors.black,
  },
  currency: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.black,
    marginLeft: 5,
  },
  category: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.black,
  },
  type: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.black,
    marginVertical: 10,
    marginLeft: 7,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  date: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.black,
    marginLeft: 7,
  },
});
