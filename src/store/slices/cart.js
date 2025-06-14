import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  SelectedProducts: [],
  selectServies: [],
  selectListing: [],
  selectSubscription: [],
  selectBundles: [],
  selectBogo: [],
  teamMembers: [],
  serviceBasedMembers: [],
  selectdate: {},
  selectTime: {},
  isWaiting: false,
  branchid: '',
  currencyCode: '',
  fare: 0,
  activeRadio: 'Inplace',
  businessName: '',
};

const slice = createSlice({
  name: 'Cart',
  initialState,
  reducers: {
    SetSelectedProducts(state, action) {
      // Check if the product already exists in the SelectedProducts state
      const productExists = state.SelectedProducts.some(
        product => product._id === action.payload._id,
      );

      // If the product exists, update the product; otherwise, add it
      if (productExists) {
        state.SelectedProducts = state.SelectedProducts.map(product =>
          product._id === action.payload._id ? action.payload : product,
        );
      } else {
        state.SelectedProducts = [...state.SelectedProducts, action.payload];
      }
    },

    RemoveSelectedProduct(state, action) {
      state.SelectedProducts = state.SelectedProducts.filter(
        product => product._id !== action.payload,
      );
    },
    EmptySelectedProduct(state, action) {
      const {branchId} = action.payload;
      state.SelectedProducts = state.SelectedProducts.filter(
        product => product.branch !== branchId,
      );
    },

    EmptyProduct(state, action) {
      state.SelectedProducts = action.payload;
    },

    SetSelectedServices(state, action) {
      console.log('selected service', state.selectServies);
      state.selectServies = [...state.selectServies, action.payload];
    },

    RemoveSelectedService(state, action) {
      state.selectServies = state.selectServies.filter(
        service => service._id !== action.payload,
      );
    },

    EmptySelectedService(state, action) {
      const {branchId} = action.payload;
      state.selectServies = state.selectServies.filter(
        service => service.branch !== branchId,
      );
    },
    EmptyService(state, action) {
      state.selectServies = action.payload;
    },

    // listing

    SetSelectedListing(state, action) {
      console.log('selected service', state.selectListing);
      state.selectListing = [...state.selectListing, action.payload];
    },

    RemoveSelectedListing(state, action) {
      state.selectListing = state.selectListing.filter(
        listing => listing._id !== action.payload,
      );
    },

    EmptySelectedListing(state, action) {
      const {branchId} = action.payload;
      state.selectListing = state.selectListing.filter(
        listing => listing.branch !== branchId,
      );
    },
    EmptyListing(state, action) {
      state.selectListing = action.payload;
    },

    // subscription

    SetSelectedSubscription(state, action) {
      state.selectSubscription = [action.payload];
    },
    setServiceBasedMembers(state, action) {
      state.serviceBasedMembers = action.payload;
    },

    RemoveSelectedSubscription(state, action) {
      state.selectSubscription = state.selectSubscription.filter(
        subscription => subscription._id !== action.payload,
      );
    },

    EmptySelectedSubscription(state, action) {
      const {branchId} = action.payload;
      state.selectSubscription = state.selectSubscription.filter(
        subscription => subscription.branch !== branchId,
      );
    },
    EmptySubscription(state, action) {
      state.selectSubscription = action.payload;
    },

    // Bundles

    SetSelectedBundle(state, action) {
      state.selectBundles = [...state.selectBundles, action.payload];
    },

    RemoveSelectedBundle(state, action) {
      state.selectBundles = state.selectBundles.filter(
        bundle => bundle._id !== action.payload,
      );
    },

    EmptySelectedBundle(state, action) {
      const {branchId} = action.payload;
      state.selectBundles = state.selectBundles.filter(
        bundle => bundle.branch !== branchId,
      );
    },
    EmptyBundle(state, action) {
      state.selectBundles = action.payload;
    },

    // buy one get one

    SetSelectedBogo(state, action) {
      state.selectBogo = [...state.selectBogo, action.payload];
    },

    RemoveSelectedBogo(state, action) {
      state.selectBogo = state.selectBogo.filter(
        bogo => bogo._id !== action.payload,
      );
    },

    EmptySelectedBogo(state, action) {
      const {branchId} = action.payload;
      state.selectBogo = state.selectBogo.filter(
        bundle => bundle.branch !== branchId,
      );
    },
    EmptyBogo(state, action) {
      state.selectBogo = action.payload;
    },

  
    SetTeamMembers(state, action) {
      state.teamMembers = action.payload;
    },

    SetDate(state, action) {
      state.selectdate = action.payload;
    },

    SetTime(state, action) {
      state.selectTime = action.payload;
    },

    SetWaitngBooking(state, action) {
      state.isWaiting = action.payload;
    },

    SetBranchId(state, action) {
      state.branchid = action.payload;
    },
    SetCurrencyCode(state, action) {
      state.currencyCode = action.payload;
    },
    SetFare(state, action) {
      state.fare = action.payload;
    },
    SetActiveRadio(state, action) {
      state.activeRadio = action.payload;
    },
    SetBusinessName(state, action) {
      state.businessName = action.payload;
    },
  },
});

// Reducer
export default slice.reducer;
const actions = slice.actions;

export const SetSelectedProducts = data => dispatch => {
  dispatch(actions.SetSelectedProducts(data));
};

export const RemoveSelectedProduct = id => dispatch => {
  dispatch(actions.RemoveSelectedProduct(id));
};

export const SetSelectedBundle = data => dispatch => {
  dispatch(actions.SetSelectedBundle(data));
};

export const RemoveSelectedBundle = id => dispatch => {
  dispatch(actions.RemoveSelectedBundle(id));
};

export const SetSelectedService = data => dispatch => {
  dispatch(actions.SetSelectedServices(data));
};

export const SetSelectedServiceEmpty = data => dispatch => {
  dispatch(actions.EmptySelectedService(data));
};

export const SetSelectedSubsciptionEmpty = data => dispatch => {
  dispatch(actions.EmptySelectedSubscription(data));
};

export const SetSelectedProductEmpty = data => dispatch => {
  dispatch(actions.EmptySelectedProduct(data));
};

export const SetSelectedBundleEmpty = data => dispatch => {
  dispatch(actions.EmptySelectedBundle(data));
};

// lisitng

export const SetSelectedListingEmpty = data => dispatch => {
  dispatch(actions.EmptySelectedListing(data));
};

export const SetProductEmpty = data => dispatch => {
  dispatch(actions.EmptyProduct(data));
};

export const SetServiceEmpty = data => dispatch => {
  dispatch(actions.EmptyService(data));
};

export const SetListingEmpty = data => dispatch => {
  dispatch(actions.EmptyListing(data));
};

export const SetBundleEmpty = data => dispatch => {
  dispatch(actions.EmptyBundle(data));
};

export const RemoveSelectedListing = id => dispatch => {
  dispatch(actions.RemoveSelectedListing(id));
};

export const SetSubscriptionEmpty = data => dispatch => {
  dispatch(actions.EmptySubscription(data));
};

export const RemoveSelectedService = id => dispatch => {
  dispatch(actions.RemoveSelectedService(id));
};

export const SetSelectedListing = data => dispatch => {
  dispatch(actions.SetSelectedListing(data));
};

export const SetSelectedSubscription = data => dispatch => {
  dispatch(actions.SetSelectedSubscription(data));
};

export const RemoveSelectedSubscription = id => dispatch => {
  dispatch(actions.RemoveSelectedSubscription(id));
};

export const SetSelectedBogo = data => dispatch => {
  dispatch(actions.SetSelectedBogo(data));
};

export const RemoveSelectedBogo = id => dispatch => {
  dispatch(actions.RemoveSelectedBogo(id));
};

export const SetSelectedBogoEmpty = data => dispatch => {
  dispatch(actions.EmptySelectedBogo(data));
};

export const SetBogoEmpty = data => dispatch => {
  dispatch(actions.EmptyBogo(data));
};



export const SetTeamMembers = data => dispatch => {
  dispatch(actions.SetTeamMembers(data));
};

export const SetDate = data => dispatch => {
  dispatch(actions.SetDate(data));
};

export const SetTime = data => dispatch => {
  dispatch(actions.SetTime(data));
};

export const SetWaitng = data => dispatch => {
  dispatch(actions.SetWaitngBooking(data));
};

export const SetServiceBasedMembers = data => dispatch => {
  dispatch(actions.setServiceBasedMembers(data));
};

export const SetBranchId = data => dispatch => {
  dispatch(actions.SetBranchId(data));
};

export const SetCurrencyCode = data => dispatch => {
  dispatch(actions.SetCurrencyCode(data));
};

export const SetFareHomeService = data => dispatch => {
  dispatch(actions.SetFare(data));
};

export const SetActiveRadio = data => dispatch => {
  dispatch(actions.SetActiveRadio(data));
};

export const SetBusiness = data => dispatch => {
  dispatch(actions.SetBusinessName(data));
};
