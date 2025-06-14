import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
  TextInput,
} from 'react-native';
import React, {useCallback, useState} from 'react';
import {colors, commonStyles, fonts} from '../../utils/styles';
import PhotosList from './PhotosList';
import moment from 'moment';
import {useTranslation} from 'react-i18next';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import GeneralModal from '../modal/GeneralModal';
import Close from '../../../assets/icons/booking/close_Circle.svg';
import {API_ENDPOINTS, postRequest, putRequest} from '../../utils/apiService';
import {useSelector} from 'react-redux';
import RatingStarsCard from '../rating/Rating';
import ImageView from 'react-native-image-viewing';
import * as Yup from 'yup';
import {Formik} from 'formik';
import FastImage from 'react-native-fast-image';
const ListingBookingDetails = ({
  data,
  business,
  setIsLoading,
  setErr,
  setErrMsg,
}) => {
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [images, setImages] = useState([]);
  const [imageIndex, setImageIndex] = useState(0);
  const {t} = useTranslation();
  const navigation = useNavigation();
  const [show, setShow] = useState(false);
  const [rate, setRate] = useState(null);
  const {user} = useSelector(state => state.auth);
  console.log('business', business?.business);

  useFocusEffect(
    useCallback(() => {
      const userExists = data?.reviews?.find(
        review => review?.user?._id === user?._id,
      );
      console.log('Rate:', userExists);
      setRate(userExists);
    }, [data, user]),
  );
  const openImagePreview = (images, index) => {
    const formattedImages = images?.map(image => ({uri: image})) || [];
    setImages(formattedImages);
    setImagePreviewVisible(true);
    setImageIndex(index);
  };
  const status = [
    {id: 1, label: 'Pending Pickup', value: 'pendingConfirm'},
    {id: 2, label: 'Ongoing', value: 'picked'},
    {id: 3, label: 'Previous', value: 'returned'},
  ];
  const matchedStatus = status?.find(
    item => item.value === data?.listingBookingStatus,
  );
  const handleNavigateToMap = coordinates => {
    if (coordinates?.length === 2) {
      const [longitude, latitude] = coordinates;
      const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
      Linking.canOpenURL(mapUrl)
        .then(supported => {
          if (supported) {
            return Linking.openURL(mapUrl);
          } else {
            Alert.alert(
              'Error',
              'Google Maps is not installed or the URL is not supported.',
            );
          }
        })
        .catch(err => {
          console.error('An error occurred', err);
        });
    }
  };
  const handleCancel = async () => {
    setShow(false);
    setIsLoading(true);
    const response = await putRequest(
      `${API_ENDPOINTS.listingBookings.cancel}${data?._id}`,
      {listingBookingStatus: 'cancelled'},
    );
    if (response.success) {
      setIsLoading(false);
      navigation.navigate('Home', {
        screen: 'Booking',
        params: {focused: true},
      });
    } else {
      setIsLoading(false);
      setErr(true);
      setErrMsg(
        response.error ||
          'An unexpected error has occurred. Please try again later.',
      );
    }
  };
  const AddReview = async (values, {resetForm}) => {
    const payload = {
      comment: values.comment,
      rating: values.rating,
      targetType: 'listings',
      targetId: data?.listing,
      booking: data?._id,
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

  const reviewSchema = Yup.object().shape({
    rating: Yup.number()
      .min(1, t('ratingRequired'))
      .required(t('ratingRequired')),
    comment: Yup.string().required(t('commentRequired')),
  });
  
  return (
    <View style={{marginHorizontal: 10}}>
      {matchedStatus && (
        <View style={styles.previous}>
          <Text style={styles.text}>{matchedStatus?.label}</Text>
          <View style={styles.box}>
            <Text style={[styles.hourly, {color: colors.white}]}>
              {' '}
              {data?.bookingType?.charAt(0).toUpperCase() +
                data?.bookingType?.slice(1)}
            </Text>
          </View>
        </View>
      )}
      <View style={styles.parent}>
        <Text style={[styles.text, {color: colors.black}]}>
          Booking Details
        </Text>
        <Text style={styles.hourly}>{data?.bookingNumber}</Text>
        <View style={styles.img_parent}>
          <TouchableOpacity
            onPress={() => openImagePreview(data?.listingDataSnapshot?.images)}>
            <FastImage
              source={{uri: data?.listingDataSnapshot?.images[0]}}
              style={styles.img}
            />
          </TouchableOpacity>
          <View style={{flex: 1}}>
            <Text style={styles.electric}>
              {data?.listingDataSnapshot?.name}
            </Text>
            <Text
              style={[
                styles.hourly,
                {fontFamily: fonts.regular, lineHeight: 15},
              ]}
              numberOfLines={2}>
              {data?.listingDataSnapshot?.description}
            </Text>
          </View>
        </View>

        {data?.bookingType === 'hourly' && (
          <View style={[styles.child, {marginVertical: 5}]}>
            <View style={{flexDirection: 'row', gap: 5}}>
              <Text
                allowFontScaling={false}
                style={[styles.booking, {fontSize: 12, color: colors.primary}]}>
                Hours
              </Text>
              <View style={styles.clock}>
                <Image
                  source={require('../../../assets/icons/clock.png')}
                  style={{width: 16, height: 16, tintColor: colors.primary}}
                />
                <Text allowFontScaling={false} style={styles.time}>
                  {data?.duration?.hours}
                </Text>
              </View>
            </View>
            <View style={{flexDirection: 'row', gap: 5}}>
              <Text
                allowFontScaling={false}
                style={[styles.booking, {fontSize: 12, color: colors.primary}]}>
                Date
              </Text>
              <View style={styles.clock}>
                <Image
                  source={require('../../../assets/icons/calender.png')}
                  style={{width: 16, height: 16}}
                />
                <Text allowFontScaling={false} style={styles.time}>
                  {moment(data?.endTime).format('DD-MM-YYYY')}
                </Text>
              </View>
            </View>
          </View>
        )}

        {data?.bookingType === 'daily' && (
          <View style={[styles.pending, {marginVertical: 5}]}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
              <Text
                allowFontScaling={false}
                style={[styles.booking, {fontSize: 12, color: colors.primary}]}>
                Date From
              </Text>
              <View style={styles.clock}>
                <Image
                  source={require('../../../assets/icons/calender.png')}
                  style={{width: 16, height: 16, tintColor: colors.primary}}
                />
                <Text allowFontScaling={false} style={styles.time}>
                  {moment(data?.startTime).format('DD-MM-YYYY')}
                </Text>
              </View>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                marginTop: 5,
              }}>
              <Text
                allowFontScaling={false}
                style={[styles.booking, {fontSize: 12, color: colors.primary}]}>
                Date To
              </Text>
              <View style={styles.clock}>
                <Image
                  source={require('../../../assets/icons/calender.png')}
                  style={{width: 16, height: 16, tintColor: colors.primary}}
                />
                <Text allowFontScaling={false} style={styles.time}>
                  {moment(data?.endTime).format('DD-MM-YYYY')}
                </Text>
              </View>
            </View>
          </View>
        )}

        {business && (
          <TouchableOpacity
            onPress={() =>
              handleNavigateToMap(business?.address?.location?.coordinates)
            }>
            <Text allowFontScaling={false} style={styles.pickup}>
              Pickup Location
            </Text>
            <Text allowFontScaling={false} style={styles.locate}>
              {business?.address?.line1}
            </Text>
          </TouchableOpacity>
        )}

        <Text style={styles.hourly}>Booking Note</Text>
        <Text style={[styles.hourly, {fontFamily: fonts.regular}]}>
          {data?.notes || t('N/A')}
        </Text>
        {(data?.listingBookingStatus === 'picked' ||
          data?.listingBookingStatus === 'returned') && (
          <>
            <View style={{flexDirection: 'row', gap: 15, marginTop: 10}}>
              <Text style={[styles.hourly, {color: colors.black}]}>
                Pickup Time
              </Text>
              <View
                style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                <Image
                  source={require('../../../assets/icons/clock.png')}
                  style={{width: 16, height: 16, tintColor: colors.primary}}
                />
                <Text style={[styles.hourly, {fontFamily: fonts.regular}]}>
                  {moment(data?.pickup?.date).format('DD-MM-YYYY hh:mm A')}
                </Text>
              </View>
            </View>
            {data?.dropoff && data?.dropoff?.images?.length > 0 && (
              <View style={{flexDirection: 'row', gap: 15, marginVertical: 5}}>
                <Text style={[styles.hourly, {color: colors.black}]}>
                  Return Time
                </Text>
                <View
                  style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                  <Image
                    source={require('../../../assets/icons/clock.png')}
                    style={{width: 16, height: 16, tintColor: colors.primary}}
                  />
                  <Text style={[styles.hourly, {fontFamily: fonts.regular}]}>
                    {moment(data?.dropoff?.date).format('DD-MM-YYYY hh:mm A')}
                  </Text>
                </View>
              </View>
            )}
          </>
        )}

        <View style={[styles.profilecontainer, {marginTop: 10}]}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 15}}>
            <FastImage
              source={{uri: business?.image}}
              style={{width: 50, height: 50, borderRadius: 50 / 2}}
            />
            <Text style={styles.hourly}>{business?.name}</Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('ChatDetail', {
                userId: business?.business?.partner,
                userImg: business?.image,
                userName: business?.name,
              })
            }>
            <Image
              source={require('../../../assets/icons/chat.png')}
              style={{width: 20, height: 20, tintColor: colors.primary}}
            />
          </TouchableOpacity>
        </View>

        {(data?.listingBookingStatus === 'picked' ||
          data?.listingBookingStatus === 'returned') && (
          <>
            <PhotosList
              data={data?.pickup?.images}
              pickup={'Pickup Photos'}
              note={'Pickup Note'}
              msg={data?.pickup?.note || 'N/A'}
              handlePress={(images, index) => openImagePreview(images, index)}
            />
            {data?.listingBookingStatus === 'returned' && (
              <PhotosList
                data={data?.dropoff?.images}
                pickup={'Drop Off Photos'}
                note={'Drop Off Note'}
                msg={data?.dropoff?.note || 'N/A'}
                handlePress={(images, index) => openImagePreview(images, index)}
              />
            )}
          </>
        )}
      </View>
      {data?.listingBookingStatus === 'returned' && rate && (
        <View style={{marginHorizontal: 10}}>
          <Text style={styles.rating_Title}>{t('YourRating')}</Text>
          <RatingStarsCard rating={rate?.rating} read={true} />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={t('typeHere')}
            placeholderTextColor="#000000B2"
            multiline={true}
            numberOfLines={6}
            textAlignVertical="top"
            value={rate?.comment}
            readOnly
          />
        </View>
      )}

      {data?.listingBookingStatus === 'returned' && !rate && (
        <View style={{marginHorizontal: 10}}>
          <Text style={styles.rating_Title}>{t('rateListing')}</Text>

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

      {data?.listingBookingStatus === 'pendingConfirm' && (
        <TouchableOpacity
          style={commonStyles.btnContainer}
          onPress={() => navigation.navigate('ConfirmPickup', {id: data?._id,business})}>
          <Text allowFontScaling={false} style={[commonStyles.btnText]}>
            Pickup Now
          </Text>
        </TouchableOpacity>
      )}

      {data?.listingBookingStatus === 'picked' && (
        <TouchableOpacity
          style={commonStyles.btnContainer}
          onPress={() => navigation.navigate('ReturnListing', {id: data?._id})}>
          <Text allowFontScaling={false} style={commonStyles.btnText}>
            Return Listing
          </Text>
        </TouchableOpacity>
      )}

      {data?.listingBookingStatus === 'pendingConfirm' && (
        <TouchableOpacity
          onPress={() => setShow(!show)}
          style={[
            commonStyles.btnContainer,
            {
              marginTop: 10,
              marginBottom: Platform.OS === 'ios' ? 20 : 15,
              shadowColor: null,
            },
            {backgroundColor: '#AB0000'},
          ]}>
          <Text
            allowFontScaling={false}
            style={[commonStyles.btnText, {marginTop: 0}]}>
            Cancel Booking
          </Text>
        </TouchableOpacity>
      )}

      {imagePreviewVisible && (
        <View style={{zIndex: 999}}>
          <ImageView
            images={images}
            imageIndex={imageIndex}
            visible={imagePreviewVisible}
            onRequestClose={() => setImagePreviewVisible(false)}
          />
        </View>
      )}

      {show && (
        <GeneralModal
          modalSuccess={true}
          imageSource={<Close width={38} height={38} />}
          title={'Cancel Booking'}
          description={'Are you sure you want to cancel the booking?'}
          yesBtnTitle={'Cancel Booking'}
          noBtnTitle={'Not Now'}
          handleNoPress={() => setShow(false)}
          handleYesPress={handleCancel}
          Set_Modal_Visibilty={setShow}
        />
      )}
    </View>
  );
};

export default ListingBookingDetails;

const styles = StyleSheet.create({
  box: {
    height: 24,
    paddingHorizontal: 20,
    backgroundColor: colors.primary,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previous: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.black,
  },
  hourly: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.black,
  },
  parent: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: colors.whiteGray,
    marginVertical: 15,
  },
  img: {
    width: 70,
    height: 60,
    borderRadius: 5,
  },
  electric: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.black,
  },
  img_parent: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 10,
    marginTop: 5,
  },
  child: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '60%',
    marginVertical: 10,
    gap: 15,
  },
  centerline: {
    borderWidth: 1,
    borderColor: '#FFFFFF33',
    borderStyle: 'dashed',
    height: '70%',
  },
  line: {
    borderWidth: 1,
    borderColor: '#FFFFFF08',
    marginVertical: 10,
  },
  profilecontainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  bottom: {
    marginVertical: 14,
    padding: 15,
    backgroundColor: colors.whiteGray,
    borderRadius: 10,
  },
  time: {
    color: colors.black,
    fontSize: 12,
    fontFamily: fonts.regular,
  },
  clock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  pickup: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.primary,
  },
  locate: {
    color: colors.black,
    fontSize: 12,
    fontFamily: fonts.regular,
    marginBottom: 5,
  },
  line: {
    borderWidth: 1,
    marginVertical: 5,
    borderColor: colors.borderColor,
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
  input: {
    borderWidth: 1,
    borderColor: colors.borderGrey,
    padding: 15,
    marginBottom: 15,
    borderRadius: 5,
    fontFamily: fonts.regular,
  },
});
