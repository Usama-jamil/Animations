import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {colors, fontSizes, fonts} from '../../utils/styles';
import Logo from '../../../assets/images/logo/logo.svg';
import UsersIcon from '../../../assets/icons/user_icon_2.svg';
import BellIcon from '../../../assets/icons/header/bell.svg';
import BackArrowIcon from '../../../assets/icons/header/back-arrow-black.svg';
import EditIcon from '../../../assets/icons/auth/edit.svg';
import Crown from '../../../assets/icons/crown.svg';
import Setting from '../../../assets/icons/more/gear.svg';
import Info from '../../../assets/icons/circle-information.svg';
import Location from 'react-native-vector-icons/Feather';

import {useDispatch, useSelector} from 'react-redux';
import {setUser} from '../../store/slices/user';
import Toast from 'react-native-toast-message';
import Popover from 'react-native-popover-view';
import {useTranslation} from 'react-i18next';
import {Badge} from '@rneui/base';
import {setNotificationRead} from '../../utils/notificationService';
import GuestModal from '../guest-modal/GuestModal';
import FastImage from 'react-native-fast-image';
import Profile from '../../pages/profile/Profile';
import SelectDropdown from 'react-native-select-dropdown';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
const CustomHeader = ({
  title,
  isProfile,
  location,
  handleLocationPress,
  handleBookingTypeChange,
}) => {
  const dispatch = useDispatch();
  const {newNotification, userInfo, unreadCount} = useSelector(
    state => state.auth,
  );
  const navigation = useNavigation();
  const route = useRoute();
  const {t} = useTranslation();
  const [loading, setLoading] = useState(false);
  const [guestPopUp, setGuestPopUp] = useState(false);
  const {user} = useSelector(state => state.auth);

  const skip = () => {
    dispatch(setUser(userInfo));
  };

  const giftmessage = () => {
    Toast.show({
      type: 'success',
      position: 'top',
      topOffset: 20,
      text1: t('Error'),
      text2: t('closingTime'),
      visibilityTime: 3000,
    });
  };

  const markAllAsRead = async () => {
    await setNotificationRead({markall: true, setLoading, dispatch});
    Toast.show({
      type: 'success',
      position: 'bottom',
      bottomOffset: 20,
      text1: t('success'),
      text2: `${t('markAllasRead')} ${t('success')}`,

      text1Style: {fontSize: 12},
      text2Style: {fontSize: 9},
      visibilityTime: 3000,
    });
    navigation.navigate('Home', {screen: 'Home'});
  };

  const emojisWithIcons = [
    {title: t('service'), value: 'main'},
    {title: t('rental'), value: 'rental'},
  ];

  return (
    <View style={styles.headerContainer}>
      <View style={styles.parentContainer}>
        <View style={styles.leftContainer}>
          {route.name !== 'Booking' && !isProfile && (
            <>
              {route.name !== 'IntrestedCategory' && route.name !== 'Login'  && (
                <>
                  {route.name === 'Home' ? (
                    <Logo width={125} height={25} />
                  ) : (
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                      <BackArrowIcon
                        width={24}
                        height={24}
                        style={styles.navigateIcon}
                      />
                    </TouchableOpacity>
                  )}
                </>
              )}
            </>
          )}
          {isProfile && (
            <View style={styles.profile_left}>
              <TouchableOpacity
                onPress={() =>
                  !user?.isGuest
                    ? navigation.navigate('Profile')
                    : setGuestPopUp(true)
                }>
                <FastImage
                  source={{uri: user?.image}}
                  style={styles.image}
                  resizeMode="cover"
                />
              </TouchableOpacity>
              <View>
                <Text style={styles.user_name}>
                  Welcome{' '}
                  <Text
                    style={[
                      styles.user_name,
                      {color: colors.primary, fontFamily: fonts.bold},
                    ]}
                    numberOfLines={1}>
                    {' '}
                    {user?.name}{' '}
                  </Text>
                </Text>
                <TouchableOpacity
                  style={[styles.profile_left, {gap: 5, marginTop: 5}]}
                  onPress={handleLocationPress}>
                  <Location name="map-pin" size={18} />
                  <Text style={styles.user_loc} numberOfLines={1}>
                    {location}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          <View
            style={[
              styles.middleContainer,
              route.name === 'ServiceDetails'
                ? {flex: 1, alignItems: 'flex-start'}
                : null,
            ]}>
            <Text allowFontScaling={false} style={styles.title}>
              {title}
            </Text>
          </View>
        </View>

        {(route.name === 'Login' || route.name === 'Signup') && (
          <View style={{alignSelf: 'flex-start'}}>
            <Logo width={125} height={25} />
          </View>
        )}
        <View
          style={[
            styles.rightContainer,
            route.name === 'Notifications' && {width: null},
          ]}>
          {route.name === 'Home' ? (
            <>
              <TouchableOpacity
                onPress={() =>
                  !user?.isGuest
                    ? navigation.navigate('Notifications')
                    : setGuestPopUp(true)
                }
                style={{
                  position: 'relative',
                  right: Platform.OS === 'android' ? 10 : 0,
                }}>
                <BellIcon width={24} height={24} />

                {unreadCount > 0 && (
                  <Badge
                    value={unreadCount} // Display unread count
                    status="error" // Red badge color
                    containerStyle={styles.badgeContainer}
                  />
                )}
              </TouchableOpacity>
            </>
          ) : route.name === 'Profile' ? (
            <TouchableOpacity
              onPress={() =>
                !user?.isGuest
                  ? navigation.navigate('EditProfile')
                  : setGuestPopUp(true)
              }>
              <EditIcon width={24} height={24} />
            </TouchableOpacity>
          ) : route.name === 'GiftCards' ? (
            <Popover
              popoverStyle={{backgroundColor: colors.popBg}}
              from={
                <TouchableOpacity onPress={giftmessage}>
                  <Info width={24} height={24} />
                </TouchableOpacity>
              }>
              <Text allowFontScaling={false} style={styles.gift_text}>
                You can share gift cards with love ones to apply while ordering.
              </Text>
            </Popover>
          ) : route.name === 'CalenderSync' ? (
            <TouchableOpacity
              onPress={() => navigation.navigate('SyncSetting')}>
              <Setting width={24} height={24} />
            </TouchableOpacity>
          ) : route.name === 'IntrestedCategory' ? (
            <TouchableOpacity onPress={skip}>
              <Text allowFontScaling={false} style={styles.skipText}>
                {t('skip')}
              </Text>
            </TouchableOpacity>
          ) : route.name === 'Booking' ? (
            <>
              <SelectDropdown
                data={emojisWithIcons}
                onSelect={handleBookingTypeChange}
                renderButton={(selectedItem, isOpened) => {
                  return (
                    <View style={styles.dropdownButtonStyle}>
                      {selectedItem && (
                        <Icon
                          name={selectedItem.icon}
                          style={styles.dropdownButtonIconStyle}
                        />
                      )}
                      <Text style={styles.dropdownButtonTxtStyle}>
                        {(selectedItem && selectedItem.title) || t('service')}
                      </Text>
                      <Icon
                        name={isOpened ? 'chevron-up' : 'chevron-down'}
                        style={styles.dropdownButtonArrowStyle}
                      />
                    </View>
                  );
                }}
                renderItem={(item, index, isSelected) => {
                  return (
                    <View
                      style={{
                        ...styles.dropdownItemStyle,
                        ...(isSelected && {backgroundColor: '#D2D9DF'}),
                      }}>
                      <Icon
                        name={item.icon}
                        style={styles.dropdownItemIconStyle}
                      />
                      <Text style={styles.dropdownItemTxtStyle}>
                        {item.title}
                      </Text>
                    </View>
                  );
                }}
                showsVerticalScrollIndicator={false}
                dropdownStyle={styles.dropdownMenuStyle}
              />
              <TouchableOpacity
                onPress={() =>
                  !user?.isGuest
                    ? navigation.navigate('Notifications')
                    : setGuestPopUp(true)
                }
                style={{position: 'relative'}}>
                <BellIcon width={24} height={24} />

                {unreadCount > 0 && (
                  <Badge
                    value={unreadCount} // Display unread count
                    status="error" // Red badge color
                    containerStyle={styles.badgeContainer}
                  />
                )}
              </TouchableOpacity>
            </>
          ) : route.name === 'Notifications' ? (
            loading ? (
              <ActivityIndicator color={colors.primary} size={'small'} />
            ) : (
              unreadCount > 0 && (
                <TouchableOpacity onPress={markAllAsRead}>
                  <Text style={styles.markAllReadText}>
                    {t('markAllasRead')}
                  </Text>
                </TouchableOpacity>
              )
            )
          ) : null}
        </View>
      </View>

      {guestPopUp && (
        <GuestModal showPopUp={guestPopUp} setShowPopUp={setGuestPopUp} />
      )}
    </View>
  );
};

export default CustomHeader;

const styles = StyleSheet.create({
  headerContainer: {
    height: 60,
    marginHorizontal: 10,
    justifyContent: 'center',
  },
  parentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 30,
  },
  navigateIcon: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
    padding: 15,
  },
  middleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.xMedium,
    lineHeight: 24,
    color: colors.black,
  },
  rightContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexDirection: 'row',
    width: '15%',
    right: 10,
  },
  badgeStyle: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.red,
  },
  skipText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.lightBlack,
  },
  gift_text: {
    fontSize: 11,
    fontFamily: fonts.regular,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.popBg,
    color: colors.black,
  },
  blurView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8, // Optional: Match the Popover's border radius
  },
  badgeContainer: {
    position: 'absolute',
    top: -5, // Adjust position
    right: -5, // Adjust position
  },
  markAllReadText: {
    color: colors.primary, // Change color based on your theme
    fontSize: 12,
    fontFamily: fonts.medium,
    borderBottomColor: colors.whiteGray,
    borderBottomWidth: 1,
  },
  image: {
    width: 44,
    height: 44,
    borderRadius: 44 / 2,
    resizeMode: 'cover',
  },
  profile_left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  user_name: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.black,
  },
  user_loc: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.black,
  },

  dropdownButtonStyle: {
    width: 130,
    height: 40,
    backgroundColor: '#E9ECEF',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  dropdownButtonTxtStyle: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.black,
  },
  dropdownButtonArrowStyle: {
    fontSize: 28,
  },
  dropdownButtonIconStyle: {
    fontSize: 28,
    marginRight: 8,
  },
  dropdownMenuStyle: {
    backgroundColor: '#E9ECEF',
    borderRadius: 8,
  },
  dropdownItemStyle: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dropdownItemTxtStyle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#151E26',
  },
  dropdownItemIconStyle: {
    fontSize: 28,
    marginRight: 8,
  },
});
