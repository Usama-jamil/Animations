import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Pressable,
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
import FastImage from 'react-native-fast-image';
import OnSiteIcon from '../../../assets/icons/on_site.svg';
import Both from '../../../assets/icons/home.svg';
import {useState} from 'react';
import ImagePreview from '../imagePreview/ImagePreview';

const Services = ({services, Search}) => {
  const {width} = Dimensions.get('window');
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [images, setImages] = useState([]);
  const navigation = useNavigation();
  const {t} = useTranslation();

  const formatPrice = price => {
    if (price > Number.MAX_SAFE_INTEGER) {
      // For extremely large numbers, format using exponential notation
      return price.toExponential(1);
    } else {
      // Use toFixed for numbers within a safe range
      return price.toFixed(2);
    }
  };

  const Item = ({item, index, navigation}) => {
    const itemWidth = width / 2.3;

    console.log('price', item?.serviceType);

    return (
      <TouchableOpacity
        style={[
          styles.itemContainer,
          {
            backgroundColor: colors.whiteGray,
            width: itemWidth,
            position: 'relative',
          },
        ]}
        onPress={() =>
          navigation.navigate('ServiceDetails', {
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
              }} disabled={true}>
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
          {item?.title}
        </Text>
        <View style={[styles.rowContainer, {paddingVertical: 3}]}>
          <WalletIcon width={18} height={18} style={styles.starIcon} />
          <Text allowFontScaling={false} style={styles.price}>
            {formatPrice(
              item?.offer?.isActive
                ? item?.price - item?.offer?.discount
                : item?.price,
            )}
          </Text>
          <Text allowFontScaling={false} style={styles.text}>
            {' '}
            {item?.currency?.code}
          </Text>
        </View>

        <View style={styles.rowContainer}>
          <StartSharpIcon width={18} height={18} style={styles.starIcon} />
          <Text allowFontScaling={false} style={styles.raitingText}>
            {item?.averageRating?.toFixed(1)}
          </Text>
          <Text allowFontScaling={false} style={styles.text}>
            {' '}
            ({item?.totalReviews} {t('reviews')})
          </Text>
        </View>

        {item?.serviceType && (
          <View style={styles.rowContainer}>
            {item?.serviceType === 'homeservice' ? (
              <Image
                style={styles.starIcon}
                source={require('../../../assets/icons/house-chimney-user.png')}
              />
            ) : item?.serviceType === 'inplace' ? (
              <OnSiteIcon width={18} height={18} style={styles.starIcon} />
            ) : (
              <Both width={18} height={18} style={styles.starIcon} />
            )}
            <Text allowFontScaling={false} style={styles.price}>
              {item?.serviceType === 'homeservice'
                ? t('HomeService')
                : item?.serviceType === 'inplace'
                ? t('OnSite')
                : t('home') + ' or ' + t('onSite')}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={commonStyles.container}>
      <View style={styles.rowContainerBetween}>
        <Text allowFontScaling={false} style={commonStyles.heading}>
          {t('services')}
        </Text>
        {!Search && services?.length > 1 && (
          <Pressable onPress={() => navigation.navigate('AllServices')}>
            <Text allowFontScaling={false} style={commonStyles.linkSmallText}>
              {t('seeAll')}
            </Text>
          </Pressable>
        )}
      </View>
      {services?.length > 0 ? (
        <FlatList
          data={Search ? services : services?.slice(0, 2)}
          numColumns={Search ? 0 : 2}
          horizontal={Search}
          renderItem={({item, index}) => (
            <Item item={item} index={index} navigation={navigation} />
          )}
          keyExtractor={item => item._id.toString()} // Ensure key is a string
          contentContainerStyle={{marginVertical: 10}}
          showsHorizontalScrollIndicator={false}
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

export default Services;

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
    marginBottom: 5,
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
    width: 20,
    height: 20,
  },
  raitingText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.black,
  },
  price: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.black,
  },

  text: {
    fontSize: 10,
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
