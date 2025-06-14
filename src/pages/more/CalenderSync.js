import {
  Text,
  View,
  Image,
  FlatList,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import React, {useState} from 'react';
import BookingCard from '../../components/booking/BookingCard';
import CustomHeader from '../../components/header/CustomHeader';
import {colors, fontSizes, fonts} from '../../utils/styles';
import {Calendar} from 'react-native-calendars';
import ArrowLeftIcon from '../../../assets/icons/arrow_left.svg';
import ArrowRightIcon from '../../../assets/icons/arrow-right.svg';
import NoDataIcon from '../../../assets/icons/no_data.svg';

import {useTranslation} from 'react-i18next';
import {useFocusEffect} from '@react-navigation/native';
import {API_ENDPOINTS, getRequest} from '../../utils/apiService';

const CalenderSync = ({navigation, route}) => {
  const {t} = useTranslation();

  const [selectedDates, setSelectedDates] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [bookings, setBookings] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  console.log;

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [fromDate, toDate]),
  );

  const fetchData = async () => {
    setIsLoading(true);
    const endpoint = `${API_ENDPOINTS.booking.getWithStatus}?from=${fromDate}&to=${toDate}`;
    const result = await getRequest(endpoint);
    console.log('result of booking calender data', result);
    setIsLoading(false);
    if (result.success) {
      setBookings(result.data.data);
    } else {
      setErr(true);
      setErrMsg(result.error);
    }
  };

  const handleDayPress = day => {
    const newSelectedDates = {...selectedDates};

    if (newSelectedDates[day.dateString]) {
      delete newSelectedDates[day.dateString];
    } else {
      if (Object.keys(newSelectedDates).length >= 2) {
        const earliestDate = Object.keys(newSelectedDates).sort()[0];
        delete newSelectedDates[earliestDate];
      }

      newSelectedDates[day.dateString] = {
        selected: true,
        customStyles: {
          container: {
            backgroundColor: colors.primary,
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center',
          },
          text: {
            color: colors.background,
            alignSelf: 'center',
          },
        },
      };
    }

    const selectedDateKeys = Object.keys(newSelectedDates).sort();
    if (selectedDateKeys.length >= 2) {
      setFromDate(selectedDateKeys[0]);
      setToDate(selectedDateKeys[1]);
    } else if (selectedDateKeys.length === 1) {
      setFromDate(selectedDateKeys[0]);
      setToDate(null);
    } else {
      setFromDate(null);
      setToDate(null);
    }

    setSelectedDates(newSelectedDates);
  };

  const renderItem = ({item, index}) => (
    <BookingCard
      navigation={navigation}
      item={item}
      route={route}
      index={index}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title={t('calendar2-waysync')} />
      {err && (
        <GeneralModal
          modalError={true}
          description={errMsg}
          Set_Modal_Visibilty={setErr}
        />
      )}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size={'large'} color={colors.primary} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.datePickerContainer}>
            <Calendar
              onDayPress={handleDayPress}
              hideExtraDays={true}
              theme={{
                calendarBackground: colors.lightGrey,
                textSectionTitleColor: colors.black,
                selectedDayBackgroundColor: colors.primary,
                selectedDayTextColor: colors.background,
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
              markedDates={selectedDates}
              markingType={'custom'}
              renderArrow={direction =>
                direction === 'left' ? <ArrowLeftIcon /> : <ArrowRightIcon />
              }
            />
          </View>
          {bookings.length > 0 ? (
            <FlatList
              renderItem={renderItem}
              data={bookings}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{marginHorizontal: 10}}
            />
          ) : (
            <View style={styles.noBookingsContainer}>
              <NoDataIcon width={300} height={250} />
              <Text allowFontScaling={false} style={styles.noDataText}>
                {t('noBookingFound')}
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default CalenderSync;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  datePickerContainer: {
    marginBottom: 10,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  noBookingsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  noDataImg: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  noDataText: {
    fontSize: 14,
    color: colors.lightBlack,
    fontFamily: fonts.regular,
  },
});
