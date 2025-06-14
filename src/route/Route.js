import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useSelector} from 'react-redux';
import {useEffect} from 'react';
// Import Components
import BottomTabBar from './BottomTabBar';
import ChooseLanguage from '../pages/onBoarding/ChooseLanguage';
import OnBoarding from '../pages/onBoarding/OnBoarding';
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import ForgotPassword from '../pages/auth/ForgotPassword';
import AddNewPassword from '../pages/auth/AddNewPassword';
import VerifyOTP from '../pages/auth/VerifyOTP';
import IntrestedCategory from '../pages/auth/IntrestedCategory';
import AccountManagement from '../pages/profile/AccountManagement';
import Gift from '../pages/gift/Gift';
import HomeDetails from '../pages/home/HomeDetails';
import ChatDetail from '../pages/chat/ChatDetail';
import ServiceDetails from '../pages/home/ServiceDetails';
import ProductDetails from '../pages/home/ProductDetails';
import Overview from '../pages/home/Overview';
import Profession from '../pages/home/Profession';
import SelectProfessionals from '../pages/home/SelectProfessionals';
import SelectTime from '../pages/home/SelectTime';
import Profile from '../pages/profile/Profile';
import EditProfile from '../pages/profile/EditProfile';
import Faqs from '../pages/about/faqs/Faqs';
import AboutUs from '../pages/about/about-us/AboutUs';
import PrivacyPolicy from '../pages/about/privacy-policy/PrivacyPolicy';
import ContactSupport from '../pages/about/contact-support/ContactSupport';
import Notifications from '../pages/notifications/Notifications';
import Subscriptions from '../pages/subscriptions/Subscriptions';
import SubscriptionDetail from '../pages/subscriptions/SubscriptionDetail';
import ReviewConfirm from '../pages/home/ReviewConfirm';
import PayNow from '../pages/home/PayNow';
import BookingDetail from '../pages/booking/BookingDetail';
import GiftCards from '../pages/home/GiftCard';
import BusinessDetail from '../pages/booking/BusinessDetail';
import OpenHours from '../pages/booking/OpenHours';
import CalenderSync from '../pages/more/CalenderSync';
import Favorites from '../pages/favorites/Favorites';
import SyncSetting from '../pages/more/SyncSetting';
import Services from '../pages/home/Services';
import ProductsAll from '../pages/home/Products';
import SubscriptionAll from '../pages/home/Subscription';
import CardManagement from '../components/more/CardManagement';
import AttachCards from '../pages/attach-card/AttchCards';
import Search from '../pages/search/Search';
import Map from '../pages/homeAdress/Location';
import CompaignService from '../pages/home/CompaignService';
import Terms from '../pages/auth/Terms';
import SuggestedProducts from '../pages/home/SuggestedProducts';
import Payment from '../pages/home/Payment';
import Availability from '../pages/listing/Availability';
import ConfirmPickup from '../pages/confirm-pickup/ConfirmPickup';
import ListingBookingDetail from '../pages/listing-detail/ListingBookingDetail';
import ReturnListing from '../pages/return-Listing/ReturnListing';
import ListingList from '../pages/home/ListingList';
import ListingDetail from '../pages/home/ListingDetail';
import BundleList from '../pages/home/BundleList';
import FreeSampleList from '../pages/home/FreeSampleList';
import BuyOneGetOne from '../pages/home/BuyOneGetOne';
import HappyHour from '../pages/home/HappyHour';
import EarlyBirdDiscount from '../pages/home/EarlyBirdDiscount';
import FirstPurchaseList from '../pages/home/FirstPurchaseList';

const Stack = createNativeStackNavigator();

const Route = () => {
  const {user, isUserOnboarded} = useSelector(state => state.auth);


  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="ChooseLanguage" component={ChooseLanguage} />

        {/* {user ? (
          <>
            <Stack.Screen name="Home" component={BottomTabBar} />
            <Stack.Screen name="AllServices" component={Services} />
            <Stack.Screen name="AllSubscription" component={SubscriptionAll} />
            <Stack.Screen name="AllProducts" component={ProductsAll} />
            <Stack.Screen
              name="SuggestedProducts"
              component={SuggestedProducts}
            />
            <Stack.Screen name="HomeDetails" component={HomeDetails} />
            <Stack.Screen name="ServiceDetails" component={ServiceDetails} />
            <Stack.Screen name="ProductDetails" component={ProductDetails} />
            <Stack.Screen name="OverView" component={Overview} />
            <Stack.Screen name="Profession" component={Profession} />
            <Stack.Screen
              name="SelectProfessionals"
              component={SelectProfessionals}
            />
            <Stack.Screen name="SelectTime" component={SelectTime} />
            <Stack.Screen name="ReviewConfirm" component={ReviewConfirm} />
            <Stack.Screen name="PayNow" component={PayNow} />
            <Stack.Screen name="AttachCards" component={AttachCards} />
            <Stack.Screen name="BookingDetail" component={BookingDetail} />
            <Stack.Screen name="CalenderSync" component={CalenderSync} />
            <Stack.Screen name="Favorites" component={Favorites} />
            <Stack.Screen
              name="AccountManagement"
              component={AccountManagement}
            />
            <Stack.Screen name="Gift" component={Gift} />
            <Stack.Screen name="ChatDetail" component={ChatDetail} />
            <Stack.Screen name="Faqs" component={Faqs} />
            <Stack.Screen name="AboutUs" component={AboutUs} />
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
            <Stack.Screen name="ContactSupport" component={ContactSupport} />
            <Stack.Screen name="Profile" component={Profile} />
            <Stack.Screen name="EditProfile" component={EditProfile} />
            <Stack.Screen name="Notifications" component={Notifications} />
            <Stack.Screen name="Subscriptions" component={Subscriptions} />
            <Stack.Screen name="GiftCards" component={GiftCards} />
            <Stack.Screen name="BusinessDetails" component={BusinessDetail} />
            <Stack.Screen name="OpeningHours" component={OpenHours} />
            <Stack.Screen name="SyncSetting" component={SyncSetting} />
            <Stack.Screen name="HomeAddress" component={Map} />
            <Stack.Screen name="CardManagement" component={CardManagement} />
            <Stack.Screen name="CompaignService" component={CompaignService} />
            <Stack.Screen name="search" component={Search} />
            <Stack.Screen
              name="SubscriptionDetail"
              component={SubscriptionDetail}
            />
            <Stack.Screen name="Payment" component={Payment} />
            <Stack.Screen name="AllLanguage" component={ChooseLanguage} />
            <Stack.Screen name="listingAvailibility" component={Availability} />
            <Stack.Screen name="ConfirmPickup" component={ConfirmPickup} />
            <Stack.Screen
              name="ListingBookingDetail"
              component={ListingBookingDetail}
            />
            <Stack.Screen name="ReturnListing" component={ReturnListing} />
            <Stack.Screen name="ListingList" component={ListingList} />
            <Stack.Screen name="ListingDetail" component={ListingDetail} />
            <Stack.Screen name="BundleList" component={BundleList} />
            <Stack.Screen name="FreeSampleList" component={FreeSampleList} />
            <Stack.Screen name="BuyOneGetOneList" component={BuyOneGetOne} />
            <Stack.Screen name="HappyHourList" component={HappyHour} />
            <Stack.Screen
              name="EarlyBirdDiscountList"
              component={EarlyBirdDiscount}
            />
            <Stack.Screen
              name="FirstPurchaseList"
              component={FirstPurchaseList}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="ChooseLanguage" component={ChooseLanguage} />
            {!isUserOnboarded && (
              <Stack.Screen name="OnBoarding" component={OnBoarding} />
            )}
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Terms" component={Terms} />

            <Stack.Screen
              name="IntrestedCategory"
              component={IntrestedCategory}
            />
            <Stack.Screen name="Signup" component={Signup} />
            <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
            <Stack.Screen name="AddNewPassword" component={AddNewPassword} />
            <Stack.Screen name="VerifyOTP" component={VerifyOTP} />
          </>
        )} */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Route;
