import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  Animated,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
} from 'react-native';

import {colors, commonStyles, fontSizes, fonts} from '../../utils/styles';

import {widthPercentageToDP as WP} from 'react-native-responsive-screen';
import {useTranslation} from 'react-i18next';
import CustomHeader from '../../components/header/CustomHeader';
import Close from '../../../assets/icons/booking/close_Circle.svg';

import GeneralModal from '../../components/modal/GeneralModal';
import {
  RemoveSelectedSubscription,
  SetSelectedSubscription,
} from '../../store/slices/cart';
const {width} = Dimensions.get('window');
import {useDispatch} from 'react-redux';
import Toast from 'react-native-toast-message';
import {API_ENDPOINTS, postRequest, putRequest} from '../../utils/apiService';

import {getRequest} from '../../utils/apiService';
import {useFocusEffect} from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import RatingStarsCard from '../../components/rating/Rating';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {useSelector} from 'react-redux';
import {ActivityIndicator} from 'react-native';
import ImagePreview from '../../components/imagePreview/ImagePreview';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import GuestModal from '../../components/guest-modal/GuestModal';
const SubscriptionDetail = ({route, navigation}) => {
  const {id, state, bookingId, subscriptionId} = route.params;

  const complete = route?.params?.complete;
  const status = route?.params?.status;

  console.log('id', id);
  const flatListRef = useRef(null);
  const {t} = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const dispatch = useDispatch();
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [images, setImages] = useState([]);
  const [imageIndex, setimageIndex] = useState(0);
  const [showPopUp, setShowPopUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [SingleSubscription, SetSingleSubscription] = useState({});
  const {selectSubscription} = useSelector(state => state.cart);
  const [guestPopUp, setGuestPopUp] = useState(false);
  const {user} = useSelector(state => state.auth)

  const reviewSchema = Yup.object().shape({
    rating: Yup.number()
      .min(1, t('ratingRequired'))
      .required(t('ratingRequired')),
    comment: Yup.string().required(t('commentRequired')),
  });

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [id]),
  );

  const fetchData = async () => {
    setIsLoading(true);
    const result = await getRequest(
      `${API_ENDPOINTS.subscription.getSingle}/${id}`,
    );
    console.log('result', result);
    setIsLoading(false);
    if (result.success) {
      SetSingleSubscription(result?.data);
    } else {
      setErr(true);
      setErrMsg(result.error);
    }
  };

  const checkAlreadySelected = () => {
    return selectSubscription?.find(
      service => service?._id === SingleSubscription?._id,
    );
  };

  useFocusEffect(
    React.useCallback(() => {
      checkAlreadySelected();
    }, [SingleSubscription, selectSubscription]),
  );

  const AddtoBooking = () => {
    dispatch(SetSelectedSubscription(SingleSubscription));
    Toast.show({
      type: 'success',
      position: 'top',
      bottomOffset: 20,
      text1: t('success'),
      text2: t('subscriptionAddSuccessfully'),
      visibilityTime: 3000,
    });
    navigation.navigate('HomeDetails', {id: SingleSubscription?.branch});
  };

  const removeFromBooking = () => {
    dispatch(RemoveSelectedSubscription(SingleSubscription?._id));
    Toast.show({
      type: 'success',
      position: 'top',
      bottomOffset: 20,
      text1: t('success'),
      text2: t('subscriptionRemoveSuccessfully'),
      visibilityTime: 3000,
    });
    navigation.navigate('HomeDetails', {id: SingleSubscription?.branch});
  };

  const handleAddRemove = () => {
    if (checkAlreadySelected()) {
      removeFromBooking();
    } else {
      AddtoBooking();
    }
  };

  const SubscriptionCancel = async () => {
    setShowPopUp(false);
    setIsLoading(true);
    const data = {
      bookingId: bookingId,
      subscriptionId: subscriptionId,
      isActive: false,
    };
    const result = await putRequest(
      `${API_ENDPOINTS.subscription.cancel}`,
      data,
    );
    console.log('result', result);
    setIsLoading(false);
    if (result.success) {
      navigation.goBack();
    } else {
      setErr(true);
      setErrMsg(result.error);
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
          {SingleSubscription?.category?.name}
        </Text>
      </View>
    </View>
  );

  const onViewableItemsChanged = useRef(({viewableItems}) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  });
  console.log('category', SingleSubscription?.category?.name);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const handleCancel = () => {
    console.log('Cancelled');
    setShowPopUp(!showPopUp);
  };

  const AddReview = async (values, {resetForm}) => {
    const payload = {
      comment: values.comment,
      rating: values.rating,
      targetType: 'subscriptions',
      targetId: id,
      booking: bookingId,
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

  const loginUserReview = SingleSubscription?.reviews?.find(
    data => data.booking === bookingId,
  );

  console.log('subscription', SingleSubscription);

  return (
    <SafeAreaView style={styles.container}>
      {err && (
        <GeneralModal
          modalError={true}
          description={errMsg}
          Set_Modal_Visibilty={setErr}
        />
      )}

      <CustomHeader title={t('details')} />
      {isLoading ? (
        <View
          style={{
            justifyContent: 'flex-start',
            alignItems: 'center',
            marginTop: 20,
            flex: 1,
          }}>
          <ActivityIndicator size={'large'} color={colors.primary} />
        </View>
      ) : (
        <KeyboardAwareScrollView
          enableAutomaticScroll
          extraScrollHeight={20}>
          <View style={{marginHorizontal: 10}}>
            <FlatList
              ref={flatListRef}
              data={SingleSubscription?.images}
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
          </View>

          <View style={styles.pagination}>
            {SingleSubscription?.images?.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, currentIndex === index && styles.activeDot]}
              />
            ))}
          </View>

          <View style={styles.innerContainer}>
            <Text allowFontScaling={false} style={styles.title}>
              {SingleSubscription?.title}
            </Text>
            <View style={styles.priceContainer}>
              <Text allowFontScaling={false} style={styles.price}>
                {SingleSubscription?.price?.toFixed(2)}
              </Text>
              <Text allowFontScaling={false} style={styles.currency}>
                {SingleSubscription?.currency?.code}
              </Text>
            </View>
            <Text allowFontScaling={false} style={styles.description}>
              {SingleSubscription?.description}
            </Text>

            <View style={styles.dateContainer}>
              <View>
                <Text allowFontScaling={false} style={styles.title}>
                  {t('frequency')}
                </Text>
                <Text allowFontScaling={false} style={styles.description}>
                  {SingleSubscription?.frequency}
                </Text>
              </View>

              <View>
                <Text allowFontScaling={false} style={styles.title}>
                  {t('interval')}
                </Text>
                <Text allowFontScaling={false} style={styles.description}>
                  {SingleSubscription?.interval}
                </Text>
              </View>
            </View>

            <View style={styles.bottomContainer}>
              {!complete && (
                <>
                  {state ? (
                    <TouchableOpacity
                      style={[
                        commonStyles.btnDelContainer,
                        {
                          backgroundColor: checkAlreadySelected()
                            ? colors.cancel
                            : colors.primary,
                        },
                      ]}
                      onPress={()=> !user?.isGuest ? handleAddRemove() : setGuestPopUp(true)}>
                      <Text
                        allowFontScaling={false}
                        style={[
                          commonStyles.btnText,
                          {fontFamily: fonts.regular},
                        ]}>
                        {checkAlreadySelected()
                          ? t('remove')
                          : t('addtobooking')}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    status === 'ongoing' && (
                      <TouchableOpacity
                        style={[
                          commonStyles.btnDelContainer,
                          {backgroundColor: colors.cancel},
                        ]}
                        onPress={handleCancel}>
                        <Text
                          allowFontScaling={false}
                          style={[
                            commonStyles.btnText,
                            {fontFamily: fonts.regular},
                          ]}>
                          {t('cancel')}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </>
              )}

              {complete && loginUserReview && (
                <View>
                  <Text style={styles.rating_Title}>{t('Your Rating')}</Text>
                  <RatingStarsCard
                    rating={loginUserReview?.rating}
                    read={true}
                  />
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
                  <Text style={styles.rating_Title}>
                    {t('rateSubscription')}
                  </Text>

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
                          onRatingChange={rating =>
                            setFieldValue('rating', rating)
                          }
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
                          <Text
                            allowFontScaling={false}
                            style={commonStyles.btnText}>
                            {t('save')}
                          </Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </Formik>
                </View>
              )}
            </View>
          </View>
        </KeyboardAwareScrollView>
      )}

      {showPopUp && (
        <GeneralModal
          modalSuccess={showPopUp}
          Set_Modal_Visibilty={setShowPopUp}
          imageSource={<Close width={38} height={38} />}
          title={t('cancelSubscription')}
          description={t('areyousureyouwanttocancelthissubscription?')}
          yesBtnTitle={t('yesCancel')}
          handleYesPress={SubscriptionCancel}
          noBtnTitle={t('dismiss')}
          handleNoPress={() => setShowPopUp(false)}
        />
      )}
      {guestPopUp && (
        <GuestModal showPopUp={guestPopUp} setShowPopUp={setGuestPopUp} />
      )}
      <ImagePreview
        images={images}
        isVisible={isPreviewVisible}
        onClose={() => setIsPreviewVisible(false)}
        imageIndex={imageIndex}
      />
    </SafeAreaView>
  );
};

export default SubscriptionDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  itemContainer: {
    borderRadius: 10,
    marginRight: 10,
    marginTop: 10,
    minHeight: 120,
    paddingRight: 15,
    elevation: 3,
    position: 'relative',
  },
  innerContainer: {
    padding: 10,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 10,
  },
  title: {
    fontSize: fontSizes.xMedium,
    fontFamily: fonts.bold,
    color: colors.black,
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
  rowContainer: {
    flexDirection: 'row',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  date: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.black,
    marginLeft: 7,
  },
  description: {
    fontSize: fontSizes.xSmall,
    fontFamily: fonts.regular,
    color: colors.black,
    marginVertical: 5,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  price: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.bold,
    color: colors.black,
  },
  currency: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.black,
    marginLeft: 5,
  },
  bottomContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginTop: 40,
  },
  image_slider: {
    width: Dimensions.get('window').width - 20,
    height: 171,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  frequency_button: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: colors.lightBlue,
    marginTop: 10,
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
});
