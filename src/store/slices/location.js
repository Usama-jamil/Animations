import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoading: false,
  error: null,
  location: {},
  completeAddress: null,
  addresses: [], // Array to store address objects with lat, lng, line1, and line2
  selectAddress: {},
};

const slice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setLoading(state, action) {
      state.isLoading = action.payload;
    },

    setLocation(state, action) {
      console.log('payload', action.payload);
      state.location = action.payload;
    },

    setCompleteAddress(state, action) {
      state.completeAddress = action.payload;
    },

    addAddress(state, action) {
      state.addresses.push(action.payload); // Add new address object to addresses array
    },

    editAddress(state, action) {
      const { index, updatedAddress } = action.payload;
      console.log('payload', index, updatedAddress);
      if (index >= 0 && index < state.addresses.length) {
        state.addresses[index] = { ...state.addresses[index], ...updatedAddress }; // Update specific address
      }
    },

    removeAddress(state, action) {
      const index = action.payload;
      if (index >= 0 && index < state.addresses.length) {
        state.addresses.splice(index, 1); // Remove address at specified index
      }
    },

    clearAddresses(state) {
      state.addresses = []; // Clear all addresses
    },

    setAddresses(state, action) {
      state.addresses = action.payload; // Set the entire addresses array
    },

    setSelectAddress(state, action) {
      state.selectAddress = action.payload; // Set the selected address
    },
  },
});

export default slice.reducer;
const actions = slice.actions;

// Action creators
export const addLocation = data => async dispatch => {
  dispatch(actions.setLocation(data));
};

export const setCompleteAddress = data => async dispatch => {
  dispatch(actions.setCompleteAddress(data));
};

// New action creators for address management
export const addAddress = address => async dispatch => {
  dispatch(actions.addAddress(address));
};

export const editAddress = (index, updatedAddress) => async dispatch => {
  dispatch(actions.editAddress({ index, updatedAddress }));
};

export const removeAddress = index => async dispatch => {
  dispatch(actions.removeAddress(index));
};

// Action creator to clear all addresses
export const clearAddresses = () => async dispatch => {
  dispatch(actions.clearAddresses());
};

// Action creator to set the entire addresses array
export const setAddresses = addressesArray => async dispatch => {
  dispatch(actions.setAddresses(addressesArray));
};

export const setSelectAddress = selectedAddress => async dispatch => {
  dispatch(actions.setSelectAddress(selectedAddress));
};
