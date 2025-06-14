import {combineReducers} from 'redux';
import userReducer from './slices/user';
import locationReducer from './slices/location';
import cartReducer from './slices/cart';
import PaymentReducer from './slices/paymentmethod';
import calendersync from './slices/calendersync';

const rootReducer = combineReducers({
  auth: userReducer,
  location: locationReducer,
  cart: cartReducer,
  payment: PaymentReducer,
  calender: calendersync,
});

export {rootReducer};
