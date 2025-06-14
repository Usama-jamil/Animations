import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

// Third Party
import moment from 'moment';

// Styles
import {colors, fontSizes, fonts} from '../../utils/styles';

// Assets
import BookingIcon from '../../../assets/icons/notification/booking.svg';
import AccountVerifyIcon from '../../../assets/icons/notification/accountVerify.svg';
import DiscountIcon from '../../../assets/icons/notification/discount.svg';
import ChatIcon from '../../../assets/icons/notification/chat.svg';
import {useNavigation} from '@react-navigation/native';
import {setNotificationRead} from '../../utils/notificationService';
import {useDispatch} from 'react-redux';

const NotificationCard = ({item, index}) => {
  const navigation = useNavigation();
  const [isLoading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const handlePress = () => {
    setNotificationRead({id: item._id, setLoading, dispatch});
    if (item.type === 'booking') {
      navigation.navigate('BookingDetail', {id: item?.body?.item});
    }
    if (item.type === 'rental') {
      navigation.navigate('ListingBookingDetail', {id: item?.body?.item});
    }
    if (item.type === 'conversation') {
      navigation.navigate('ChatDetail', {
        userId: item?.body?.item?._id,
        userName: item?.body?.item?.name,
        userImg: item?.body?.item?.image,
      });
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.itemRowContainer,
        !item?.isRead
          ? {
              backgroundColor: colors.whiteGray,
              borderRadius: 10,
              paddingHorizontal: 10,
              paddingVertical: 5,
            }
          : {
              borderBottomColor: colors.borderColor,
              borderBottomWidth: 1,
              padding: 1,
            },
      ]}
      onPress={handlePress}>
      <View style={{marginTop: 3}}>
        {item.type === 'booking' || item.type === 'rental'  ? (
          <BookingIcon />
        ) : item?.type === 'accountVerify' ? (
          <AccountVerifyIcon />
        ) : item?.type === 'discount' ? (
          <DiscountIcon />
        ) : item?.type === 'conversation' ? (
          <ChatIcon />
        ) : null}
      </View>
      <View style={{flex: 1}}>
        <Text allowFontScaling={false} style={styles.title} numberOfLines={1}>
          {item?.title}
        </Text>
        <Text allowFontScaling={false} style={styles.message} numberOfLines={3}>
          {item?.body?.message}
        </Text>
        <Text allowFontScaling={false} style={styles.date}>
          {moment(item?.createdAt).fromNow()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default NotificationCard;

const styles = StyleSheet.create({
  itemRowContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 5,
    gap: 10,
    marginHorizontal: 10,
  },
  title: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.bold,
    color: colors.black,
  },
  message: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.black,
    lineHeight: 20,
  },
  date: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.lightBlack,
    alignSelf: 'flex-end',
  },
});
