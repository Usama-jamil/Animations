import {Platform} from 'react-native';
import * as AddCalendarEvent from 'react-native-add-calendar-event';
import * as Permissions from 'react-native-permissions';

const eventConfig = {
  title: 'test',
};

Permissions.request(
  Platform.select({
    ios: Permissions.PERMISSIONS.IOS.CALENDARS_WRITE_ONLY,
    android: Permissions.PERMISSIONS.ANDROID.WRITE_CALENDAR,
  }),
)
  .then(result => {
    if (result !== Permissions.RESULTS.GRANTED) {
      throw new Error(`No permission: ${result}`);
    }
    return AddCalendarEvent.presentEventCreatingDialog(eventConfig);
  })
  .then(eventInfo => {
    // handle success - receives an object with `calendarItemIdentifier` and `eventIdentifier` keys, both of type string.
    // These are two different identifiers on iOS.
    // On Android, where they are both equal and represent the event id, also strings.
    // when { action: 'CANCELED' } is returned, the dialog was dismissed
    console.warn(JSON.stringify(eventInfo));
  })
  .catch(error => {
    // handle error such as when user rejected permissions
    console.warn(error);
  });
