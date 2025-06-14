import {Linking} from 'react-native';
import CalendarEvents from 'react-native-calendar-events';
import moment from 'moment';
import Toast from 'react-native-toast-message';

export const addToIosCalendar = async () => {
  const referenceDate = moment.utc('2001-01-01');
  const secondsSinceRefDateiOS = startDate - referenceDate.unix();
  try {
    await CalendarEvents.requestPermissions(false);
    await CalendarEvents.checkPermissions(true);
    await CalendarEvents.saveEvent(title, {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      location: location,
      notes: title,
      url: url,
      alarms: [{date: startDate.toISOString() - 6000}],
    });
    Linking.openURL(`calshow:${secondsSinceRefDateiOS}`);
  } catch (error) {
    Toast.show({
      type: 'error',
      position: 'top',
      bottomOffset: 20,
      text1: 'error',
      text2: error,
      visibilityTime: 3000,
    });

    return null;
  }
};
