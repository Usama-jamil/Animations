import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import CustomHeader from '../../components/header/CustomHeader';
import { useTranslation } from 'react-i18next';
import { colors, fonts } from '../../utils/styles';
import Clock from '../../../assets/icons/booking/clock-light-stroke.svg';
import PrimaryClock from '../../../assets/icons/booking/primary_Color_Clock.svg';
import DatePicker from 'react-native-modern-datepicker';
import moment from 'moment';
import Toast from 'react-native-toast-message';

const OpenHours = ({ route }) => {
  const { t } = useTranslation();
  const { hours } = route.params;

  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTimeField, setSelectedTimeField] = useState(null);
  const [showTimePickerModal, setShowTimePickerModal] = useState(false);

  console.log('hours', hours);

  const [availability, setAvailability] = useState({
    Monday: { isOn: false, startTime: '', endTime: '' },
    Tuesday: { isOn: false, startTime: '', endTime: '' },
    Wednesday: { isOn: false, startTime: '', endTime: '' },
    Thursday: { isOn: false, startTime: '', endTime: '' },
    Friday: { isOn: false, startTime: '', endTime: '' },
    Saturday: { isOn: false, startTime: '', endTime: '' },
    Sunday: { isOn: false, startTime: '', endTime: '' },
  });

  useEffect(() => {
    const updatedAvailability = { ...availability };

    hours.forEach(hour => {
      if (updatedAvailability[hour.day]) {
        updatedAvailability[hour.day].startTime = hour.isOpen
          ? hour.startTime
          : '';
        updatedAvailability[hour.day].endTime = hour.isOpen ? hour.endTime : '';
        updatedAvailability[hour.day].isOn = hour.isOpen; // Ensure the isOpen status is correctly applied
      }
    });

    setAvailability(updatedAvailability);
  }, [hours]);

  const renderAvailability = day => {
    const isActive = selectedDay === day;
    const dayAvailability = availability[day];
    const isClosed = !dayAvailability.isOn;

    return (
      <View style={styles.Available}>
        <Text
          allowFontScaling={false}
          style={[
            styles.Availability_heading,
            {
              fontFamily:
                day === 'Sunday'
                  ? fonts.medium
                  : isActive
                    ? fonts.semiBold
                    : fonts.medium,
              color:
                day === 'Sunday'
                  ? colors.black
                  : isActive
                    ? colors.primary
                    : colors.black,
            },
          ]}>
          {t(day)}
        </Text>

        <View style={styles.time}>
          <View style={styles.time_left}>
            {/* Start Time or Closed Text */}
            <View
              style={[
                styles.time_inner,
                {
                  borderColor:
                    isActive && selectedTimeField === 'startTime'
                      ? colors.primary
                      : colors.borderGrey,
                  backgroundColor: colors.background,
                },
              ]}
            // onPress logic here if needed
            >
              {isActive && selectedTimeField === 'startTime' ? (
                <PrimaryClock width={24} height={24} />
              ) : (
                <Clock width={24} height={24} />
              )}
              <Text
                allowFontScaling={false}
                style={[
                  styles.timeText,
                  {
                    fontFamily: fonts.regular,
                    fontSize: 13,
                    color: isClosed ? colors.red : colors.black,
                  },
                ]}>
                {isClosed ? t('Closed') : moment(dayAvailability.startTime, 'HH:mm').format(
                                        'hh:mm A',
                                      )}
              </Text>
            </View>

            {/* End Time */}
            {!isClosed && (
              <View
                style={[
                  styles.time_inner,
                  {
                    borderColor: colors.borderGrey,
                    backgroundColor: colors.background,
                  },
                ]}
              // onPress logic here if needed
              >
                {isActive && selectedTimeField === 'endTime' ? (
                  <PrimaryClock width={24} height={24} />
                ) : (
                  <Clock width={24} height={24} />
                )}
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.timeText,
                    {
                      fontFamily: fonts.regular,
                      fontSize: 13,
                      color:
                        isActive && selectedTimeField === 'endTime'
                          ? colors.primary
                          : colors.black,
                    },
                  ]}>
                  { moment(dayAvailability.endTime, 'HH:mm').format(
                                        'hh:mm A',)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const handleTimeSelection = selectedTime => {
    const formattedTime = moment(selectedTime, 'HH:mm').format('hh:mm A');
    const selectedDayTimes = selectedDay
      ? availability[selectedDay]
      : breakTimes;
    console.log('selected day times', selectedDayTimes);
    const startTime = moment(selectedDayTimes.startTime, 'hh:mm A');
    const endTime = moment(selectedDayTimes.endTime, 'hh:mm A');
    const selectedMoment = moment(formattedTime, 'hh:mm A');
    if (
      selectedTimeField === 'endTime' &&
      selectedMoment.isSameOrBefore(startTime)
    ) {
      showClosingTimeErrorToast();
    } else if (
      selectedTimeField === 'startTime' &&
      selectedMoment.isSameOrAfter(endTime)
    ) {
      showOpeningTimeErrorToast();
    } else {
      if (selectedDay) {
        setAvailability(prevAvailability => ({
          ...prevAvailability,
          [selectedDay]: {
            ...prevAvailability[selectedDay],
            [selectedTimeField]: formattedTime,
          },
        }));
      } else {
        setBreakTimes(prevBreakTimes => ({
          ...prevBreakTimes,
          [selectedTimeField]: formattedTime,
        }));
      }
      // setShowTimePickerModal(false);
    }
  };

  const showOpeningTimeErrorToast = () => {
    Toast.show({
      type: 'error',
      position: 'bottom',
      bottomOffset: 20,
      text1: t('Error'),
      text2: t('startingTime'),
      visibilityTime: 3000,
    });
  };

  const showClosingTimeErrorToast = () => {
    Toast.show({
      type: 'error',
      position: 'bottom',
      bottomOffset: 20,
      text1: t('Error'),
      text2: t('closingTime'),
      visibilityTime: 3000,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader title={t('openingHours')} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderAvailability('Monday')}
        {renderAvailability('Tuesday')}
        {renderAvailability('Wednesday')}
        {renderAvailability('Thursday')}
        {renderAvailability('Friday')}
        {renderAvailability('Saturday')}
        {renderAvailability('Sunday')}
      </ScrollView>
      {showTimePickerModal && (
        <DatePicker
          mode="time"
          minuteInterval={1}
          onTimeChange={selectedTime => handleTimeSelection(selectedTime)}
          options={{
            backgroundColor: colors.lightGrey,
            textHeaderColor: colors.primary,
            mainColor: colors.primary,
            defaultFont: fonts.regular,
            headerFont: fonts.medium,
          }}
        />
      )}
    </SafeAreaView>
  );
};

export default OpenHours;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  Availability_heading: {
    fontSize: 15,
    fontFamily: fonts.medium,
    color: colors.black,
  },
  Available: {
    marginHorizontal: 16,
    borderBottomColor: colors.borderGrey,
    borderBottomWidth: 1,
    paddingBottom: 9,
    marginBottom: 9,
    marginTop: 10,
  },
  closedText: {
    marginTop: 6,
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.black,
  },
  time: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  time_left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  time_inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderGrey,
  },
  timeText: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.black,
  },
});
