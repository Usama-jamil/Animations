import React from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Platform,
  Linking,
} from 'react-native';
import { colors, fonts } from '../../utils/styles';

// Assets
import ArrowIcon from '../../../assets/icons/arrow-right.svg';
import { useSelector } from 'react-redux';

const MoreCard = ({ item, index, totalItems, navigation }) => {
  const appStoreUrl = 'https://apps.apple.com/app/timezee-customer';
  const playStoreUrl =
    'https://play.google.com/store/apps/details?id=timezee-customer';


  const url = Platform.OS === 'ios' ? appStoreUrl : playStoreUrl;

  const handleNavigation = () => {
    switch (item.id) {
      case 1:
        navigation.navigate('Profile');
        break;
      case 2:
        navigation.navigate('CardManagement');
        break;
      case 3:
        navigation.navigate('Subscriptions');
        break;
      case 4:
        navigation.navigate('Gift');
        break;
      case 5:
        navigation.navigate('CalenderSync');
        break;
      case 6:
        navigation.navigate('AllLanguage', { home: true });
        break;

      case 7:
        navigation.navigate('Favorites');

        break;
      case 8:
        Linking.openURL(url).catch(err =>
          console.error('Failed to open URL: ', err),
        );
        break;

      case 9:
        navigation.navigate('ContactSupport');
        break;

      case 10:
        navigation.navigate('AccountManagement');
        break;

    }
  };

  const getBorderRadius = () => {
    if (index === 0) {
      return { borderTopLeftRadius: 10, borderTopRightRadius: 10 };
    } else if (index === totalItems - 1) {
      return { borderBottomLeftRadius: 10, borderBottomRightRadius: 10 };
    } else {
      return { borderRadius: 0 };
    }
  };

  return (
    <View key={item.id} style={styles.container}>
      <View style={styles.iconAndTitleContainer}>
        <View style={[styles.iconContainer, getBorderRadius()]}>
          {item?.icon}
        </View>
        <TouchableOpacity
          style={styles.rowContainer}
          onPress={handleNavigation}>
          <View style={{ flex: 1 }}>
            <Text allowFontScaling={false} style={styles.titleText}>
              {item.title}
            </Text>
          </View>
          <View>
            <ArrowIcon width={25} height={25} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MoreCard;

const styles = StyleSheet.create({
  container: {

    marginHorizontal: 10,
  },
  iconContainer: {
    width: 45,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    backgroundColor: colors.primary,
  },
  iconAndTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',

  },
  titleText: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    color: colors.black,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1
  },
});
