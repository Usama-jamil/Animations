import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  Platform,
  Linking,
} from 'react-native';
import React, {useState} from 'react';
import {colors, fontSizes, fonts} from '../../utils/styles';
import Clock from '../../../assets/icons/booking/clock-light-stroke.svg';
import {useTranslation} from 'react-i18next';
import {widthPercentageToDP} from 'react-native-responsive-screen';
import {commonStyles} from '../../utils/styles';
import PhoneIcon from '../../../assets/icons/phone.svg';
import Close from '../../../assets/icons/booking/close_Circle.svg';
import Chat from '../../../assets/icons/message_square_chat.svg';
import WaitingArrrival from '../../../assets/icons/booking/barbershop_waiting.svg';
import WaitingON from '../../../assets/icons/booking/waiting_Queue.svg';
import ONWay from '../../../assets/icons/booking/On_Way.svg';
import GeneralModal from '../modal/GeneralModal';
import moment from 'moment';
import BookingWaiting from './BookingWaiting';
import CancelModal from '../modal/CancelModal';
import {API_ENDPOINTS, postRequest, putRequest} from '../../utils/apiService';
import {useNavigation} from '@react-navigation/native';
import {ActivityIndicator} from 'react-native';
import FastImage from 'react-native-fast-image';
import CountryFlag from 'react-native-country-flag';
import {useSelector} from 'react-redux';
import RatingStarsCard from '../rating/Rating';
import {Formik} from 'formik';
import * as Yup from 'yup';
import ProfessionalLocation from '../booking/ProfessionalLocation';
import Receipt from './Receipt';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

const BookingDetailsComponent = ({data, businessdata, fetchData}) => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const bookingDate = new Date(data?.date);
  const [cancelReason, SetcancelReason] = useState('');
  const [cancelOption, setCancelOption] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const {user} = useSelector(state => state.auth);
  const [showLateCancelPopup, setShowLateCancelPopup] = useState(false);
  const currentDate = new Date();
  const [selectedTip, setSelectedTip] = useState(5);
  const [customTip, setCustomTip] = useState('');
  const [customTipError, setCustomTipError] = useState('');
  const [showConfirmArrivalPopup, setShowConfirmArrivalPopup] = useState(false);

  const handleTipSelect = tip => {
    setSelectedTip(tip);
    setCustomTip(tip.toString()); // Update TextInput with selected button value
  };

  const handleCustomTipChange = value => {
    setCustomTip(value);
    setSelectedTip(null); // Clear button selection if user enters a custom amount
  };

  const handleConfirmArrival = () => {
    setShowConfirmArrivalPopup(true); // Show the popup when the button is pressed
  };

  const isSameDay = (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const isBookingToday = isSameDay(currentDate, bookingDate);

  const [showPopUp, setShowPopUp] = useState(false);
  const [showCancelPopUp, setShowCancelPopUp] = useState(false);

  const reviewSchema = Yup.object().shape({
    rating: Yup.number()
      .min(1, t('ratingRequired'))
      .required(t('ratingRequired')),
    comment: Yup.string().required(t('commentRequired')),
  });

  const bookingCancel = async () => {
    const payload = {
      reason: cancelOption,
      ...(cancelReason && {description: cancelReason}),
    };

    setIsLoading(true);

    const result = await putRequest(
      `${API_ENDPOINTS.booking.cancel}${data._id}`,
      payload,
    );
    setIsLoading(false);
    if (result.success) {
      navigation.goBack();
    } else {
      setShowCancelPopUp(false);
      setErr(true);
      setErrMsg(result.error);
    }
  };

  const handleCancel = () => {
    setShowPopUp(!showPopUp);
  };

  const handleYes = () => {
    setShowPopUp(!showPopUp);
    const now = moment(); // Current time
    const bookingTime = moment(data?.startTime); // Booking time

    // Check if current time is within the cancellation period
    const hoursUntilBooking = bookingTime.diff(now, 'hours');
    if (hoursUntilBooking <= businessdata?.cancellationPeriod) {
      // Show late cancellation popup with fee
      setTimeout(() => {
        setShowLateCancelPopup(true);
      }, 300);
    } else {
      // Show regular cancellation popup
      setTimeout(() => {
        setShowCancelPopUp(!showCancelPopUp);
      }, 300);
    }
  };

  const confirmArrival = async () => {
    const payloaddata = {
      arrivedAt: currentDate,
    };
    setIsLoading(true);

    const result = await putRequest(
      `${API_ENDPOINTS.booking.confirmArrival}${data?._id}`,
      payloaddata,
    );
    setIsLoading(false);
    if (result.success) {
      fetchData();
    } else {
      setErr(true);
      setErrMsg(result.error);
    }
  };

  const handleChat = async (name, image, id) => {
    if (user?.email) {
      navigation.navigate('ChatDetail', {
        userName: name,
        userImg: image,
        userId: id,
      });
    }
  };

  const AddReview = async (values, {resetForm}) => {
    const payload = {
      comment: values.comment,
      rating: values.rating,
      targetType: 'branches',
      targetId: data?.branch,
      booking: data?._id,
    };

    setIsLoading(true);

    const result = await postRequest(`${API_ENDPOINTS.review.add}`, payload);
    setIsLoading(false);
    if (result.success) {
      fetchData();
      resetForm(); // Reset the form after successful submission
    } else {
      setErr(true);
      setErrMsg(result.error);
    }
  };

  const description = t('LateCancellationDes', {
    lateCancellationCharge: businessdata?.lateCancellationCharge,
    currencyCode: businessdata?.currency?.code,
  });

  return (
    <View style={{marginHorizontal: 10}}>
      {err && (
        <GeneralModal
          modalError={true}
          description={errMsg}
          Set_Modal_Visibilty={setErr}
        />
      )}
      {isLoading ? (
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 20,
          }}>
          <ActivityIndicator size={'large'} color={colors.primary} />
        </View>
      ) : (
        <>
          <KeyboardAwareScrollView
            contentContainerStyle={{flex: 1}}
            enableAutomaticScroll
            extraScrollHeight={20}>
            <Text allowFontScaling={false} style={styles.title}>
              {t('bookingDetails')}
            </Text>

            <Text allowFontScaling={false} style={styles.bookingId}>
              {t('ID')}: {data?.bookingNumber || t('N/A')}
            </Text>

            <View style={styles.rowInnerRight}>
              <Clock width={24} height={24} />
              <Text allowFontScaling={false} style={styles.dateTime}>
                {moment(data?.date).format('MMMM Do YYYY')} {t('at')}{' '}
                {data?.startTime
                  ? moment(data?.startTime).format('h:mm A')
                  : t('notAvailable')}
              </Text>
            </View>
            <View
              style={[
                styles.itemContainer,
                {backgroundColor: colors.whiteGray},
              ]}>
              <Text allowFontScaling={false} style={styles.title}>
                {t('service')}
              </Text>
              {data?.services?.length > 0 &&
                data?.services?.map((item, index) => (
                  <TouchableOpacity
                    style={styles.rowContainer}
                    index={index}
                    disabled={
                      data?.status === 'cancelled' ||
                      data?.status === 'inprogress'
                    }
                    onPress={() =>
                      navigation.navigate('ServiceDetails', {
                        id: item?.service?._id,
                        complete: true,
                        bookingid: data?._id,
                      })
                    }>
                    <FastImage
                      source={{uri: item.service?.images[0]}}
                      style={styles.image}
                      resizeMode="cover"
                    />
                    <View style={styles.contentContainer}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}>
                        <Text
                          allowFontScaling={false}
                          style={[
                            styles.title,
                            {color: colors.primary, flex: 1},
                          ]}>
                          {item?.service?.title}
                        </Text>
                        {data?.status === 'completed' && (
                          <Text
                            allowFontScaling={false}
                            style={[styles.title, {color: colors.primary}]}>
                            {t('rateService')}
                          </Text>
                        )}
                      </View>

                      <View style={styles.priceContainer}>
                        <Text allowFontScaling={false} style={styles.price}>
                          {(item?.service?.offer
                            ? (item?.service?.price || 0) -
                              (item?.service?.offer?.discount || 0)
                            : item?.service?.price || 0
                          ).toFixed(2)}
                        </Text>
                        <Text allowFontScaling={false} style={styles.currency}>
                          {data?.currency?.code}
                        </Text>
                      </View>

                      {item?.service?.time && (
                        <Text allowFontScaling={false} style={styles.subtext}>
                          {item?.service?.time}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}

              {data?.fare > 0 && (
                <View style={styles.priceContainer}>
                  <Text allowFontScaling={false} style={styles.price}>
                    {t('fare')} {data?.fare?.toFixed(2)}
                  </Text>
                  <Text allowFontScaling={false} style={styles.currency}>
                    {data?.currency?.code}
                  </Text>
                </View>
              )}

              <Text
                allowFontScaling={false}
                style={[styles.title, {marginTop: 10}]}>
                {t('notes')}
              </Text>
              <Text
                allowFontScaling={false}
                style={[
                  styles.subtext,
                  {
                    width: widthPercentageToDP('70%'),
                    lineHeight: 18,
                    marginVertical: 10,
                  },
                ]}>
                {data?.note || t('N/A')}
              </Text>

              <Text
                allowFontScaling={false}
                style={[styles.date, {color: colors.lightBlack}]}>
                {moment(data?.startTime).fromNow()}
              </Text>

              <>
                {data?.services?.filter(
                  (service, index, self) =>
                    index ===
                    self.findIndex(
                      s =>
                        s?.professional?.user?._id ===
                        service?.professional?.user?._id,
                    ),
                ).length > 0 && (
                  <>
                    <Text
                      allowFontScaling={false}
                      style={[styles.title, {marginTop: 10}]}>
                      {t('bookingWith')}
                    </Text>
                    {data?.services
                      ?.filter(
                        (service, index, self) =>
                          index ===
                          self.findIndex(
                            s =>
                              s?.professional?.user?._id ===
                              service?.professional?.user?._id,
                          ),
                      )
                      .map(
                        service =>
                          service?.professional && (
                            <View
                              key={service?.professional?.user?._id}
                              style={[
                                styles.rowContainer,
                                {
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                },
                              ]}>
                              <View
                                style={[styles.rowInnerRight, {marginTop: 10}]}>
                                <FastImage
                                  source={{
                                    uri: service?.professional?.user?.image,
                                  }}
                                  style={styles.Avatar_image}
                                />
                                <View>
                                  <Text
                                    allowFontScaling={false}
                                    style={styles.title}>
                                    {service?.professional?.user?.name}
                                  </Text>
                                  <Text
                                    allowFontScaling={false}
                                    style={styles.subtext}>
                                    {service?.professional?.jobTitle}
                                  </Text>
                                </View>
                              </View>

                              <TouchableOpacity
                                style={styles.chat_icon}
                                onPress={() =>
                                  handleChat(
                                    service?.professional?.user?.name,
                                    service?.professional?.user?.image,
                                    service?.professional?.user?._id,
                                  )
                                }>
                                <Chat width={24} height={24} />
                              </TouchableOpacity>
                            </View>
                          ),
                      )}
                  </>
                )}
              </>

              {data?.status !== 'completed' &&
                data?.status !== 'cancelled' &&
                isBookingToday &&
                data?.bookingFor === 'inplace' && (
                  <>
                    {!data?.arrivedAt ? (
                      <BookingWaiting
                        image={<WaitingArrrival width={192} height={192} />}
                        title={t('bookingWaiting')}
                        description={t('areYouArrived?')}
                      />
                    ) : (
                      <BookingWaiting
                        image={<WaitingON width={192} height={192} />}
                        title={t('waitingOn')}
                        description={t('youAreInQueue')}
                      />
                    )}
                  </>
                )}

              {data?.status !== 'completed' &&
                isBookingToday &&
                data?.bookingFor === 'homeservice' && (
                  <>
                    {data?.onTheWayStatus === 'on-way' && (
                      <>
                        <BookingWaiting
                          image={<ONWay width={192} height={192} />}
                          title={t('onWay')}
                          description={t('onWayDes')}
                        />
                        {businessdata?.address?.location && (
                          <View
                            style={{height: 200, width: '100%', marginTop: 5}}>
                            <ProfessionalLocation
                              id={data?._id}
                              initallocation={businessdata?.address?.location}
                              userlocation={data?.user?.address?.location}
                            />
                          </View>
                        )}
                      </>
                    )}
                    {data?.onTheWayStatus === 'not-started' && (
                      <BookingWaiting
                        image={<ONWay width={192} height={192} />}
                        title={t('notStarted')}
                        description={t('notStartedDes')}
                      />
                    )}

                    {data?.onTheWayStatus === 'arrived' && (
                      <BookingWaiting
                        image={<ONWay width={192} height={192} />}
                        title={t('arrived')}
                        description={t('arrivedDes')}
                      />
                    )}
                  </>
                )}
            </View>
            {data?.subscriptions?.length > 0 && (
              <View
                style={[
                  styles.itemContainer,
                  {backgroundColor: colors.whiteGray, marginTop: 10},
                ]}>
                <Text allowFontScaling={false} style={styles.title}>
                  {t('mySubscriptions')}
                </Text>

                {data?.subscriptions?.map((item, index) => (
                  <TouchableOpacity
                    disabled={
                      data?.status === 'cancelled' ||
                      data?.status === 'inprogress'
                    }
                    onPress={() =>
                      navigation.navigate('SubscriptionDetail', {
                        id: item?.subscription?._id,
                        complete: true,
                        state: true,
                        bookingId: data?._id,
                        subscriptionId: '',
                      })
                    }>
                    <Text
                      allowFontScaling={false}
                      style={[styles.subtitle, {marginTop: 10}]}>
                      {item?.subscription?.title}
                    </Text>
                    <Text
                      allowFontScaling={false}
                      style={[styles.subtext, {color: colors.lightBlack}]}>
                      {item?.subscription?.category?.name}
                    </Text>

                    <View
                      style={[
                        styles.rowContainer,
                        {justifyContent: 'space-between'},
                      ]}>
                      <View style={styles.priceContainer}>
                        <Text
                          allowFontScaling={false}
                          style={[styles.price, {color: colors.primary}]}>
                          {item?.subscription?.price?.toFixed(2)}
                        </Text>
                        <Text allowFontScaling={false} style={styles.currency}>
                          {data?.currency?.code} /{' '}
                          {item?.subscription?.frequency}
                        </Text>
                      </View>
                      {data?.status === 'completed' && (
                        <Text
                          allowFontScaling={false}
                          style={[styles.title, {color: colors.primary}]}>
                          {t('rateSubscription')}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {data?.inventories?.length > 0 && (
              <View
                style={[
                  styles.itemContainer,
                  {backgroundColor: colors.whiteGray, marginTop: 10},
                ]}>
                <Text allowFontScaling={false} style={styles.title}>
                  {t('products')}
                </Text>
                {data?.inventories?.map((item, index) => (
                  <>
                    <TouchableOpacity
                      disabled={
                        data?.status === 'cancelled' ||
                        data?.status === 'inprogress'
                      }
                      onPress={() =>
                        navigation.navigate('ProductDetails', {
                          id: item?.inventory?._id,
                          complete: true,
                          bookingid: data?._id,
                        })
                      }>
                      <View
                        style={[
                          styles.rowContainer,
                          {justifyContent: 'space-between'},
                        ]}>
                        <View style={{flex: 1}}>
                          <Text
                            allowFontScaling={false}
                            style={styles.subtitle}>
                            {item?.inventory?.variants[0]?.variantTitle ||
                              item?.inventory?.title}
                          </Text>
                          <Text
                            allowFontScaling={false}
                            style={[
                              styles.subtext,
                              {color: colors.lightBlack},
                            ]}>
                            {item?.inventory?.category?.name}
                          </Text>
                        </View>

                        <View style={styles.circle}>
                          <Text
                            allowFontScaling={false}
                            style={[
                              styles.title,
                              {
                                fontFamily: fonts.regular,
                                color: colors.background,
                              },
                            ]}>
                            x{item?.quantity}
                          </Text>
                        </View>
                      </View>

                      <View
                        style={[
                          styles.rowContainer,
                          {justifyContent: 'space-between'},
                        ]}>
                        <View style={styles.priceContainer}>
                          <Text
                            allowFontScaling={false}
                            style={[styles.price, {color: colors.primary}]}>
                            {item?.inventory?.variants[0]?.price?.toFixed(2) ||
                              item?.inventory?.price?.toFixed(2)}
                          </Text>
                          <Text
                            allowFontScaling={false}
                            style={styles.currency}>
                            {item?.inventory?.currency?.code}
                          </Text>
                        </View>

                        {data?.status === 'completed' && (
                          <Text
                            allowFontScaling={false}
                            style={[styles.title, {color: colors.primary}]}>
                            {t('rateProduct')}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  </>
                ))}
              </View>
            )}

            {data?.receipt && <Receipt data={data} />}

            {data?.status !== 'completed' &&
              data?.status !== 'cancelled' &&
              data?.bookingFor === 'inplace' &&
              isBookingToday && (
                <>
                  {!data?.arrivedAt && (
                    <TouchableOpacity
                      style={[commonStyles.btnContainer, {marginTop: 20}]}
                      onPress={handleConfirmArrival}>
                      <Text
                        allowFontScaling={false}
                        style={[
                          commonStyles.btnText,
                          {fontFamily: fonts.regular},
                        ]}>
                        {t('confirmArrival')}
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              )}

            {data?.status === 'inprogress' && (
              <TouchableOpacity
                style={[
                  commonStyles.btnContainer,
                  {backgroundColor: colors.cancel, marginVertical: 20},
                ]}
                onPress={handleCancel}>
                <Text
                  allowFontScaling={false}
                  style={[commonStyles.btnText, {fontFamily: fonts.regular}]}>
                  {t('cancel')}
                </Text>
              </TouchableOpacity>
            )}
            {(data?.status === 'completed' || data?.status === 'cancelled') && (
              <>
                <View
                  style={[
                    styles.rowContainer,
                    {justifyContent: 'space-between', marginTop: 20},
                  ]}>
                  <Text allowFontScaling={false} style={styles.title}>
                    {t('businessDetails')}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('BusinessDetails', {id: data?.branch})
                    }>
                    <Text
                      allowFontScaling={false}
                      style={[
                        styles.subtext,
                        {color: colors.primary, fontFamily: fonts.medium},
                      ]}>
                      {t('checkProfile')}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={{marginTop: 15}}>
                  <FastImage
                    source={{uri: businessdata?.image}}
                    style={styles.image}
                    resizeMode="cover"
                  />
                </View>

                <Text
                  allowFontScaling={false}
                  style={[styles.title, {marginTop: 15}]}>
                  {t('businessName')}
                </Text>
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.subtitle,
                    {
                      color: colors.lightBlack,
                      fontFamily: fonts.regular,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.borderGrey,
                      paddingBottom: 15,
                      marginTop: Platform.OS === 'ios' && 5,
                    },
                  ]}>
                  {businessdata?.name}
                </Text>

                <TouchableOpacity
                  style={[
                    styles.rowContainer,
                    {
                      justifyContent: 'space-between',
                      borderBottomWidth: 1,
                      borderBottomColor: colors.borderGrey,
                      paddingBottom: 15,
                      alignItems: 'flex-start',
                      paddingVertical: 15,
                    },
                  ]}
                  onPress={() => {
                    if (businessdata?.contactNumber) {
                      Linking.openURL(`tel:${businessdata.contactNumber}`);
                    }
                  }}
                  activeOpacity={0.7}>
                  <View>
                    <Text allowFontScaling={false} style={styles.title}>
                      {t('contactNumber')}
                    </Text>
                    <View style={styles.rowInnerRight}>
                      {businessdata?.flag && (
                        <CountryFlag
                          isoCode={businessdata?.flag}
                          style={styles.flagIcon}
                          size={20}
                        />
                      )}
                      <Text
                        allowFontScaling={false}
                        style={[
                          styles.subtitle,
                          {color: colors.lightBlack, fontFamily: fonts.regular},
                        ]}>
                        {businessdata?.contactNumber}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[styles.circle, {backgroundColor: colors.green}]}>
                    <PhoneIcon />
                  </View>
                </TouchableOpacity>
              </>
            )}

            {data?.status === 'completed' && data?.review && (
              <View>
                <Text style={styles.rating_Title}>{t('YourRating')}</Text>
                <RatingStarsCard rating={data?.review.rating} read={true} />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder={t('typeHere')}
                  placeholderTextColor="#000000B2"
                  multiline={true}
                  numberOfLines={6}
                  textAlignVertical="top"
                  value={data?.review?.comment}
                  readOnly
                />
              </View>
            )}
            {data?.status === 'completed' && !data?.review && (
              <View>
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
                        style={[commonStyles.btnContainer, {marginBottom: 20}]}
                        onPress={handleSubmit}>
                        <Text
                          allowFontScaling={false}
                          style={commonStyles.btnText}>
                          {t('addRateService')}
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </Formik>
              </View>
            )}
            {data?.status === 'completed' &&
              businessdata?.subscription?.plan?.type === 'premium' &&
              !data?.payment?.tip && (
                <>
                  <View style={styles.tipContainer}>
                    {[5, 10, 15, 20].map(tip => (
                      <TouchableOpacity
                        key={tip}
                        style={[
                          styles.tipButton,
                          selectedTip === tip && styles.selectedTipButton,
                        ]}
                        onPress={() => handleTipSelect(tip)}>
                        <Text
                          style={[
                            styles.tipButtonText,
                            selectedTip === tip && styles.selectedTipButtonText,
                          ]}>
                          {tip}
                        </Text>
                        <Text
                          style={[
                            styles.currency,
                            selectedTip === tip && {color: '#FFF'},
                          ]}>
                          {data?.currency?.code}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={styles.customAmountContainer}>
                    <TextInput
                      style={styles.customAmountInput}
                      placeholder="Add custom amount"
                      placeholderTextColor="#B0B0B0"
                      keyboardType="numeric"
                      value={customTip}
                      onChangeText={handleCustomTipChange}
                    />
                    <Text style={styles.aedLabel}>{data?.currency?.code}</Text>
                  </View>
                  {customTipError && (
                    <Text allowFontScaling={false} style={styles.errorLabel}>
                      {customTipError}
                    </Text>
                  )}

                  <TouchableOpacity
                    style={commonStyles.btnContainer}
                    onPress={() => {
                      // Determine the tip value to send
                      const tipToSend = customTip || selectedTip;

                      // Validate if a tip is provided
                      if (tipToSend > 0) {
                        navigation.navigate('Payment', {
                          bookingId: data?._id,
                          tip: tipToSend, // Send the selected or custom tip
                          currencyCode: businessdata?.currency?.code,
                        });
                      } else {
                        // Show an error if no tip is selected or entered
                        setCustomTipError('Tip is required');
                      }
                    }}>
                    <Text allowFontScaling={false} style={commonStyles.btnText}>
                      {t('save')}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            {data?.status === 'completed' &&
              businessdata?.subscription?.plan?.type === 'premium' &&
              data?.payment?.tip && (
                <>
                  <View style={styles.tipContainer}>
                    <Text
                      style={[
                        styles.headingText,
                        {
                          fontSize: 18,
                          fontFamily: fonts.bold,
                          color: colors.black,
                        },
                      ]}>
                      {t('tipSend')}
                    </Text>
                    <Text
                      style={[styles.tipButtonText, {color: colors.primary}]}>
                      {data?.payment?.tip}
                      {businessdata?.currency?.code}
                    </Text>
                  </View>
                </>
              )}
          </KeyboardAwareScrollView>

          {showPopUp && (
            <GeneralModal
              modalSuccess={showPopUp}
              Set_Modal_Visibilty={setShowPopUp}
              imageSource={<Close width={38} height={38} />}
              title={t('confirmation')}
              description={t('areyousureyouwanttocancelthisbooking?')}
              yesBtnTitle={t('yes')}
              handleYesPress={handleYes}
              noBtnTitle={t('no')}
              handleNoPress={() => setShowPopUp(false)}
            />
          )}

          {showLateCancelPopup && (
            <GeneralModal
              modalSuccess={showLateCancelPopup}
              Set_Modal_Visibilty={setShowLateCancelPopup}
              imageSource={<Close width={38} height={38} />}
              title={t('LateCancellation')}
              description={description}
              yesBtnTitle={t('proceed')}
              handleYesPress={() => {
                setShowLateCancelPopup(false);
                setTimeout(() => {
                  setShowCancelPopUp(true);
                }, 1000);
              }}
              noBtnTitle={t('cancel')}
              handleNoPress={() => setShowLateCancelPopup(false)}
            />
          )}

          {showCancelPopUp && (
            <CancelModal
              modalSuccess={true}
              Set_Modal_Visibilty={setShowCancelPopUp}
              title={t('cancellationReasontitle')}
              yesBtnTitle={t('send')}
              noBtnTitle={t('notNow')}
              handleNoPress={() => setShowCancelPopUp(false)}
              cancelOption={cancelOption}
              setCancelOption={setCancelOption}
              handleYesPress={bookingCancel}
              SetcancelReason={SetcancelReason}
              cancelReason={cancelReason}
            />
          )}

          {showConfirmArrivalPopup && (
            <GeneralModal
              modalSuccess={showConfirmArrivalPopup}
              Set_Modal_Visibilty={setShowConfirmArrivalPopup}
              title={t('confirmArrival')}
              description={t('areYouSureYouWantToConfirmArrival')}
              yesBtnTitle={t('yes')}
              handleYesPress={() => {
                setShowConfirmArrivalPopup(false);
                confirmArrival();
              }}
              noBtnTitle={t('no')}
              handleNoPress={() => setShowConfirmArrivalPopup(false)}
            />
          )}
        </>
      )}
    </View>
  );
};

export default BookingDetailsComponent;

const styles = StyleSheet.create({
  title: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: colors.black,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  bookingId: {
    fontSize: 15,
    fontFamily: fonts.medium,
    color: colors.black,
    flex: 1,
  },
  dateTime: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.black,
  },
  rowInnerRight: {
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' && 10,
  },
  itemContainer: {
    marginVertical: 10,
    borderRadius: 10,
    padding: 10,
    backgroundColor: colors.whiteGray,
  },
  typeRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  image: {
    width: 75,
    height: 67,
    borderRadius: 10,
  },
  contentContainer: {
    marginLeft: 15,
    flex: 1,
  },

  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginVertical: 5,
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
  subtext: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.black,
  },
  type: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.black,
    marginVertical: 5,
    marginLeft: 7,
  },

  date: {
    fontSize: fontSizes.mSmall,
    fontFamily: fonts.regular,
    color: colors.black,
  },
  Avatar_image: {
    width: 50,
    height: 50,
    borderRadius: 50,
    resizeMode: 'cover',
  },
  subtitle: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.black,
  },
  circle: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 38 / 2,
  },
  bookingwaiting: {
    width: 192,
    height: 192,
    resizeMode: 'cover',
  },

  chat_icon: {
    width: 42,
    height: 42,
    borderRadius: 42 / 2,
    borderWidth: 1,
    borderColor: colors.borderColor,
    justifyContent: 'center',
    alignItems: 'center',
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
  tipContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  tipButton: {
    flex: 1,
    paddingVertical: 5,
    marginHorizontal: 5,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedTipButton: {
    backgroundColor: colors.primary,
  },
  tipButtonText: {
    fontSize: fontSizes.large,
    color: colors.black,
    fontFamily: fonts.bold,
  },
  selectedTipButtonText: {
    fontSize: fontSizes.xlarge,
    color: colors.black,
    fontFamily: fonts.bold,
    color: colors.background,
  },
  customAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DADADA',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 30,
  },
  customAmountInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    marginLeft: 10,
    height: 50,
    color: colors.black,
  },
  aedLabel: {
    fontSize: 16,
    color: colors.black,
    marginLeft: 5,
    fontFamily: fonts.semiBold,
  },

  currency: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.black,
  },

  heading: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.semiBold,
    color: colors.black,
  },
  card: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderGrey,
    padding: 13,
  },
  cardtitle: {
    fontSize: fontSizes.xSmall,
    fontFamily: fonts.semiBold,
    color: colors.darkGrey,
  },
  Cardsubtitle: {
    fontSize: fontSizes.mSmall,
    fontFamily: fonts.regular,
    color: colors.black,
  },
  Cardprice: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.semiBold,
    color: colors.black,
  },
  Cardcurrency: {
    fontSize: fontSizes.xSmall,
    fontFamily: fonts.medium,
    color: colors.black,
  },
  errorLabel: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 19,
    color: colors.red,
    marginBottom: 15,
  },
});
