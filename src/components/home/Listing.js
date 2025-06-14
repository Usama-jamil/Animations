import React, {useState, useEffect} from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';

// Styles import
import {colors, commonStyles, fontSizes, fonts} from '../../utils/styles';

import bg_shadow from '../../../assets/images/image_bg_shadow.png';

// Assets
import WalletIcon from '../../../assets/icons/wallet-alt.svg';
import StartSharpIcon from '../../../assets/icons/star-round.svg';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import ImagePreview from '../imagePreview/ImagePreview';
import FastImage from 'react-native-fast-image';
const Listing = ({data, Search}) => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const {width} = Dimensions.get('window');
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [images, setImages] = useState([]);

  const Item = ({item, index}) => {
    const itemWidth = width / 2.3;

    return (
      <TouchableOpacity
        style={[
          styles.itemContainer,
          {
            backgroundColor: colors.whiteGray,
            width: itemWidth,
          },
        ]}
        onPress={() =>
          navigation.navigate('ListingDetail', {
            id: item?._id,
            complete: false,
          })
        }>
        <View style={styles.imageContainer}>
          <View style={{position: 'relative'}}>
            <TouchableOpacity
              onPress={() => {
                setImages(item?.images.map(image => ({uri: image})));
                setIsPreviewVisible(true);
              }}
              disabled={true}>
              <FastImage
                style={styles.image}
                source={{
                  uri: item?.images[0],
                }}
                resizeMode={FastImage.resizeMode.cover}
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
          </View>
        </View>
        <Text allowFontScaling={false} style={styles.title}>
          {item?.name}
        </Text>
        <View style={[styles.rowContainer, {paddingVertical: 5}]}>
          <WalletIcon width={18} height={18} style={styles.starIcon} />
          <Text allowFontScaling={false} style={styles.price}>
            {item?.rentPerHour?.toFixed(2)}
          </Text>
          <Text allowFontScaling={false} style={styles.text}>
            {' '}
            {item?.currency?.code} / {t('Hour')}{' '}
          </Text>
        </View>

        <View style={[styles.rowContainer, {paddingVertical: 5}]}>
          <WalletIcon width={18} height={18} style={styles.starIcon} />
          <Text allowFontScaling={false} style={styles.price}>
            {item?.rentPerDay?.toFixed(2)}
          </Text>
          <Text allowFontScaling={false} style={styles.text}>
            {' '}
            {item?.currency?.code} / {t('Day')}{' '}
          </Text>
        </View>

        <View style={styles.rowContainer}>
          <StartSharpIcon width={18} height={18} style={styles.starIcon} />
          <Text allowFontScaling={false} style={styles.raitingText}>
            {item.rating}
          </Text>
          <Text allowFontScaling={false} style={styles.text}>
            {' '}
            ({item?.totalReviews} {t('reviews')})
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={commonStyles.container}>
      <View style={styles.rowContainerBetween}>
        <Text allowFontScaling={false} style={commonStyles.heading}>
          {t('rental')}
        </Text>
        {!Search && data?.length > 1 && (
          <Pressable onPress={() => navigation.navigate('ListingList')}>
            <Text allowFontScaling={false} style={commonStyles.linkSmallText}>
              {t('seeAll')}
            </Text>
          </Pressable>
        )}
      </View>
      {data?.length > 0 ? (
        <FlatList
          data={Search ? data : data?.slice(0, 2)}
          numColumns={Search ? 0 : 2}
          horizontal={Search}
          showsHorizontalScrollIndicator={false}
          renderItem={({item, index}) => <Item item={item} index={index} />}
          keyExtractor={item => item._id.toString()} // Ensure key is a string
          contentContainerStyle={{marginVertical: 10}}
          nestedScrollEnabled
        />
      ) : (
        <Text allowFontScaling={false} style={styles.noDataText}>
          {t('noDataFound')}
        </Text>
      )}
      <ImagePreview
        images={images}
        isVisible={isPreviewVisible}
        onClose={() => setIsPreviewVisible(false)}
      />
    </View>
  );
};

export default Listing;

const styles = StyleSheet.create({
  itemContainer: {
    padding: 10,
    borderRadius: 12,
    marginRight: 10,
    marginBottom: 10,
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 100,
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 13,
    fontFamily: fonts.semiBold,

    color: colors.black,
  },
  rowContainerBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginRight: 7,
  },
  raitingText: {
    fontSize: 13,

    fontFamily: fonts.medium,
    color: colors.black,
  },
  price: {
    fontSize: 13,

    fontFamily: fonts.semiBold,
    color: colors.black,
  },
  text: {
    fontSize: fontSizes.mSmall,
    color: colors.black,
    fontFamily: fonts.regular,
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
  noDataText: {
    fontSize: fontSizes.xSmall,
    color: colors.black,
    fontFamily: fonts.medium,
    textAlign: 'center',
    marginTop: 20,
  },
});
