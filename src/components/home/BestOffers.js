import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  Animated,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';

// Data

// Styles
import {colors, commonStyles, fontSizes, fonts} from '../../utils/styles';

// Third Party
import {widthPercentageToDP as WP} from 'react-native-responsive-screen';

// Assets
import StartSharpIcon from '../../../assets/icons/star-round.svg';
import bg_shadow from '../../../assets/images/image_bg_shadow.png';
import BeltIcon from '../../../assets/icons/bolt.svg';
import Tag from '../../../assets/icons/tags.svg';

import WalletRoundIcon from '../../../assets/icons/wallet-round.svg';
import {useTranslation} from 'react-i18next';
const {width} = Dimensions.get('window');
import {useNavigation} from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import moment from 'moment';
import ImagePreview from '../imagePreview/ImagePreview';
const BestOffers = ({bestOffers}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [images, setImages] = useState([]);
  const scrollX = useRef(new Animated.Value(0)).current;
  const {t} = useTranslation();
  const navigation = useNavigation();
  console.log('bestOffers', bestOffers);

  const formatPrice = price => {
    if (price > Number.MAX_SAFE_INTEGER) {
      // For extremely large numbers, format using exponential notation
      return price.toExponential(1);
    } else {
      // Use toFixed for numbers within a safe range
      return price.toFixed(2);
    }
  };
  const Item = ({item}) => {
    return (
      <TouchableOpacity
        style={[
          styles.itemContainer,
          {width: Dimensions.get('window').width - 30},
        ]}
        onPress={() =>
          navigation.navigate('ServiceDetails', {
            id: item?._id,
            complete: false,
          })
        }>
        <View style={styles.boltStyle}>
          {item?.offer?.type === 'flashHours' ? (
            <BeltIcon width={20} height={20} />
          ) : (
            <Tag width={20} height={20} />
          )}
        </View>
        <View style={styles.rowContainer}>
          <View style={{width: width * 0.3, position: 'relative'}}>
            <TouchableOpacity
              onPress={() => {
                setImages(item?.images.map(image => ({uri: image})));
                setIsPreviewVisible(true);
              }}
              disabled={true}
              >
              <FastImage
                source={{uri: item?.images[0]}}
                style={styles.image}
                resizeMode="cover"
              />
            </TouchableOpacity>
            {item?.images?.length > 1 && (
              <ImageBackground
                style={styles.usernameContainer}
                source={bg_shadow}>
                <Text allowFontScaling={false} style={styles.imagelengthText}>
                  {' '}
                  + {item?.images?.length - 1}
                </Text>
              </ImageBackground>
            )}

            {item?.offer?.isActive && (
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  backgroundColor: colors.primary,
                  padding: 6,
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 0,
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 8,
                }}>
                <Text
                  allowFontScaling={false}
                  style={{
                    fontSize: 8,
                    fontFamily: fonts.medium,
                    color: colors.background,
                    textAlign: 'center',
                  }}>
                  {item.offer.type === 'flashHours'
                    ? `${moment(item?.offer?.start, 'HH:mm').format(
                        'hh:mm A',
                      )} - ${moment(item?.offer?.end, 'HH:mm').format(
                        'hh:mm A',
                      )}`
                    : `${item.offer.discount} ${item?.currency?.code} ${t(
                        'off',
                      )}`}
                </Text>
              </View>
            )}
          </View>
          <View style={{padding: 10}}>
            <Text allowFontScaling={false} style={styles.title}>
              {item.title}
            </Text>
            <View style={[styles.rowContainer, {paddingVertical: 15}]}>
              <StartSharpIcon width={16} height={16} style={styles.starIcon} />
              <Text allowFontScaling={false} style={styles.rateingText}>
                {item.totalReviews}
              </Text>
              <Text allowFontScaling={false} style={styles.text}>
                {' '}
                ({item?.totalReviews} {t('reviews')})
              </Text>
            </View>

            <View style={styles.rowContainer}>
              <WalletRoundIcon width={16} height={16} style={styles.starIcon} />

              {item?.offer?.isActive && (
                <Text allowFontScaling={false} style={styles.price}>
                  {formatPrice(item?.price)}
                </Text>
              )}
              {item?.offer?.isActive ? (
                <Text allowFontScaling={false} style={styles.offerPrice}>
                  {''} {formatPrice(item?.price - item?.offer?.discount)}{' '}
                  {item?.currency?.code}
                </Text>
              ) : (
                <Text allowFontScaling={false} style={styles.offerPrice}>
                  {''}
                  {formatPrice(item?.price)} {item?.currency?.code}
                </Text>
              )}
            </View>
          </View>
        </View>
        <ImagePreview
          images={images}
          isVisible={isPreviewVisible}
          onClose={() => setIsPreviewVisible(false)}
        />
      </TouchableOpacity>
    );
  };

  const handleScroll = event => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(
      contentOffsetX / (Dimensions.get('window').width - 40),
    );
    setCurrentIndex(index);
  };

  return (
    <View style={commonStyles.container}>
      <Text allowFontScaling={false} style={commonStyles.heading}>
        {t('bestOffers')}
      </Text>
      {bestOffers?.length > 0 ? (
        <>
          <FlatList
            data={bestOffers?.slice(0, 4)}
            renderItem={({item}) => <Item item={item} />}
            keyExtractor={item => item._id.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled
            onScroll={Animated.event(
              [{nativeEvent: {contentOffset: {x: scrollX}}}],
              {useNativeDriver: false, listener: handleScroll},
            )}
            contentContainerStyle={{marginVertical: 10}}
          />
          <View style={styles.pagination}>
            {bestOffers?.slice(0, 4).map((_, index) => (
              <View
                key={index}
                style={[styles.dot, currentIndex === index && styles.activeDot]}
              />
            ))}
          </View>
        </>
      ) : (
        <Text allowFontScaling={false} style={styles.noDataText}>
          {t('noDataFound')}
        </Text>
      )}
    </View>
  );
};

export default BestOffers;

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: colors.whiteGray,
    borderRadius: 10,
    marginRight: 10,
    marginTop: 10,
    minHeight: 120,
    padding: 10,
    elevation: 3,
    position: 'relative',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: 10,
  },
  title: {
    fontSize: fontSizes.mSmall,
    color: colors.black,
    fontFamily: fonts.semiBold,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  dot: {
    height: 5,
    width: WP(5),
    borderRadius: 1,
    backgroundColor: colors.grey,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: colors.primary,
  },
  starIcon: {
    marginRight: 5,
  },
  price: {
    textDecorationLine: 'line-through',
    fontSize: fontSizes.small,
    color: colors.lightBlack,
    fontFamily: fonts.medium,
  },
  offerPrice: {
    fontSize: fontSizes.small,
    color: colors.primary,
    fontFamily: fonts.medium,
  },
  boltStyle: {
    position: 'absolute',
    top: -12,
    right: 0,
    zIndex: 999,
    width: 30,
    height: 30,
    backgroundColor: colors.whiteGray,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
  },
  rateingText: {
    fontSize: fontSizes.small,
    color: colors.black,
    fontFamily: fonts.regular,
  },
  text: {
    fontSize: fontSizes.small,
    color: colors.black,
    fontFamily: fonts.regular,
  },
  noDataText: {
    fontSize: fontSizes.xSmall,
    color: colors.black,
    fontFamily: fonts.medium,
    textAlign: 'center',
    marginTop: 20,
  },
  usernameContainer: {
    position: 'absolute',
    bottom: 0,
    width: 40,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'contain',
    height: 53,
  },
  imagelengthText: {
    color: colors.background,
    fontSize: fontSizes.small,
    fontFamily: fonts.semiBold,
    marginTop: 10,
  },
});
