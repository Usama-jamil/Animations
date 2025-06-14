import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import GeneralModal from '../../components/modal/GeneralModal';
import ActivityIndicatorModal from '../../components/modal/ActivityIndicatorModal';
import { colors, fonts, fontSizes } from '../../utils/styles';
import { API_ENDPOINTS, postRequest } from '../../utils/apiService';
import CustomHeader from '../../components/header/CustomHeader';
import { Calendar } from 'react-native-calendars';
import { useTranslation } from 'react-i18next';
import ArrowLeftIcon from '../../../assets/icons/arrow_left.svg';
import ArrowRightIcon from '../../../assets/icons/arrow-right.svg';
import moment from 'moment';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';

const Availability = ({ route }) => {
  const { listingId, branch, bookingType, hours, listingData } = route?.params;
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [totalBill, setTotalBill] = useState(0);
  const { t } = useTranslation();
  const [note, setNote] = useState('')
  const navigation = useNavigation();

  // Log incoming params for debugging
  useEffect(() => {
    console.log('Route params:', { listingId, branch, bookingType, hours, listingData });
  }, [listingId, branch, bookingType, hours, listingData]);

  // Payload for fetching availability
  const availabilityPayload = {
    listing: listingId,
    branch: branch,
  };

  // Fetch available dates
  const fetchAvailability = async () => {
    setIsLoading(true);
    try {
      const result = await postRequest(
        API_ENDPOINTS.rental.getAvailibility,
        availabilityPayload,
      );
      setIsLoading(false);
      if (result.success) {
        setAvailableDates(result.data.data || []);
      } else {
        setErr(true);
        setErrMsg(result.error || t('unexpectedError'));
      }
    } catch (error) {
      setIsLoading(false);
      setErr(true);
      setErrMsg(t('unexpectedError'));
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  // Calculate totalBill based on BookingModal logic
useEffect(() => {
  console.log('Calculating totalBill:', {
    listingData,
    bookingType,
    hours,
    selectedStartDate,
    selectedEndDate,
    rentPerHour: listingData?.rentPerHour,
    rentPerDay: listingData?.rentPerDay,
  });

  if (!listingData || !bookingType) {
    console.log('Missing required data for calculation');
    setTotalBill(0);
    return;
  }

  if (
    bookingType === 'hourly' &&
    selectedStartDate &&
    listingData.rentPerHour &&
    hours &&
    !isNaN(parseInt(hours))
  ) {
    const bill = listingData.rentPerHour * parseInt(hours);
    console.log('Hourly bill calculated:', bill);
    setTotalBill(bill);
  } else if (
    bookingType === 'daily' &&
    selectedStartDate &&
    selectedEndDate &&
    listingData.rentPerDay
  ) {
    const startDate = moment(selectedStartDate);
    const endDate = moment(selectedEndDate);
    if (startDate.isValid() && endDate.isValid()) {
      const duration = endDate.diff(startDate, 'days') + 1;
      const bill = listingData.rentPerDay * duration;
      console.log('Daily bill calculated:', { duration, bill });
      setTotalBill(bill);
    } else {
      console.log('Invalid dates for daily booking');
      setTotalBill(0);
    }
  } else {
    console.log('Conditions not met for bill calculation');
    setTotalBill(0);
  }
}, [selectedStartDate, selectedEndDate, hours, bookingType, listingData]);

  // Prepare marked dates for the calendar
  const markedDates = availableDates.reduce((acc, date) => {
    acc[date] = {
      marked: true,
      dotColor: colors.primary,


    };
    return acc;
  }, {});

  // Add selected dates to markedDates
  if (bookingType === 'hourly' && selectedStartDate) {
    markedDates[selectedStartDate] = {
      ...markedDates[selectedStartDate],
      selected: true,
     selectedColor: colors.primary,
      selectedTextColor: 'white',
    };
  } else if (bookingType === 'daily' && selectedStartDate) {
    const start = moment(selectedStartDate);
    const end = selectedEndDate ? moment(selectedEndDate) : start;
    let current = start.clone();

    while (current.isSameOrBefore(end)) {
      const dateStr = current.format('YYYY-MM-DD');
      if (availableDates.includes(dateStr)) {
        markedDates[dateStr] = {
          ...markedDates[dateStr],
          selected: true,
          startingDay: current.isSame(start, 'day'),
          endingDay: current.isSame(end, 'day'),
     selectedColor: colors.primary,
      selectedTextColor: 'white',

        };
      }
      current.add(1, 'day');
    }
  }

  // Handle day press on the calendar
  const handleDayPress = (day) => {
    const selectedDate = day.dateString;
    console.log('Day pressed:', selectedDate);

    // Only allow selection if the date is available
    if (!availableDates.includes(selectedDate)) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: t('dateNotAvailable'),
        visibilityTime: 3000,
      });
      return;
    }

    if (bookingType === 'hourly') {
      setSelectedStartDate(selectedDate);
      setSelectedEndDate(null); // Clear end date for hourly
      console.log('Hourly selection:', { selectedStartDate: selectedDate });
    } else if (bookingType === 'daily') {
      if (!selectedStartDate) {
        setSelectedStartDate(selectedDate);
        console.log('Daily start date set:', selectedDate);
      } else if (selectedStartDate && !selectedEndDate) {
        if (moment(selectedDate).isBefore(selectedStartDate)) {
          setSelectedStartDate(selectedDate);
          console.log('Daily start date reset:', selectedDate);
        } else {
          // Check if all dates in the range are available
          let current = moment(selectedStartDate);
          const end = moment(selectedDate);
          let allAvailable = true;

          while (current.isSameOrBefore(end)) {
            if (!availableDates.includes(current.format('YYYY-MM-DD'))) {
              allAvailable = false;
              break;
            }
            current.add(1, 'day');
          }

          if (allAvailable) {
            setSelectedEndDate(selectedDate);
            console.log('Daily end date set:', selectedDate);
          } else {
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: t('someDatesNotAvailable'),
              visibilityTime: 3000,
            });
            setSelectedStartDate(selectedDate);
            setSelectedEndDate(null);
            console.log('Daily selection reset, new start:', selectedDate);
          }
        }
      } else {
        setSelectedStartDate(selectedDate);
        setSelectedEndDate(null);
        console.log('Daily selection restarted:', selectedDate);
      }
    }
  };

  // Handle booking submission
  const handleBookNow = async () => {
    if (bookingType === 'hourly' && !selectedStartDate) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: t('pleaseSelectStartDate'),
        visibilityTime: 3000,
      });
      return;
    }

    if (bookingType === 'daily' && (!selectedStartDate || !selectedEndDate)) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: t('pleaseSelectDateRange'),
        visibilityTime: 3000,
      });
      return;
    }

    setIsLoading(true);

    const payload = {
      listing: listingId,
      bookingType: bookingType,
      branch: branch,
      note: note.trim() || null,
    };

    if (bookingType === 'hourly') {
      payload.hours = parseInt(hours);
      payload.totalBill = totalBill;
      payload.startTime = selectedStartDate;
    } else if (bookingType === 'daily') {
      payload.startTime = selectedStartDate;
      payload.endTime = selectedEndDate;
      payload.totalBill = totalBill;
    }

    console.log('Booking payload:', payload);

    try {
      const response = await postRequest(API_ENDPOINTS.rental.add, payload);
      setIsLoading(false);

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: t('bookingSuccess'),
          text2: t('bookingConfirmed'),
          visibilityTime: 3000,
        });
        navigation.navigate('Home', { screen: 'Booking' });
      } else {
        setErr(true);
        setErrMsg(response.error || t('unexpectedError'));
      }
    } catch (error) {
      setIsLoading(false);
      setErr(true);
      setErrMsg(t('unexpectedError'));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title={t('Availability')} />
      {err && (
        <GeneralModal
          modalError={true}
          description={errMsg}
          Set_Modal_Visibilty={setErr}
          handleNoPress={() => setErr(false)}
          noBtnTitle={t('dismiss')}
        />
      )}
      {isLoading && <ActivityIndicatorModal loaderIndicator={true} />}
     {markedDates && (
        <Text style={styles.inputHeading}>
          The listing is available on the (purple-marked) 🟣 date.
        </Text>
      )}
      <Calendar
        theme={{
          calendarBackground: colors.lightGrey,
          textSectionTitleColor: colors.black,
          selectedDayBackgroundColor: colors.primary,
          selectedDayTextColor: 'white',
          todayTextColor: colors.black,
          dayTextColor: colors.black,
          todayDotColor: colors.black,
          arrowColor: colors.purple,
          textMonthFontFamily: fonts.medium,
          textMonthFontSize: fontSizes.xMedium,
          textDayHeaderFontFamily: fonts.medium,
          textDayHeaderFontSize: fontSizes.medium,
          textDayFontFamily: fonts.regular,
          textDayFontSize: fontSizes.small,
          monthTextColor: colors.black,
        }}
        markedDates={markedDates}
        markingType={bookingType === 'daily' ? 'period' : 'dot'}
        onDayPress={handleDayPress}
        renderArrow={(direction) =>
          direction === 'left' ? <ArrowLeftIcon /> : <ArrowRightIcon />
        }
      />
      <View style={styles.bookingInfo}>
        <Text style={styles.infoText}>
          {t('bookingType')}: {bookingType === 'hourly' ? 'Hourly' :'Daily' || t('notSelected')}
        </Text>
        {bookingType === 'hourly' && (
          <Text style={styles.infoText}>
            {t('hours')}: {hours || 'Not set'}
          </Text>
        )}
        <Text style={styles.infoText}>
          {t('StartDate')}: {selectedStartDate || t('notSelected')}
        </Text>
        {bookingType === 'daily' && (
          <Text style={styles.infoText}>
            {t('EndDate')}: {selectedEndDate || t('notSelected')}
          </Text>
        )}
        <Text style={styles.infoText}>
          {t('totalBill')}: {listingData?.currencySymbol || ''} {totalBill.toFixed(2)}
        </Text>
        <TextInput
          style={styles.noteInput}
          placeholder={t('typenote')}
          placeholderTextColor={colors.grey}
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={3}
        />
        <TouchableOpacity
          style={[styles.bookButton, { opacity: isLoading ? 0.5 : 1 }]}
          onPress={handleBookNow}
          disabled={isLoading}
        >
          <Text style={styles.bookButtonText}>{t('bookNow')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Availability;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inputHeading: {
    paddingHorizontal: 20,
    fontSize: fontSizes.xSmall,
    fontFamily: fonts.medium,
    marginVertical: 10,
  },
  bookingInfo: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.lightGrey,
    borderRadius: 10,
    margin: 20,
  },
  infoText: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.regular,
    color: colors.black,
    marginBottom: 5,
  },
  noteInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 10,
    fontSize: fontSizes.medium,
    fontFamily: fonts.regular,
    color: colors.black,
    marginTop: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.grey,
    textAlignVertical: 'top',
    height: 100,
  },
  bookButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  bookButtonText: {
    color: colors.background,
    fontSize: fontSizes.medium,
    fontFamily: fonts.regular,
  },
});