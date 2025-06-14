import {
  Text,
  View,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Button,
  Alert,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import CustomHeader from '../../components/header/CustomHeader';
import ToggleSwitch from 'toggle-switch-react-native';
import {colors, fonts} from '../../utils/styles';
import {useTranslation} from 'react-i18next';
import GeneralModal from '../../components/modal/GeneralModal';
import {API_ENDPOINTS, putRequest} from '../../utils/apiService';
import ReactNativeCalendarEvents from 'react-native-calendar-events';
import {useDispatch, useSelector} from 'react-redux';
import {setPickedCal} from '../../store/slices/calendersync';
import {useNavigation} from '@react-navigation/native';
import {setUser} from '../../store/slices/user';

const SyncSetting = () => {
  const {t} = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const dispatch = useDispatch();
  const {user} = useSelector(state => state.auth);
  const [isEnabled, setIsEnabled] = useState(user?.enable_calendar);
  const {pickedCal} = useSelector(state => state.calender);


  const toggleSwitch = async () => {
    const newValue = !isEnabled;
    setIsEnabled(newValue);
    await handleSubmitProfileUpdate(newValue);
  };

  const handleSubmitProfileUpdate = async newValue => {
    const profileData = {
      enable_calendar: newValue,
    };

    setIsLoading(true);

    // Update profile
    const updateResult = await putRequest(
      API_ENDPOINTS.auth.profileUpdate,
      profileData,
    );
    console.log('result', updateResult);

    setIsLoading(false);

    if (updateResult.success) {
      dispatch(setUser(updateResult.data));
      // Navigate or show success message
    } else {
      setErr(true);
      setErrMsg(updateResult.error);
    }
  };

  useEffect(() => {
    async function loadCalendars() {
      try {
        const perms = await ReactNativeCalendarEvents.requestPermissions();
        console.log('permission', perms);

        if (perms === 'authorized') {
          const allCalendars = await ReactNativeCalendarEvents.findCalendars();
          const primaryCal = allCalendars.find(
            cal => cal.isPrimary && cal.allowsModifications,
          );

          dispatch(setPickedCal(primaryCal));
        } else {
          console.log('Calendar permission denied.');
        }
      } catch (error) {
        console.log('Error while fetching calendars:', error);
      }
    }

    if (isEnabled) {
      loadCalendars();
    }
  }, [isEnabled]);

  const createEvent = async () => {
    console.log('event function called');
    const eventPayload = {
      calendarId: Platform.OS === 'android' ? pickedCal?.id : undefined,
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      location: 'Lahore',
      notes: 'test',
      description: 'test',
    };

    console.log(
      'Event Payload:',

      eventPayload,
    );

    try {
      await ReactNativeCalendarEvents.saveEvent('saloon', eventPayload);

      Alert.alert('Event saved successfully.');
    } catch (error) {
      console.log('Error while saving event:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title={t('syncSetting')} />

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
          <View style={styles.row}>
            <Text allowFontScaling={false} style={styles.heading}>
              {t('enableCalendarSync')}
            </Text>
            <ToggleSwitch
              isOn={isEnabled}
              onColor={colors.primary}
              offColor={colors.gray}
              thumbOffStyle={{backgroundColor: colors.darkGrey}}
              size="medium"
              onToggle={toggleSwitch}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

export default SyncSetting;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.lightGreen,
    paddingHorizontal: 15,
    paddingVertical: 20,
    borderRadius: 18,
    marginHorizontal: 16,
  },
  heading: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.black,
  },
});
