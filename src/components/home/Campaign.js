import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import {colors, commonStyles, fonts} from '../../utils/styles';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';

const Campaign = () => {
  const {t} = useTranslation();
  const offers = [
    {
      name: t('freeSamplepack'),
      image: require('../../../assets/icons/campaigns/free_sample.png'),
      navigationTitle: 'FreeSampleList',
    },
    {
      name: t('BuyOneGetOne'),
      image: require('../../../assets/icons/campaigns/buy_one.png'),
      navigationTitle: 'BuyOneGetOneList',
    },
    {
      name: t('happyHour'),
      image: require('../../../assets/icons/campaigns/happy_hour.png'),
      navigationTitle: 'HappyHourList',
    },
    {
      name: t('firstPurchase'),
      image: require('../../../assets/icons/campaigns/first_order.png'),
      navigationTitle: 'FirstPurchaseList',
    },
    {
      name: t('bundle'),
      image: require('../../../assets/icons/campaigns/bundle_Deals.png'),
      navigationTitle: 'BundleList',
    },
    {
      name: t('earlyBird'),
      image: require('../../../assets/icons/campaigns/early_Bird.png'),
      navigationTitle: 'EarlyBirdDiscountList',
    },
  ];
  const navigation = useNavigation();
  return (
    <>
      <Text
        allowFontScaling={false}
        style={[commonStyles.heading, {marginHorizontal: 10}]}>
        {t('campaigns')}
      </Text>
      <FlatList
        data={offers}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.offerContainer}
            activeOpacity={0.8}
            onPress={() => navigation.navigate(item.navigationTitle)}>
            <Image source={item.image} style={styles.offerImage} />
            <Text numberOfLines={1} style={styles.offerText}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </>
  );
};

const styles = StyleSheet.create({
  flatListContent: {
    alignItems: 'center',
    marginHorizontal: 10,
    gap: 15,
  },
  offerContainer: {
    alignItems: 'center',
    width: 90, // Fixed width to make truncation predictable
  },
  offerImage: {
    width: 100,
    height: 100,
    borderRadius: 100 / 2, // Circle
    resizeMode: 'cover',
  },
  offerText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  title: {
    fontSize: 12,
    marginBottom: 5,
    fontFamily: fonts.medium,
    color: colors.black,
  },
});

export default Campaign;
