import Toast from 'react-native-toast-message';
import {
  setUnReadCountForChat,
  setUnReadCountForNotification,
} from '../store/slices/user';
import {API_ENDPOINTS, getRequest} from './apiService';

export const getUnReadCount = async dispatch => {
  try {
    const result = await getRequest(
      `${API_ENDPOINTS.notification.getUnReadCount}`,
    );

    if (result.success) {
      console.log('notification count', result?.data?.unreadCount);
      dispatch(setUnReadCountForNotification(result?.data?.unreadCount));
    } else {
      console.error('Error:', result.error);
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
};

export const getUnReadChatCount = async dispatch => {
  try {
    const result = await getRequest(`${API_ENDPOINTS.conversation.unRead}`);
    if (result.success) {
      console.log('chat count', result?.data?.unread_count);
      dispatch(setUnReadCountForChat(result?.data?.unread_count));
    } else {
      console.error('Error:', result.error);
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
};

export const setNotificationRead = async ({
  id,
  markall,
  setLoading,
  dispatch,
}) => {
  if (setLoading) setLoading(true); // Start loading

  let endpoint = '';

  if (markall) {
    endpoint = `${API_ENDPOINTS.notification.setRead}?markall=true`; // API for marking all as read
  } else if (id) {
    endpoint = `${API_ENDPOINTS.notification.setRead}?id=${id}`; // API for marking a single notification as read
  }

  try {
    const response = await getRequest(endpoint);

    // Refresh unread count
    await getUnReadCount(dispatch);

    return response;
  } catch (error) {
    console.error('Error in setNotificationRead:', error);
  } finally {
    if (setLoading) setLoading(false); // Stop loading
  }
};
