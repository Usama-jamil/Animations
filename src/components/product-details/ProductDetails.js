import React, {useState, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {colors, fonts, commonStyles, fontSizes} from '../../utils/styles';
import Female from '../../../assets/icons/female.svg';
import {useTranslation} from 'react-i18next';
import VariantCard from './VariantCard';
import ProductModal from '../modal/ProductModal';
import FastImage from 'react-native-fast-image';
const {width} = Dimensions.get('window');
import {Formik} from 'formik';
import * as Yup from 'yup';
import RatingStarsCard from '../rating/Rating';
import {API_ENDPOINTS, postRequest} from '../../utils/apiService';
import {useNavigation} from '@react-navigation/native';
import {SetSelectedProducts} from '../../store/slices/cart';
import Toast from 'react-native-toast-message';
import {useDispatch, useSelector} from 'react-redux';
import {Overlay} from '@rneui/themed';
import CirclePlus from '../../../assets/icons/circle-plus.svg';
import Minus from '../../../assets/icons/minus.svg';
import Plus from '../../../assets/icons/plus.svg';
import {
  widthPercentageToDP as WP,
  heightPercentageToDP as HP,
} from 'react-native-responsive-screen';
import ImagePreview from '../imagePreview/ImagePreview';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import GuestModal from '../guest-modal/GuestModal';

const ProductDetail = ({
  data,
  selected,
  complete,
  setIsLoading,
  setErr,
  setErrMsg,
  bookingid,
  freeSample
}) => {
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const {t} = useTranslation();
  const [showPopUp, setShowPopUp] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [images, setImages] = useState([]);
  const [imageIndex, setimageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const navigation = useNavigation();
  const {user} = useSelector(state => state.auth);
  const [guestPopUp, setGuestPopUp] = useState(false);

  const reviewSchema = Yup.object().shape({
    rating: Yup.number()
      .min(1, t('ratingRequired'))
      .required(t('ratingRequired')),
    comment: Yup.string().required(t('commentRequired')),
  });

  console.log('user?.isGuest', user?.isGuest);

  const [QuantityError, setQuantityError] = useState(null);
  const [count, setCount] = useState(0);
  const dispatch = useDispatch();
  const [show, setshow] = useState(false);

  const increment = () => {
    if (count < data?.totalStock) {
      setCount(count + 1);
    } else if (count > data?.totalStock) {
      setQuantityError(t('maxVariantLimit'));
    } else {
      setQuantityError(null);
    }
  };

  const decrement = () => {
    if (count > 0) {
      setCount(count - 1);
    }
  };

  const handleAdd = () => {
    if (count < 1) {
      setQuantityError(t('pleaseSelectQuantity'));
      return;
    } else {
      setQuantityError(null);
    }

    const newProduct = {
      inventory: data._id,
      quantity: count,
      _id: data._id,
      total: data?.price * count,
      price: data?.price,
      branch: data?.branch,
    };
    setshow(false);

    dispatch(SetSelectedProducts(newProduct));
    Toast.show({
      type: 'success',
      position: 'top',
      bottomOffset: 20,
      text1: t('success'),
      text2: t('productAddSuccessfully'),
      visibilityTime: 3000,
    });

    navigation.navigate('HomeDetails', {id: data?.branch});
  };

  const handleVariantSelect = variant => {
    setSelectedVariant(variant);
    setShowPopUp(true);
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

  const renderVariantItem = ({item, index}) => {
    return (
      <TouchableOpacity
      onPress={()=> !user?.isGuest ? handleVariantSelect(item) : setGuestPopUp(true)}
        disabled={complete}>
        <VariantCard
          item={item}
          isHorizontal={false}
          index={index}
          selected={selectedVariant === item}
          currency={data?.currency?.code}
        />
      </TouchableOpacity>
    );
  };

  const AddReview = async (values, {resetForm}) => {
    const payload = {
      comment: values.comment,
      rating: values.rating,
      targetType: 'inventories',
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
    data => data.booking === bookingid,
  );

  const colorCodes = data?.variants
    ?.map(variant => variant.color) // Assuming each variant has a `color` property
    .filter((color, index, self) => color && self.indexOf(color) === index);

  console.log('freeSample', freeSample);
  return (
    <View style={styles.container}>
      {showPopUp && (
        <ProductModal
          Set_Modal_Visibilty={setShowPopUp}
          selectedVariant={selectedVariant}
          id={data?._id}
          branchid={data?.branch}
          selected={selected}
          currencyCode={data?.currency?.code}
        />
      )}
           {guestPopUp && (
                      <GuestModal
                        showPopUp={guestPopUp}
                        setShowPopUp={setGuestPopUp}
                      />
                    )}

      <ImagePreview
        images={images}
        isVisible={isPreviewVisible}
        onClose={() => setIsPreviewVisible(false)}
        imageIndex={imageIndex}
      />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        enableAutomaticScroll
        extraScrollHeight={20}>
        {data?.images && (
          <>
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
          </>
        )}
        <Text
          allowFontScaling={false}
          style={[styles.titleTextsmall, {marginVertical: 10}]}>
          {data?.title}
        </Text>

        <Text
          allowFontScaling={false}
          style={[styles.priceText, {marginVertical: 10}]}>
          {data?.price?.toFixed(2)}
          <Text allowFontScaling={false} style={styles.currency}>
            {' '}
            {data?.currency?.code}{' '}
          </Text>
        </Text>
        <Text allowFontScaling={false} style={[styles.regularText]}>
          {data?.description}
        </Text>
        <Text allowFontScaling={false} style={[styles.regularText]}>
          {t('stock')} {data?.totalStock}
        </Text>
        <View style={styles.genderContainer}>
          <Female width={20} height={20} />
          <Text allowFontScaling={false} style={styles.mediumText}>
            {data?.gender}
          </Text>
        </View>

        {colorCodes?.length > 0 && (
          <View style={{marginVertical: 10}}>
            <Text
              style={[
                styles.titleText,
                {marginTop: 0, textAlign: 'left', alignSelf: 'flex-start'},
              ]}>
              {t('Colors')}
            </Text>
            <View style={[styles.colorsContainer, {marginTop: 5}]}>
              {colorCodes.map((color, index) => (
                <View
                  key={index}
                  style={[styles.colorBox, {backgroundColor: color}]}
                />
              ))}
            </View>
          </View>
        )}

        {data?.variants?.some(variant => Object.keys(variant).length > 0) && (
          <>
            <Text
              allowFontScaling={false}
              style={[styles.titleTextsmall, {marginTop: -5}]}>
              {t('Variants')}
            </Text>

            <FlatList
              data={data?.variants}
              keyExtractor={item => item?._id?.toString()}
              renderItem={renderVariantItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{marginTop: 10}}
            />
          </>
        )}

        {complete && loginUserReview && (
          <View>
            <Text style={styles.rating_Title}>{t('Your Rating')}</Text>
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
          <View>
            <Text style={styles.rating_Title}>{t('rateProduct')}</Text>

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

                  <Text style={styles.rating_Title}>
                    {t('addYourComments')}
                  </Text>
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
                    style={commonStyles.btnContainer}
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

        {data?.totalStock > 0 && !complete && !freeSample && (
          <TouchableOpacity
            style={[commonStyles.btnContainer, {marginTop: 20}]}
            onPress={()=> !user?.isGuest ? setshow(true) : setGuestPopUp(true)}
            >
            <Text allowFontScaling={false} style={commonStyles.btnText}>
              {t('buy')}
            </Text>
          </TouchableOpacity>
        )}

        {show && (
          <View style={styles.centeredView}>
            <Overlay
              overlayStyle={{
                padding: 0,
                marginBottom: 0,
                borderRadius: 20,
              }}
              animationType="fade"
              transparent={true}
              onBackdropPress={() => setshow(false)}>
              <View style={styles.centeredView}>
                <View style={styles.modalContainer}>
                  <View style={styles.modalView}>
                    <View style={styles.circle}>
                      <CirclePlus width={33} height={33} />
                    </View>

                    <Text allowFontScaling={false} style={styles.titleText}>
                      {t('selectQuantity')}
                    </Text>

                    <View style={styles.rowContainer}>
                      <TouchableOpacity
                        style={[
                          styles.countCircle,
                          {backgroundColor: colors.warning},
                        ]}
                        onPress={decrement}>
                        <Minus width={24} height={24} />
                      </TouchableOpacity>
                      <Text allowFontScaling={false} style={styles.number}>
                        {count}
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.countCircle,
                          {backgroundColor: colors.primary},
                        ]}
                        onPress={increment}>
                        <Plus width={24} height={24} />
                      </TouchableOpacity>
                    </View>

                    {QuantityError && (
                      <Text allowFontScaling={false} style={styles.errorLabel}>
                        {QuantityError}
                      </Text>
                    )}

                    <View style={styles.rowContainerBetween}>
                      <Text
                        allowFontScaling={false}
                        style={styles.inputHeading}>
                        {t('totalPrice')}:
                      </Text>
                      <Text
                        allowFontScaling={false}
                        style={[styles.inputHeading, {color: colors.primary}]}>
                        {data?.price * count}{' '}
                        <Text
                          allowFontScaling={false}
                          style={{fontSize: 13, fontFamily: fonts.regular}}>
                          {data?.currency?.code}
                        </Text>
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.button}
                      onPress={()=> !user?.isGuest ? handleAdd() : setGuestPopUp(true)}>
                      <Text allowFontScaling={false} style={styles.buttonText}>
                        {t('add')}
                      </Text>
                    </TouchableOpacity>

               
                    <TouchableOpacity onPress={() => setshow(false)}>
                      <Text
                        allowFontScaling={false}
                        style={styles.buttonDismissText}>
                        {t('cancel')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Overlay>
          </View>
        )}
      </KeyboardAwareScrollView>
    </View>
  );
};

export default ProductDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 10,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  image_slider: {
    width: Dimensions.get('window').width - 20,
    height: 171,
    borderRadius: 8,
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
  titleTextsmall: {
    fontFamily: fonts.semiBold,
    color: colors.black,
    fontSize: 18,
    lineHeight: 24,
  },
  priceText: {
    color: colors.black,
    fontSize: 14,
    lineHeight: 17,
    fontFamily: fonts.semiBold,
  },
  regularText: {
    color: colors.black,
    fontSize: 10,
    lineHeight: 17,
    fontFamily: fonts.regular,
  },
  mediumText: {
    color: colors.black,
    fontSize: 10,
    lineHeight: 17,
    fontFamily: fonts.medium,
  },
  genderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginVertical: 20,
  },
  colorsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginVertical: 20,
  },
  colorBox: {
    width: 25,
    height: 25,
    borderRadius: 5,
    marginRight: 15,
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
  currency: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.black,
  },
  centeredView: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    borderRadius: 30,
    color: colors.background,
    width: WP('90'),
    padding: 20,
  },
  modalView: {
    paddingTop: 15,
  },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 44 / 2,
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: colors.whiteGray,
  },
  titleText: {
    fontSize: fontSizes.large,
    width: WP('60'),
    textAlign: 'center',
    fontFamily: fonts.semiBold,
    marginTop: 20,
    color: colors.black,
    alignSelf: 'center',
  },
  blackColor: {
    color: colors.black,
  },
  redColor: {
    color: colors.red,
  },
  descriptionText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 25,
    color: colors.black,
    width: WP('60'),
    textAlign: 'center',
  },
  button: {
    ...commonStyles.btnContainer,
    width: WP('60'),
    marginBottom: 20,
    alignSelf: 'center',
  },
  buttonText: {
    ...commonStyles.btnText,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
  },
  countCircle: {
    width: 36,
    height: 36,
    borderRadius: 36 / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderGrey,
  },
  errorLabel: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 19,
    color: colors.red,
    marginTop: 10,
  },
  inputHeading: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 17,
    color: colors.black,
    marginVertical: 10,
    marginTop: 20,
  },
  colorsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  colorBox: {
    width: 25,
    height: 25,
    borderRadius: 5,
    marginRight: 15,
  },
  selectedColorBox: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  dropdown: {
    flex: 1,
    height: 50, // Fixed height
  },
  placeholderStyle: {
    fontSize: fontSizes.xSmall,
    paddingHorizontal: 10,
    fontFamily: fonts.regular,
    color: colors.placeholderGrey,
  },
  dropDownInput: {
    paddingHorizontal: 10,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: '#000000',
    flex: 1,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowContainerBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonDismissText: {
    textAlign: 'center',
    color: colors.black,
    fontSize: fontSizes.xSmall,
    fontFamily: fonts.regular,
  },
  number: {
    fontSize: fontSizes.large,
    textAlign: 'center',
    fontFamily: fonts.medium,
    marginTop: 20,
    color: colors.black,
    alignSelf: 'center',
  },
  iconStyle: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
  },
});
