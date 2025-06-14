import React from 'react';
import {StyleSheet, Image, Text, TouchableOpacity, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import moment from 'moment';
// Styles
import {colors, fontSizes, fonts} from '../../utils/styles';
import FastImage from 'react-native-fast-image';
import Clock from '../../../assets/icons/clock.svg';

const BookingListingCard = ({navigation, item, route, index}) => {
  const {t} = useTranslation();

  const renderDefaultItem = () => (
    <TouchableOpacity
      style={[styles.itemContainer, {backgroundColor: colors.whiteGray}]}
      onPress={() => navigation.navigate('ListingBookingDetail', {id: item?._id})}>
      <View style={styles.rowContainer}>
        <FastImage
          source={{uri: item?.listingDataSnapshot?.images?.[0]}}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.contentContainer}>
          <Text allowFontScaling={false} style={styles.title}>
            {item?.listingDataSnapshot?.name}
          </Text>
          <View style={styles.priceContainer}>
            <Text allowFontScaling={false} style={styles.price}>
              {item?.totalBill?.toFixed(2)}
            </Text>
            <Text allowFontScaling={false} style={styles.currency}>
              {item?.currency?.code}
            </Text>
          </View>
          {item?.bookingType === 'hourly' && (
            <View style={styles.pending}>
              <View style={styles.child_2}>
                <Text
                  allowFontScaling={false}
                  style={{
                    fontSize: 12,
                    fontFamily: fonts.regular,
                    color: colors.primary,
                  }}>
                  Hours
                </Text>
                <View style={[styles.child_2, {gap: 4}]}>
                  <Clock width={16} height={16} />
                  <Text allowFontScaling={false} style={styles.time}>
                    {item?.duration?.hours}
                  </Text>
                </View>
              </View>
              <View style={[styles.child_2, {marginTop: 5}]}>
                <Text
                  allowFontScaling={false}
                  style={{
                    fontSize: 12,
                    fontFamily: fonts.regular,
                    color: colors.primary,
                  }}>
                  Date
                </Text>
                <View style={[styles.child_2, {gap: 4}]}>
                  <Image
                    source={require('../../../assets/icons/calender.png')}
                    style={{width: 16, height: 16}}
                  />
                  <Text allowFontScaling={false} style={styles.time}>
                    {moment(item?.startTime).format('DD-MM-YYYY')}
                  </Text>
                </View>
              </View>
            </View>
          )}
          {item?.bookingType === 'daily' && (
            <View style={styles.pending}>
              <View style={styles.child_2}>
                <Text
                  allowFontScaling={false}
                  style={{
                    fontSize: 12,
                    fontFamily: fonts.regular,
                    color: colors.primary,
                  }}>
                  Date From
                </Text>
                <View style={[styles.child_2, {gap: 4}]}>
                  <Image
                    source={require('../../../assets/icons/calender.png')}
                    style={{width: 16, height: 16}}
                  />
                  <Text allowFontScaling={false} style={styles.time}>
                    {moment(item?.startTime).format('DD-MM-YYYY')}
                  </Text>
                </View>
              </View>
              <View style={[styles.child_2, {marginTop: 5}]}>
                <Text
                  allowFontScaling={false}
                  style={{
                    fontSize: 12,
                    fontFamily: fonts.regular,
                    color: colors.primary,
                  }}>
                  Date To
                </Text>
                <View style={[styles.child_2, {gap: 4}]}>
                  <Image
                    source={require('../../../assets/icons/calender.png')}
                    style={{width: 16, height: 16}}
                  />
                  <Text allowFontScaling={false} style={styles.time}>
                    {moment(item?.endTime).format('DD-MM-YYYY')}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return renderDefaultItem();
};

export default BookingListingCard;

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
  child_2: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
});
