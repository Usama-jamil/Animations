import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  isLoading: false,
  error: false,
  errorMessage: false,
};

const slice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setLoading(state, action) {
      state.isLoading = action.payload;
    },

    hasError(state, action) {
      state.error = action.payload;
    },

    errorMessage(state, action) {
      state.errorMessage = action.payload;
    },
  },
});

export default slice.reducer;
const actions = slice.actions;

export const setLoading = data => dispatch => {
  dispatch(actions.setLoading(data));
};

export const setError = data => dispatch => {
  dispatch(actions.hasError(data));
};

export const setErrorMessage = data => dispatch => {
  dispatch(actions.errorMessage(data));
};
