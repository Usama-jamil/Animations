import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  isLoading: false,
  error: null,
  user: null,
  userInfo: null,
  timeZone: 'Asia/Karachi',
  fcmToken: '',
  userLang: 'en',
  newNotification: false,
  unreadCount: 0,
  chatUnReadCount: 0,
  isUserOnboarded: false,
};

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading(state, action) {
      state.isLoading = action.payload;
    },

    hasError(state, action) {
      state.error = action.payload;
    },

    setUserData(state, action) {
      state.user = action.payload;
    },

    UserInformation(state, action) {
      state.userInfo = action.payload;
    },
    setTimeZone(state, action) {
      state.timeZone = action.payload;
    },

    setfcmToken(state, action) {
      state.fcmToken = action.payload;
    },

    setUserLang(state, action) {
      state.userLang = action.payload;
    },

    setNewNotification(state, action) {
      state.newNotification = action.payload;
    },

    updateLocationForModalStatus(state, action) {
      console.log('subscription check',action.payload.checkSubscriptions)
      state.user.checkSubscriptions = action.payload.checkSubscriptions;
    },
    setUnReadCount(state, action) {
      state.unreadCount = action.payload;
    },
  
    setChatUnReadCount(state, action) {
      state.chatUnReadCount = action.payload;
    },
    setUserOnboardedData(state, action) {
      state.isUserOnboarded = action.payload;
    },
  },
});

// Reducer
export default slice.reducer;
const actions = slice.actions;

export const setUser = data => dispatch => {
  dispatch(actions.setUserData(data));
};

export const setTimeZone = data => dispatch => {
  dispatch(actions.setTimeZone(data));
};

export const setfcmToken = data => dispatch => {
  dispatch(actions.setfcmToken(data));
};

export const setNewNotification = data => dispatch => {
  dispatch(actions.setNewNotification(data));
};

export const setUserLang = data => dispatch => {
  dispatch(actions.setUserLang(data));
  return;
};

export const SetUserInformation = data => dispatch => {
  dispatch(actions.UserInformation(data));
};

export const removeLocalUser = () => dispatch => {
  dispatch(actions.setUserData(null));
};

export const updateLocationModalStatus = (data) => dispatch => {
  dispatch(actions.updateLocationForModalStatus(data));
};

export const setUnReadCountForNotification = (data) => dispatch => {
  dispatch(actions.setUnReadCount(data));
};

export const setUnReadCountForChat = (data) => dispatch => {
  dispatch(actions.setChatUnReadCount(data));
};

export const setUserOnboarding = data => async dispatch => {
  dispatch(actions.setUserOnboardedData(data));
};


