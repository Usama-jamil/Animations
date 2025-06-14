import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Dimensions,
} from 'react-native';
import React, {useRef, useState} from 'react';
import {useDispatch} from 'react-redux';
import {colors, commonStyles, fontSizes, fonts} from '../../utils/styles';
import {useTranslation} from 'react-i18next';
import FastImage from 'react-native-fast-image';
import {useSelector} from 'react-redux';
import ImagePreview from '../imagePreview/ImagePreview';
import GuestModal from '../guest-modal/GuestModal';
const screenWidth = Dimensions.get('window').width;
const isSmallScreen = screenWidth < 400;
const ListingDetail = ({
  data,
  setErr,
  setErrMsg,
  setIsLoading,
  activeRadio,
  setShowBookingPopUp,
}) => {
  const {t} = useTranslation();
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageIndex, setimageIndex] = useState(0);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [images, setImages] = useState([]);
  const {width} = Dimensions.get('window');
  const {user} = useSelector(state => state.auth);
  const [showPopUp, setShowPopUp] = useState(false);

  console.log('data', data);
  const bookingFor = activeRadio
    ? activeRadio === 'HomeService'
      ? 'HomeService'
      : 'Inplace'
    : data?.serviceType === 'homeservice'
    ? 'HomeService'
    : data?.serviceType === 'both'
    ? 'Inplace'
    : 'Inplace'; // Default to 'Inplace' for any other cases

  const handleImageSelect = index => {
    // Assuming `data?.images` is an array of image URIs or paths
    const imagesWithUri = data?.images.map(item => ({uri: item})); // Map the images to the required format
    setImages(imagesWithUri); // Set the images directly
    setIsPreviewVisible(true);
    setimageIndex(index);
  };

  const renderItem = ({item, index}) => (
    <View style={{position: 'relative'}}>
      <TouchableOpacity onPress={() => handleImageSelect(index)}>
        <FastImage
          source={{uri: item}}
          style={[styles.image_slider, {marginTop: 20}]}
          resizeMode="cover"
        />
      </TouchableOpacity>
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          backgroundColor: colors.primary,
          padding: 6,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
          borderBottomLeftRadius: 0,
        }}>
        <Text
          allowFontScaling={false}
          style={{
            fontSize: 12,
            fontFamily: fonts.medium,
            color: colors.background,
            textAlign: 'center',
          }}>
          Open for Rent
        </Text>
      </View>
    </View>
  );
  const sliderData = data?.images;

  const onViewableItemsChanged = useRef(({viewableItems}) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  });

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  console.log('bookingFor', bookingFor);
  return (
    <View style={{marginTop: 20}}>
      <FlatList
        ref={flatListRef}
        data={sliderData}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        contentContainerStyle={{marginRight: 10}}
      />
      <View style={styles.indicatorContainer}>
        {sliderData?.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              {
                backgroundColor:
                  index === currentIndex ? colors.primary : '#E9E9E9',
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.rowContainer}>
        <Text
          allowFontScaling={false}
          style={[styles.text, {color: colors.black}]}>
          Tool Value : {''}
          <Text
            allowFontScaling={false}
            style={[styles.price, {color: colors.primary}]}>
            {data?.totalValue} {''}
          </Text>
          <Text
            allowFontScaling={false}
            style={[styles.text, {color: colors.black}]}>
            {data?.currency?.code}
          </Text>
        </Text>
      </View>

      <View style={styles.rowContainer}>
        <View>
          <Text
            allowFontScaling={false}
            style={[styles.text, {color: colors.black}]}>
            Price Hourly : {''}
            <Text
              allowFontScaling={false}
              style={[styles.price, {color: colors.primary}]}>
              {data?.rentPerHour} {''}
            </Text>
            <Text
              allowFontScaling={false}
              style={[styles.text, {color: colors.black}]}>
              {data?.currency?.code} 
            </Text>
          </Text>
        </View>

        <View>
          <Text
            allowFontScaling={false}
            style={[styles.text, {color: colors.black}]}>
            Price Daily : {''}
            <Text
              allowFontScaling={false}
              style={[styles.price, {color: colors.primary}]}>
              {data?.rentPerHour} {''}
            </Text>
            <Text
              allowFontScaling={false}
              style={[styles.text, {color: colors.black}]}>
              {data?.currency?.code}
            </Text>
          </Text>
        </View>
      </View>

      <Text allowFontScaling={false} style={styles.peragraph}>
        {data?.description}
      </Text>
      <TouchableOpacity
        style={[
          commonStyles.btnContainer,
          {
            marginHorizontal: 10,
            marginTop: 40,

            backgroundColor: colors.primary,
          },
        ]}
        onPress={() => {
          if (user?.isGuest === false || user?.isGuest == null) {
            setShowBookingPopUp(true);
          } else {
            setShowPopUp(true);
          }
        }}>
        <Text allowFontScaling={false} style={commonStyles.btnText}>
          {t('addtobooking')}
        </Text>
      </TouchableOpacity>

      {showPopUp && (
        <GuestModal showPopUp={showPopUp} setShowPopUp={setShowPopUp} />
      )}
      <ImagePreview
        images={images}
        isVisible={isPreviewVisible}
        onClose={() => setIsPreviewVisible(false)}
        imageIndex={imageIndex}
      />
    </View>
  );
};

export default ListingDetail;

const styles = StyleSheet.create({
  image: {
    height: 262,
    width: '100%',
    resizeMode: 'cover',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 10,
    marginTop: 5,
  },
  text: {
    fontSize: fontSizes.small,
    fontFamily: fonts.medium,
    color: colors.primary,
  },
  price: {
    fontSize: fontSizes.xSmall,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
 
  peragraph: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.lightBlack,
    lineHeight: 22,
    textAlign: 'justify',
    marginHorizontal: 10,
    marginTop: 10,
  },
  image_slider: {
    width: Dimensions.get('window').width,
    height: 171,

    resizeMode: 'cover',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 8,
  },
  indicator: {
    width: 19,
    height: 5,
    borderRadius: 1,
    marginHorizontal: 2,
  },
  errorText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 19,
    color: colors.red,
    marginBottom: 10,
  },

});
