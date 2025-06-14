import React from 'react';
import {
  StyleSheet,
  SafeAreaView,
  FlatList,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {useTranslation} from 'react-i18next';

// Component
import MoreCard from '../../components/more/MoreCard';

// Styles
import {colors, fonts} from '../../utils/styles';

// Assets
import ProfileIcon from '../../../assets/icons/more/profile.svg';
import WalletIcon from '../../../assets/icons/more/wallet.svg';
import SubscriptionIcon from '../../../assets/icons/more/subscription.svg';
import GiftCardsIcon from '../../../assets/icons/more/gift.svg';
import CalendarIcon from '../../../assets/icons/more/calendar.svg';
import FavoritesIcon from '../../../assets/icons/more/heart.svg';
import RateAppIcon from '../../../assets/icons/more/star.svg';
import ContactSupportIcon from '../../../assets/icons/more/contact.svg';
import AccountManagementIcon from '../../../assets/icons/more/account.svg';
import BellIcon from '../../../assets/icons/header/bell.svg';
import GlobalIcon from '../../../assets/icons/more/globe_white.svg';

// Third Party
import {useDispatch, useSelector} from 'react-redux';
import {setNewNotification} from '../../store/slices/user';
import {Badge} from '@rneui/base';

const More = ({navigation}) => {
  const {t} = useTranslation();
  const {unreadCount} = useSelector(state => state.auth);

  const moreData = [
    {
      id: 1,
      icon: <ProfileIcon width={20} height={20} />,
      title: t('profile'),
    },
    {
      id: 2,
      icon: <WalletIcon width={25} height={25} />,
      title: t('cardManagement'),
    },
    // {
    //   id: 3,
    //   icon: <SubscriptionIcon width={25} height={25} />,
    //   title: t('mySubscriptions'),
    // },
    {
      id: 4,
      icon: <GiftCardsIcon width={25} height={25} />,
      title: t('giftCards'),
    },
    {
      id: 5,
      icon: <CalendarIcon width={25} height={25} />,
      title: t('calendarTwoWay'),
    },
    {
      id: 6,
      icon: <GlobalIcon width={25} height={25} />,
      title: t('language'),
    },
    {
      id: 7,
      icon: <FavoritesIcon width={25} height={25} />,
      title: t('favorites'),
    },
    // {
    //   id: 8,
    //   icon: <RateAppIcon width={25} height={25} />,
    //   title: t('rateApp'),
    // },

    {
      id: 9,
      icon: <ContactSupportIcon width={25} height={25} />,
      title: t('contactSupport'),
    },

    {
      id: 10,
      icon: <AccountManagementIcon width={25} height={25} />,
      title: t('accountManagement'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text allowFontScaling={false} style={styles.headingText}>
          {t('more')}
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Notifications')}
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
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{marginBottom: 40}}>
        <FlatList
          data={moreData}
          renderItem={({item, index}) => (
            <MoreCard
              item={item}
              index={index}
              totalItems={moreData.length}
              navigation={navigation}
            />
          )}
          keyExtractor={item => item.id.toString()}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={false}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default More;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingBottom: 80,
  },
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginHorizontal: 10,
    marginTop: 20,
    marginBottom: 10,
  },
  headingText: {
    color: colors.black,
    fontSize: 20,
    lineHeight: 24,
    fontFamily: fonts.bold,
  },
  badgeStyle: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.red,
  },
  badgeContainer: {
    position: 'absolute',
    top: -5, // Adjust position
    right: -5, // Adjust position
  },
});
