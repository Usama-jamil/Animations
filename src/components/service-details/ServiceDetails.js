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
import {
  RemoveSelectedService,
  SetActiveRadio,
  SetSelectedService,
} from '../../store/slices/cart';
import {colors, commonStyles, fontSizes, fonts} from '../../utils/styles';
import {useTranslation} from 'react-i18next';
import FastImage from 'react-native-fast-image';
import Toast from 'react-native-toast-message';
import {useSelector} from 'react-redux';
import {useFocusEffect} from '@react-navigation/native';
import {useNavigation} from '@react-navigation/native';
import RatingStarsCard from '../rating/Rating';
import {TextInput} from 'react-native';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {API_ENDPOINTS, postRequest} from '../../utils/apiService';
import moment from 'moment';
import ImagePreview from '../imagePreview/ImagePreview';
import GuestModal from '../guest-modal/GuestModal';
const screenWidth = Dimensions.get('window').width;
const isSmallScreen = screenWidth < 400;
const ServiceDetail = ({
  data,
  compaign,
  complete,
  setErr,
  setErrMsg,
  setIsLoading,
  bookingid,
  activeRadio,
}) => {
  const {t} = useTranslation();
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageIndex, setimageIndex] = useState(0);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [images, setImages] = useState([]);
  const {width} = Dimensions.get('window');
  const {selectServies} = useSelector(state => state.cart);
  const {user} = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [showPopUp, setShowPopUp] = useState(false);

  const reviewSchema = Yup.object().shape({
    rating: Yup.number()
      .min(1, t('ratingRequired'))
      .required(t('ratingRequired')),
    comment: Yup.string().required(t('commentRequired')),
  });

  const checkAlreadySelected = () => {
    return selectServies?.find(service => service?._id === data?._id);
  };

  console.log('user?.isGuest',user?.isGuest)
  const bookingFor = activeRadio
    ? activeRadio === 'HomeService'
      ? 'HomeService'
      : 'Inplace'
    : data?.serviceType === 'homeservice'
    ? 'HomeService'
    : data?.serviceType === 'both'
    ? 'Inplace'
    : 'Inplace'; // Default to 'Inplace' for any other cases

  useFocusEffect(
    React.useCallback(() => {
      checkAlreadySelected();
    }, [data, selectServies]),
  );

  const addToBooking = () => {
    dispatch(SetSelectedService(data));
    Toast.show({
      type: 'success',
      position: 'top',
      bottomOffset: 20,
      text1: t('success'),
      text2: t('serviceAddSuccessfully'),
      visibilityTime: 3000,
    });
    navigation.navigate('HomeDetails', {id: data?.branch, bookingFor});
    dispatch(SetActiveRadio(bookingFor));
  };

  const removeFromBooking = () => {
    dispatch(RemoveSelectedService(data?._id));
    Toast.show({
      type: 'success',
      position: 'top',
      bottomOffset: 20,
      text1: t('success'),
      text2: t('serviceRemoveSuccessfully'),
      visibilityTime: 3000,
    });
    navigation.navigate('HomeDetails', {id: data?.branch});
  };

  const handleAddRemove = () => {
    if (checkAlreadySelected()) {
      removeFromBooking();
    } else {
      addToBooking();
    }
  };

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
          borderTopLeftRadius: 0,
          borderTopRightRadius: 8,
          borderBottomRightRadius: 0,
          borderBottomLeftRadius: 9,
        }}>
        <Text
          allowFontScaling={false}
          style={{
            fontSize: 8,
            fontFamily: fonts.medium,
            color: colors.background,
            textAlign: 'center',
          }}>
          {data?.category?.name}
        </Text>
      </View>
      {data?.offer?.isActive && (
        <>
          <View
            style={{
              position: 'absolute',
              top: 20,
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
              {data.offer.type === 'flashHours'
                ? `${moment(data?.offer?.start, 'HH:mm').format(
                    'hh:mm A',
                  )} - ${moment(data?.offer?.end, 'HH:mm').format('hh:mm A')}`
                : `${data.offer.discount} ${data?.currency?.code} ${t('off')}`}
            </Text>
          </View>

          <View
            style={[
              styles.icon_background,
              {
                backgroundColor:
                  data?.offer?.type === 'flashHours'
                    ? colors.primary
                    : colors.primary,
                position: 'absolute',
                top: 10,
                right: 0,
                zIndex: 999,
              },
            ]}>
            <Image
              source={
                data?.offer?.type === 'flashHours'
                  ? require('../../../assets/icons/bolt_white.png')
                  : require('../../../assets/icons/Tag-white.png')
              }
              style={[styles.icon, {tintColor: colors.background}]}
            />
          </View>
        </>
      )}
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

  const PriceDisplay = () => {
    const {t} = useTranslation();

    const isSamplePack = compaign?.type === 'samplePack';
    const isFirstPurchase = compaign?.type === 'firstPurchase';

    const discountedPrice = data?.price - (data?.offer?.discount || 0);
    const discountedPriceCompaign = data?.price - (compaign?.discount || 0);

    return (
      <React.Fragment>
        {isSamplePack && (
          <>
            <Text
              allowFontScaling={false}
              style={[
                styles.price,
                {textDecorationLine: 'line-through', color: colors.gray},
              ]}>
              {data?.price?.toFixed(2)}{' '}
              <Text
                allowFontScaling={false}
                style={[
                  styles.currency,
                  {textDecorationLine: 'line-through', color: colors.gray},
                ]}>
                {data?.currency?.code}
              </Text>
            </Text>
          </>
        )}

        {isFirstPurchase && (
          <>
            <Text
              allowFontScaling={false}
              style={[
                styles.price,
                {textDecorationLine: 'line-through', color: colors.gray},
              ]}>
              {data?.price?.toFixed(2)}{' '}
              <Text allowFontScaling={false} style={styles.price}>
                {discountedPriceCompaign?.toFixed(2)} {data?.currency?.code}
              </Text>
            </Text>
          </>
        )}

        {!isSamplePack && !isFirstPurchase && (
          <Text allowFontScaling={false} style={styles.price}>
            {discountedPrice?.toFixed(2)}{' '}
            <Text allowFontScaling={false} style={styles.currency}>
              {data?.currency?.code}
            </Text>
          </Text>
        )}
      </React.Fragment>
    );
  };

  const AddReview = async (values, {resetForm}) => {
    const payload = {
      comment: values.comment,
      rating: values.rating,
      targetType: 'services',
      targetId: data?._id,
      booking: bookingid,
    };

    setIsLoading(true);

    const result = await postRequest(`${API_ENDPOINTS.review.add}`, payload);
    setIsLoading(false);
    if (result.success) {
      navigation.goBack();
      resetForm(); // Reset the form after successful submission
    } else {
      setErr(true);
      setErrMsg(result.error);
    }
  };

  const loginUserReview = data?.reviews?.find(
    data => data?.booking === bookingid,
  );

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
        <PriceDisplay />

        <Text allowFontScaling={false} style={styles.time}>
          {data?.time}
        </Text>
      </View>

      <Text allowFontScaling={false} style={styles.peragraph}>
        {data?.description}
      </Text>
      {!compaign && !complete && (
        <TouchableOpacity
          style={[
            commonStyles.btnContainer,
            {
              marginHorizontal: 10,
              marginTop: 40,

              backgroundColor: checkAlreadySelected()
                ? colors.cancel
                : colors.primary,
            },
          ]}
          onPress={() => {
            if (user?.isGuest === false || user?.isGuest == null) {
              handleAddRemove();
            } else {
              setShowPopUp(true);
            }
          }}>
          <Text allowFontScaling={false} style={commonStyles.btnText}>
            {checkAlreadySelected() ? t('remove') : t('addtobooking')}
          </Text>
        </TouchableOpacity>
      )}

      {complete && loginUserReview && (
        <View style={{marginHorizontal: 10}}>
          <Text style={styles.rating_Title}>{t('YourRating')}</Text>
          <RatingStarsCard rating={loginUserReview?.rating} read={true} />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={t('typeHere')}
            placeholderTextColor="#000000B2"
            multiline={true}
            numberOfLines={6}
            textAlignVertical="top"
            value={loginUserReview?.comment}
            readOnly
          />
        </View>
      )}

      {complete && !loginUserReview && (
        <View style={{marginHorizontal: 10}}>
          <Text style={styles.rating_Title}>{t('rateService')}</Text>

          <Formik
            initialValues={{rating: 0, comment: ''}}
            validationSchema={reviewSchema}
            onSubmit={AddReview}>
            {({
              values,
              handleChange,
              handleSubmit,
              errors,
              touched,
              setFieldValue,
              handleBlur,
            }) => (
              <>
                <RatingStarsCard
                  rating={values.rating}
                  onRatingChange={rating => setFieldValue('rating', rating)}
                />

                {touched.rating && errors.rating && (
                  <Text style={styles.errorText}>{errors.rating}</Text>
                )}

                <Text style={styles.rating_Title}>{t('addYourComments')}</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder={t('typeHere')}
                  placeholderTextColor="#000000B2"
                  multiline={true}
                  numberOfLines={6}
                  textAlignVertical="top"
                  value={values.comment}
                  onBlur={handleBlur('comment')}
                  onChangeText={handleChange('comment')}
                />
                {touched.comment && errors.comment && (
                  <Text style={styles.errorText}>{errors.comment}</Text>
                )}

                <TouchableOpacity
                  style={[commonStyles.btnContainer, {marginBottom: 20}]}
                  onPress={handleSubmit}>
                  <Text allowFontScaling={false} style={commonStyles.btnText}>
                    {t('save')}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </Formik>
        </View>
      )}

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

export default ServiceDetail;

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
    marginTop: 20,
  },
  price: {
    fontSize: fontSizes.xlarge,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
  currency: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.regular,
    color: colors.primary,
  },
  time: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.regular,
    color: colors.black,
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
  input: {
    borderWidth: 1,
    borderColor: colors.borderGrey,
    padding: 15,
    marginBottom: 15,
    borderRadius: 5,
    fontFamily: fonts.regular,
  },
  textArea: {
    height: 180,
    textAlignVertical: 'top',
  },
  rating_Title: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: colors.black,
    marginVertical: 10,
  },
  errorText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 19,
    color: colors.red,
    marginBottom: 10,
  },
  icon_background: {
    width: isSmallScreen ? 34 : 38,
    height: isSmallScreen ? 34 : 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 38 / 2,
  },
  icon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },
});
