import React from 'react';
import { StyleSheet, Image, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
// Styles
import { colors, fontSizes, fonts } from '../../utils/styles';
import OnSiteIcon from '../../../assets/icons/on_site.svg';
import CalendarIcon from '../../../assets/icons/calendar.svg';
import CallIcon from '../../../assets/icons/booking/call.svg';
import FastImage from 'react-native-fast-image';

const BookingCard = ({ navigation, item, route, index }) => {
  const { t } = useTranslation();
  const renderDefaultItem = () => (
    <TouchableOpacity
      style={[
        styles.itemContainer,
        { backgroundColor: colors.whiteGray },
      ]}
      onPress={() => navigation.navigate('BookingDetail', { id: item?._id })}>
      <View style={styles.rowContainer}>
        <FastImage
          source={{ uri: item?.services?.[0]?.service?.images?.[0] }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.contentContainer}>
          <Text allowFontScaling={false} style={styles.title}>
            {item?.services?.[0]?.service?.title}
          </Text>
          <View style={styles.priceContainer}>
            <Text allowFontScaling={false} style={styles.price}>
              {item?.total?.toFixed(2)}
            </Text>
            <Text allowFontScaling={false} style={styles.currency}>
              {item?.currency?.code}
            </Text>
          </View>
          {item.startTime && (
            <Text allowFontScaling={false} style={styles.category}>
              {item?.services?.[0]?.service?.time}
            </Text>
          )}
          {/* {item.services[0].service.category && (
            <Text allowFontScaling={false} style={styles.category}>{item.services[0].service.category.name}</Text>
          )} */}
          {item?.bookingFor && (
            <View style={styles.typeRowContainer}>
              {item?.bookingFor === 'homeservice' ? (
                <Image
                  style={styles.iconStyle}
                  source={require('../../../assets/icons/house-chimney-user.png')}
                />
              ) : (
                <OnSiteIcon />
              )}
              <Text allowFontScaling={false} style={[styles.type, { marginTop: 5 }]}>
                {item?.bookingFor === 'homeservice' ? t('homeService') : t('onSite')}
              </Text>
            </View>
          )}
          <Text allowFontScaling={false} style={styles.date}>
            {moment(item?.startTime).fromNow()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCalendarSyncItem = () => (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: colors.whiteGray },
      ]}
      onPress={() => navigation.navigate('BookingDetail', { id: item?._id })}>
      <View style={styles.firstSubContainer}>
        <FastImage
          style={styles.userImg}
          source={{ uri: item?.services[0]?.professional?.user?.image }}
        />
        <View
          style={[
            styles.firstSubContainer,
            { justifyContent: 'space-between', flex: 1 },
          ]}>
          <View>
            <Text
              allowFontScaling={false}
              style={[styles.nameText, { color: colors.black }]}>
              {item?.services?.[0]?.professional?.user?.name}
            </Text>
            <View style={styles.firstSubContainer}>
              <CalendarIcon style={styles.iconStyle} />
              <Text allowFontScaling={false} style={styles.dateText}>
                {moment(item?.date).format('DD-MM-YYYY')} at{' '}
                {moment(item.startTime).format('h:mm A')}
              </Text>
            </View>
            {item?.bookingFor && (
              <View style={styles.typeRowContainer}>
                {item?.bookingFor === 'homeservice' ? (
                  <Image
                    style={styles.iconStyle}
                    source={require('../../../assets/icons/house-chimney-user.png')}
                  />
                ) : (
                  <OnSiteIcon />
                )}
                <Text allowFontScaling={false} style={styles.type}>
                  {item?.bookingFor === 'homeservice' ? t('HomeService') : t('OnSite')}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.callOpacity}>
            <CallIcon style={styles.callIcon} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.firstSubContainer, { marginTop: 20 }]}>
        <FastImage
          style={styles.serviceImg}
          source={{ uri: item?.services[0]?.service?.images[0] }}
        />
        <View style={{ flex: 1 }}>
          <Text
            allowFontScaling={false}
            style={[styles.nameText, { color: colors.primary }]}>
            {item?.services[0]?.service?.title}
          </Text>
          <View
            style={[
              styles.rowContainer,
              { justifyContent: 'space-between', alignItems: 'center' },
            ]}>
            <Text allowFontScaling={false}>
              <Text allowFontScaling={false} style={styles.priceText}>
                {item?.services[0]?.service?.price?.toFixed(2)}
              </Text>
              <Text allowFontScaling={false} style={styles.dateText}>
                {' '}
                {item?.services[0]?.service?.currency?.code}{' '}
              </Text>
            </Text>

            <Text allowFontScaling={false} style={styles.sinceText}>
              {moment(item?.date).fromNow()}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return route?.name === 'CalenderSync'
    ? renderCalendarSyncItem()
    : renderDefaultItem();
};

export default BookingCard;

const styles = StyleSheet.create({
  itemContainer: {
    marginVertical: 10,
    borderRadius: 10,
    padding: 10,
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
  },
  title: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
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
    marginLeft: 2,
  },
  date: {
    fontSize: fontSizes.mSmall,
    fontFamily: fonts.regular,
    color: colors.black,
    alignSelf: 'flex-end',
    marginTop: -10,
  },
  container: {
    minHeight: 150,
    borderRadius: 10,
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 15,
    marginVertical: 8,
  },
  subContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  firstSubContainer: {
    flexDirection: 'row',

    gap: 5,
  },
  userImg: {
    width: 55,
    height: 55,
    borderRadius: 55 / 2,
    marginRight: 10,
  },
  nameText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 5,
  },
  iconStyle: {
    width: 16,
    height: 16,
    resizeMode: 'cover',
  },
  callIcon: {
    width: 20,
    height: 20,
    resizeMode: 'cover',
  },
  dateText: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.small,
    color: colors.black,
  },
  sinceText: {
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 24,
    color: colors.black,
  },
  priceText: {
    fontFamily: fonts.bold,
    fontSize: 20,
    lineHeight: 24,
    color: colors.black,
  },
  callOpacity: {
    width: 36,
    height: 36,
    borderRadius: 36 / 2,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceImg: {
    width: 57,
    height: 51,
    borderRadius: 8,
    marginRight: 10,
  },
});
