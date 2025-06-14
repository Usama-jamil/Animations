import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  pickedCal: null,
};

const slice = createSlice({
  name: 'calendersync',
  initialState,
  reducers: {
    setPickedCal(state, action) {
      state.pickedCal = action.payload;
    },
  },
});

export default slice.reducer;
const actions = slice.actions;

export const setPickedCal = data => dispatch => {
  dispatch(actions.setPickedCal(data));
};
