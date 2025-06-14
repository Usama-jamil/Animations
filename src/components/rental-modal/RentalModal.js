import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {colors, commonStyles, fonts} from '../../utils/styles';
import {Overlay} from '@rneui/themed';
import {Dropdown} from 'react-native-element-dropdown';
import {useNavigation} from '@react-navigation/native';
import DatePicker from 'react-native-date-picker';
import GeneralModal from '../modal/GeneralModal';
import {Formik} from 'formik';
import * as Yup from 'yup';
import moment from 'moment';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import ActivityIndicatorModal from '../modal/ActivityIndicatorModal';
import {widthPercentageToDP as WP} from 'react-native-responsive-screen';
import {SetSelectedListing} from '../../store/slices/cart';
import Toast from 'react-native-toast-message';
import {useDispatch} from 'react-redux';
import {API_ENDPOINTS, postRequest} from '../../utils/apiService';
import ActivityIndicatorModalTransparent from '../modal/ActivityIndicatorModalTransparent';
import { CustomToast } from '../custom-toast/CustomToast';
import { t } from 'i18next';
const BookingModal = ({Set_Modal_Visibilty, handleNoPress, data}) => {
  const [select, setSelect] = useState(false);
  const [from, setfrom] = useState(false);
  const [to, setto] = useState(false);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date());
  const [totalBill, setTotalBill] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const navigation = useNavigation();
  const [slecteddate, SetSelecteddate] = useState();
    const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const dispatch = useDispatch();
  const rentData = [
    {
      label: `Hourly (${
        data?.rentPerHour
          ? `${data?.rentPerHour}${data?.currency?.code}/Hour`
          : 'N/A'
      })`,
      value: 'hourly',
    },
    {
      label: `Daily (${
        data?.rentPerDay
          ? `${data?.rentPerDay}${data?.currency?.code}/Day`
          : 'N/A'
      })`,
      value: 'daily',
    },
  ];

  const validationSchema = Yup.object().shape({
    bookingType: Yup.string(),
    hours: Yup.number(),
    dateFrom: Yup.date(),
    dateTo: Yup.date(),
  });

    const showToast = (message, type) => {
    setMessage(message);
    setMessageType(type);

    // Hide the message after 3 seconds
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  };


  const ON_SUBMIT = async (values, {resetForm, setFieldError}) => {
    console.log('values', values);
    if (!values.bookingType) {
      setFieldError('bookingType', 'Booking Type is required');
      return;
    }

    if (values.bookingType === 'hourly') {
      if (!values.hours) {
        setFieldError('hours', 'Hours are required');
        return;
      }
      if (values.hours < 1 || values.hours > 24) {
        setFieldError('hours', 'Enter a value between 1 and 24');
        return;
      }
      if (!values.dateFrom) {
        setFieldError('dateFrom', 'Start date is required');
        return;
      }

      const parsedDateFrom = moment(values.dateFrom);

      // Check if dateFrom is in the past
      if (parsedDateFrom.isBefore(moment(), 'day')) {
        setFieldError('dateFrom', 'Start date cannot be in the past');
        return;
      }
    }

    if (values.bookingType === 'daily') {
      if (!values.dateFrom) {
        setFieldError('dateFrom', 'Start date is required');
        return;
      }
      if (!values.dateTo) {
        setFieldError('dateTo', 'End date is required');
        return;
      }

      // Use moment to parse the dates
      const parsedDateFrom = moment(values.dateFrom);
      const parsedDateTo = moment(values.dateTo);

      // Check if dateFrom is in the past
      if (parsedDateFrom.isBefore(moment(), 'day')) {
        setFieldError('dateFrom', 'Start date cannot be in the past');
        return;
      }
      // Check if dateTo is before or equal to dateFrom
      if (parsedDateTo.isBefore(parsedDateFrom, 'day')) {
        setFieldError('dateTo', 'End date must be after the start date');
        return;
      }
    }
    setIsLoading(true);

    // Initialize payload
    let payload = {
      listing: data?._id, // You can dynamically set this if needed
      bookingType: values.bookingType,
      branch: data.branch, // From the form
    };

    // If the booking type is 'hourly', add the hours and bill
    if (values.bookingType === 'hourly') {
      payload = {
        ...payload,
        hours: values.hours, // Number of hours
        totalBill: totalBill, // The calculated total bill
        startTime: values.dateFrom, // Set the correct date, possibly from the form
      };
    }

    // If the booking type is 'daily', add the dates
    if (values.bookingType === 'daily') {
      payload = {
        ...payload,
        startTime: values.dateFrom, // From date
        endTime: values.dateTo, // To date
        totalBill: totalBill,
      };
    }

    console.log('payload', payload);

    // dispatch(SetSelectedListing(payload));
    // Set_Modal_Visibilty(false);
    // Toast.show({
    //   type: 'success',
    //   position: 'top',
    //   bottomOffset: 20,
    //   text1: t('success'),
    //   text2: t('listingAddSuccessfully'),
    //   visibilityTime: 3000,
    // });

    const response = await postRequest(API_ENDPOINTS.rental.add, payload);
    console.log('Booking response:', response);
    setIsLoading(false);
    if (response.success) {
      setSelect(false);
      Set_Modal_Visibilty(false);
      Toast.show({
        type: 'success',
        text1: 'Booking',
        text2: 'Your booking has been successfully confirmed.',
      });
      navigation.navigate('Home', {screen: 'Booking'});
    } else {
      if (response.error === 'Listing not available on selected dates') {
        setSelect(true);
      } else {
        setErr(true);
        setErrMsg(response.error || 'An unexpected error has occurred.');
      }
    }
  };

 const handleCheckAvailability = (values) => {
    console.log('handleCheckAvailability called with values:', values);

    // Validate bookingType
    if (!values.bookingType) {
      showToast('Booking Type is required', 'error');
      console.log('Validation failed: bookingType is required');
      return;
    }

    // Validate hours for hourly bookings
    if (values.bookingType === 'hourly') {
      if (!values.hours) {
        showToast('Hours are required', 'error');
        console.log('Validation failed: hours is required');
        return;
      }
      if (values.hours < 1 || values.hours > 24 || isNaN(parseInt(values.hours))) {
        showToast('Enter a value between 1 and 24', 'error');
        console.log('Validation failed: invalid hours value');
        return;
      }
    }

    // Log successful validation
    console.log('Validation passed, navigating with params:', {
      listingId: data?._id,
      branch: data?.branch,
      bookingType: values.bookingType,
      hours: values.bookingType === 'hourly' ? values.hours : undefined,
      listingData: data,
    });

    // Navigate to listingAvailibility
    Set_Modal_Visibilty(false);
    navigation.navigate('listingAvailibility', {
      listingId: data?._id,
      branch: data?.branch,
      bookingType: values.bookingType,
      hours: values.bookingType === 'hourly' ? values.hours : undefined,
      listingData: data,
    });
  };

  return (
    <Overlay
      overlayStyle={{
        borderRadius: 20,
      }}
      animationType="fade"
      transparent={true}>
      <View style={styles.centeredView}>
        <View style={styles.modalContainer}>
          {err && (
            <GeneralModal
              modalError={true}
              description={errMsg}
              Set_Modal_Visibilty={setErr}
              handleNoPress={() => setErr(false)}
              noBtnTitle={'Dismiss'}
            />
          )}
          {isLoading && (
            <ActivityIndicatorModalTransparent loaderIndicator={isLoading} />
          )}
            <CustomToast message={message} type={messageType} onClose={() => setMessage('')} />
          <Formik
            initialValues={{
              bookingType: '',
              hours: '',
              dateFrom: '',
              dateTo: '',
              note: '',
            }}
            validationSchema={validationSchema}
            onSubmit={(values, {resetForm, setFieldError}) => {
              ON_SUBMIT(values, {resetForm, setFieldError});
            }}>
            {({
              handleChange,
              handleSubmit,
              setFieldValue,
              values,
              errors,
              touched,
              setFieldError
            }) => {
              {
                useEffect(() => {
                  // Calculate total bill based on booking type and input values
                  if (
                    data?.rentPerHour &&
                    values?.bookingType === 'hourly' &&
                    values?.hours
                  ) {
                    setTotalBill(data?.rentPerHour * values.hours);
                  } else if (
                    data?.rentPerDay &&
                    values.bookingType === 'daily' &&
                    values?.dateFrom &&
                    values?.dateTo
                  ) {
                    const startDate = moment(values.dateFrom);
                    const endDate = moment(values.dateTo);
                    const duration = endDate.diff(startDate, 'days') + 1;
                    console.log('duration', duration);
                    setTotalBill(data?.rentPerDay * duration);
                  } else {
                    setTotalBill(0);
                  }
                }, [setFieldValue, values]);
              }
              return (
                <KeyboardAwareScrollView
                  contentContainerStyle={{flexGrow: 1}}
                  showsVerticalScrollIndicator={false}>
                  <Text style={styles.heading}>{t('bookForRental')}</Text>
                  <Text style={styles.booking}>{data?.name || 'product'}</Text>
                  <Text style={styles.date}>{t('bookingType')}</Text>

                  <Dropdown
                    style={[styles.dropdown]}
                    data={rentData}
                    labelField="label"
                    valueField="value"
                    placeholder="Select Booking Type"
                    selectedTextStyle={styles.selectedTextStyle}
                    itemTextStyle={styles.itemTextStyle}
                    placeholderStyle={styles.placeholderStyle}
                    value={values.bookingType}
                    onChange={item => {
                      setFieldValue('bookingType', item.value);
                    }}
                    renderItem={item => {
                      const isSelected = item.value === values.bookingType;
                      return (
                        <Text
                          style={{
                            padding: 10,
                            color: isSelected ? 'black' : '#676767',
                            fontSize: 16,
                          }}>
                          {item.label}
                        </Text>
                      );
                    }}
                  />
                  {touched.bookingType && errors.bookingType && (
                    <Text style={[styles.error_label, {marginVertical: 5}]}>
                      {errors.bookingType}
                    </Text>
                  )}

                  {/* Conditional Fields Based on Booking Type */}
                  {values.bookingType === 'hourly' && (
                    <>
                      <Text
                        allowFontScaling={false}
                        style={[styles.date, {marginTop: 20}]}>
                        {t('enterHours')}
                      </Text>
                      <TextInput
                        allowFontScaling={false}
                        style={[styles.input]}
                        placeholder="e.g 5"
                        placeholderTextColor={'#DADADA'}
                        keyboardType="numeric"
                        onChangeText={handleChange('hours')}
                        value={values.hours}
                      />
                    </>
                  )}
                  {touched.hours && errors.hours && (
                    <Text style={styles.error_label}>{errors.hours}</Text>
                  )}

                  {values.bookingType === 'daily' && (
                    <>
                      <View style={styles.parent_1}>
                        <View style={styles.child_1}>
                          <Text allowFontScaling={false} style={styles.expiry}>
                            {t('dateFrom')}
                          </Text>
                          <TouchableOpacity
                            style={[styles.textInputContainer]}
                            onPress={() => {
                              setfrom(true);
                              setOpen(true);
                            }}>
                            <Text
                              allowFontScaling={false}
                              style={[
                                styles.textInput,
                                {
                                  color: values.dateFrom
                                    ? colors.black
                                    : '#676767',
                                }, // Adjust for placeholder and selected text color
                              ]}>
                              {values.dateFrom
                                ? moment(values.dateFrom).format('YYYY-MM-DD') // Display formatted date
                                : 'Select date'}
                            </Text>
                            <Image
                              style={styles.textInputIcon}
                              source={require('../../../assets/icons/calender.png')}
                            />
                          </TouchableOpacity>
                        </View>
                        <View style={styles.child_1}>
                          <Text allowFontScaling={false} style={styles.expiry}>
                           {t('dateTo')}
                          </Text>
                          <TouchableOpacity
                            style={[styles.textInputContainer]}
                            onPress={() => {
                              setto(true);
                              setOpen(true);
                            }}>
                            <Text
                              allowFontScaling={false}
                              style={[
                                styles.textInput,
                                {
                                  color: values.dateTo
                                    ? colors.black
                                    : '#676767',
                                }, // Adjust for placeholder and selected text color
                              ]}>
                              {values.dateTo
                                ? moment(values.dateTo).format('YYYY-MM-DD') // Display formatted date
                                : 'Select date'}
                            </Text>
                            <Image
                              style={styles.textInputIcon}
                              source={require('../../../assets/icons/calender.png')}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <View style={styles.parent_1}>
                        {touched.dateFrom && errors.dateFrom && (
                          <Text style={styles.error_label}>
                            {errors.dateFrom}
                          </Text>
                        )}

                        {touched.dateTo && errors.dateTo && (
                          <Text style={styles.error_label}>
                            {errors.dateTo}
                          </Text>
                        )}
                      </View>
                    </>
                  )}

                  {values.bookingType === 'hourly' && (
                    <>
                      <View
                        style={[
                          styles.child_1,
                          {width: '100%', marginTop: 10},
                        ]}>
                        <Text allowFontScaling={false} style={styles.expiry}>
                          {t('dateFrom')}
                        </Text>
                        <TouchableOpacity
                          style={[styles.textInputContainer]}
                          onPress={() => {
                            setfrom(true);
                            setOpen(true);
                          }}>
                          <Image
                            style={styles.textInputIcon}
                            source={require('../../../assets/icons/calender.png')}
                          />
                          <Text
                            allowFontScaling={false}
                            style={[
                              styles.textInput,
                              {
                                color: values.dateFrom
                                  ? colors.black
                                  : '#676767',
                              },
                            ]}>
                            {values.dateFrom
                              ? moment(values.dateFrom).format('YYYY-MM-DD')
                              : 'Select date'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      {touched.dateFrom && errors.dateFrom && (
                        <Text style={styles.error_label}>
                          {errors.dateFrom}
                        </Text>
                      )}
                    </>
                  )}

                  {/* Common Note Field */}
                  <Text
                    allowFontScaling={false}
                    style={[
                      styles.date,
                      values.bookingType === 'hourly' && {marginTop: 10},
                    ]}>
                    {t('note')}
                  </Text>
                  <View style={styles.textInputContainer}>
                    <TextInput
                      allowFontScaling={false}
                      style={[styles.textInput]}
                      placeholderTextColor={'#676767'}
                      placeholder={t('typenote')}
                      onChangeText={handleChange('note')}
                      value={values.note}
                    />
                  </View>

                  <View style={styles.parent}>
                    <Text allowFontScaling={false} style={styles.total}>
                      {t('totalBill')}
                    </Text>
                    <Text allowFontScaling={false} style={styles.price}>
                      {data?.currencySymbol} {totalBill.toFixed(2)}
                    </Text>
                  </View>
                  {/* Confirm and Cancel Buttons */}
                  <TouchableOpacity
                    style={commonStyles.btnContainer}
                    onPress={handleSubmit}>
                    <Text allowFontScaling={false} style={commonStyles.btnText}>
                      {t('confirm')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      commonStyles.btnContainer,
                      {marginTop: 10, backgroundColor: colors.darkGrey},
                    ]}
                    onPress={()=> handleCheckAvailability(values)}>
                    <Text allowFontScaling={false} style={commonStyles.btnText}>
                      {t('checkAvailability')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancel}
                    onPress={handleNoPress}>
                    <Text allowFontScaling={false} style={styles.txt}>
                      {t('cancel')}
                    </Text>
                  </TouchableOpacity>
                  <DatePicker
                    modal
                    minimumDate={moment().toDate()}
                    mode="date"
                    open={open}
                    date={date}
                    onConfirm={selectedDate => {
                      setOpen(false);
                      const formattedDate =
                        moment(selectedDate).format('YYYY-MM-DD'); // Use moment to format the date
                      SetSelecteddate(moment(selectedDate).format('YYYY-MM'));
                      // Check if 'from' is open and set the 'from' value
                      if (from) {
                        setFieldValue('dateFrom', formattedDate);
                        setfrom(false); // Close 'from' after setting the value
                      }
                      // Check if 'to' is open and set the 'to' value
                      else if (to) {
                        setFieldValue('dateTo', formattedDate);
                        setto(false); // Close 'to' after setting the value
                      }
                    }}
                    onCancel={() => setOpen(false)}
                    textColor={'#000000'}
                    buttonColor={'#000000'}
                    theme="light"
                  />
                </KeyboardAwareScrollView>
              );
            }}
          </Formik>
          {select && (
            <GeneralModal
              modalSuccess={true}
              title={'Tool not available'}
              description={
                'Tool is not available on selected time, please check availability and review.'
              }
              yesBtnTitle={'Check Availability'}
              noBtnTitle={'Dismiss'}
              Set_Modal_Visibilty={setSelect}
              handleYesPress={handleCheckAvailability}
              handleNoPress={() => setSelect(false)}
            />
          )}
        </View>
      </View>
    </Overlay>
  );
};

export default BookingModal;

const styles = StyleSheet.create({
  centeredView: {
    justifyContent: 'center',
    width: WP('90'),
    // height: heightPercentageToDP('50'),
  },

  modalContainer: {
    borderRadius: 20,
    width: WP('90'),
    zIndex: -1000,
    padding: 20,
  },

  heading: {
    fontSize: 20,
    color: colors.black,
    fontFamily: fonts.semiBold,
  },
  dropdown: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    width: '100%',
    marginTop: 15,
    borderColor: colors.borderColor,
  },
  placeholderStyle: {
    color: '#676767',
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  selectedTextStyle: {
    color: colors.primary,
    fontSize: 16,
  },
  itemTextStyle: {
    color: '#FF9900',
    fontSize: 16,
  },
  date: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.black,
  },
  input: {
    borderWidth: 1,
    height: 50,
    borderRadius: 10,
    marginTop: 15,
    borderColor: '#E0E0E0',
    paddingHorizontal: 14,
    color: colors.lightBlack,
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  parent: {
    backgroundColor: colors.whiteGray,
    marginVertical: 10,
    padding: 15,
    borderRadius: 10,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  parent_1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  child_1: {
    width: '48%',
  },
  expiry: {
    fontSize: 14,
    color: colors.black,
    fontFamily: fonts.medium,
  },
  total: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.primary,
  },
  dolllar: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.primary,
  },

  booking: {
    fontFamily: fonts.medium,
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 5,
    color: colors.black,
  },
  textInputContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    alignItems: 'center',
    height: 50,
    paddingHorizontal: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.borderColor,
  },
  textInputIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    tintColor: colors.ligh,
  },
  textInput: {
    flex: 1,
    marginLeft: 10,
    color: colors.black,
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  cancel: {
    //backgroundColor: colors.white,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    // height: 50,
    borderRadius: 10,
  },
  txt: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.lightBlack,
  },
  price: {
    color: colors.primary,
    fontSize: 18,
    fontFamily: fonts.bold,
  },
  error_label: {
    color: colors.red,
    fontSize: 12,
    fontFamily: fonts.regular,
  },
});
