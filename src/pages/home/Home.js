import React, {useState, useCallback, useEffect} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {API_ENDPOINTS, putRequest} from '../../utils/apiService';
import {getRequest} from '../../utils/apiService';
import {
  widthPercentageToDP as WP,
  heightPercentageToDP,
} from 'react-native-responsive-screen';

import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';

import GeneralModal from '../../components/modal/GeneralModal';
import Search from '../../../assets/icons/search-2.svg';
import Recommended from '../../components/home/Recommended';
import BestOffers from '../../components/home/BestOffers';
import Services from '../../components/home/Services';
import Products from '../../components/home/Products';
import Subscriptions from '../../components/home/Listing';
import Location from 'react-native-vector-icons/Feather';
import Feather from 'react-native-vector-icons/Feather';

import {colors, commonStyles, fontSizes, fonts} from '../../utils/styles';
import CustomHeader from '../../components/header/CustomHeader';
import {useTranslation} from 'react-i18next';
import {updateLocationModalStatus} from '../../store/slices/user';
import {useDispatch, useSelector} from 'react-redux';
import {Overlay} from '@rneui/themed';
import NoDataIcon from '../../../assets/icons/no_data.svg';

// Assets
import FIllSvg from '../../../assets/icons/fill_radio.svg';
import UnfillSvg from '../../../assets/icons/unfill_radio.svg';
import {addLocation, setSelectAddress} from '../../store/slices/location';
import RemoteNotification from '../../../RemoteNotification';
import {BlurView} from '@react-native-community/blur';
import {RefreshControl} from 'react-native';
import GuestModal from '../../components/guest-modal/GuestModal';
import Campaign from '../../components/home/Campaign';
import CategorySelector from '../../components/home/Activity';
import Slots from '../../components/home/Slots';
import Banner from '../../components/home/banner';
import DiscoverSection from '../../components/home/discover';
import Listing from '../../components/home/Listing';

const Home = ({navigation}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [locationLoading, setlocationLoading] = useState(false);

  const [data, setData] = useState([]);
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const {t} = useTranslation();
  const [locationPopUp, setlocationPopUp] = useState(false);
  const {user} = useSelector(state => state.auth);
  const {addresses, selectAddress} = useSelector(state => state.location);
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [guestPopUp, setGuestPopUp] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  console.log('addresses',addresses)

  useEffect(() => {
    if (selectAddress && selectAddress?.latitude && selectAddress?.longitude) {
      fetchData();
    }
  }, [selectAddress, selectedDate, selectedCategory]);

  const fetchData = async () => {
    setIsLoading(true);

    let url = `${API_ENDPOINTS.home.getAll}?lat=${selectAddress.latitude}&lng=${selectAddress.longitude}`;

    if (selectedDate) {
      url += `&date=${encodeURIComponent(selectedDate?.fullDate)}`;
    }
    if (selectedCategory) {
      url += `&category=${encodeURIComponent(selectedCategory)}`;
    }
    const result = await getRequest(url);
    setIsLoading(false);
    if (result.success) {
      setData(result.data || []);
    } else if (result.error) {
      setErr(true);
      setErrMsg(result.error);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(); // Fetch new data on pull
    setRefreshing(false); // Set refreshing to false when done
  }, [selectAddress]);

useFocusEffect(
  useCallback(() => {
    if (!user?.isGuest && (!user?.checkSubscriptions || addresses?.length === 0)) {
      setlocationPopUp(true);
    } else {
      setlocationPopUp(false);
    }
  }, [user, addresses]),
);
  const handleSubmitProfileUpdate = async () => {
    if (addresses?.length === 0) {
      if (addresses?.length > 0) {
        const selectedLocation = addresses[0];
        if (Object.keys(selectAddress).length === 0) {
          dispatch(setSelectAddress(selectedLocation));
        }
      }
      // Prepare profile data
      const profileData = {
        checkSubscriptions: true,
        locations: addresses,
      };
      setlocationLoading(true);
      setlocationPopUp(false);
      navigation.navigate('HomeAddress', {state: false, places: true});
      // Update profile
      const updateResult = await putRequest(
        API_ENDPOINTS.auth.profileUpdate,
        profileData,
      );

      setlocationLoading(false);

      if (updateResult.success) {
        dispatch(updateLocationModalStatus(updateResult.data));
        setlocationPopUp(false);
      } else {
        setErr(true);
        setErrMsg(updateResult.error);
      }
    } else {
      // If addresses are present, simply close the popup
      setlocationPopUp(false);
      navigation.navigate('HomeAddress', {state: false, places: true});
    }
  };

  const handleAddressSelect = address => {
    dispatch(setSelectAddress(address));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader
        isProfile={true}
        location={selectAddress?.line1}
        handleLocationPress={() => setlocationPopUp(true)}
      />
      {err && (
        <GeneralModal
          modalError={true}
          description={errMsg}
          Set_Modal_Visibilty={setErr}
        />
      )}
      {guestPopUp && (
        <GuestModal showPopUp={guestPopUp} setShowPopUp={setGuestPopUp} />
      )}
      <RemoteNotification />

      {isLoading ? (
        <View
          style={{
            justifyContent: 'flex-start',
            alignItems: 'center',
            marginTop: 20,
            flex: 1,
          }}>
          <ActivityIndicator size={'large'} color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{marginBottom: 80}}
          refreshControl={
            <RefreshControl
              refreshing={refreshing} // Bind refreshing state
              onRefresh={onRefresh} // Call onRefresh when user pulls
              colors={[colors.primary]} // Set refresh spinner color
            />
          }>
          <View style={styles.textInputContainer}>
            <TouchableOpacity
              style={styles.searchInputIconContainer}
              onPress={() => navigation.navigate('search', {lat: '', lng: ''})}>
              <View>
                <Search width={24} height={24} />
              </View>

              <TouchableOpacity
                style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}
                onPress={() =>
                  navigation.navigate('search', {lat: '', lng: ''})
                }>
                <Text allowFontScaling={false} style={styles.textInput}>
                  {t('search')}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: 50,
                height: 50,
                borderRadius: 10,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: colors.primary,
              }}
              onPress={() => navigation.navigate('HomeAddress', {state: true})}>
              <Location name="map-pin" size={24} color={colors.background} />
            </TouchableOpacity>
          </View>
          {data?.sponsors && data?.sponsors.length > 0 && (
          <Banner data={data?.sponsors} />
          )}
          <Slots
            data={data?.weekDays}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
          <CategorySelector
            data={data?.categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />

          <Campaign />
          <DiscoverSection />
          <Recommended business={data?.recomended} />
          <BestOffers bestOffers={data?.bestoffers} />
          <Services services={data?.services} />
          <Listing data={data?.listings} />
          <Products Product={data?.products} />
        </ScrollView>
      )}

      {locationPopUp && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
          <BlurView
            style={styles.absolute}
            blurType="light"
            blurAmount={5}
            reducedTransparencyFallbackColor="white">
            <Overlay
              overlayStyle={{
                padding: 0,
                marginBottom: 0,
                borderRadius: 30,
              }}
              animationType="fade"
              transparent={true}>
              <View style={styles.centeredView}>
                <View style={styles.modalContainer}>
                  <View style={styles.modalView}>
                    {locationLoading ? (
                      <View>
                        <ActivityIndicator
                          animating
                          size="large"
                          color={colors.primary}
                        />
                      </View>
                    ) : (
                      <>
                        <ScrollView
                          showsVerticalScrollIndicator={false}
                          contentContainerStyle={{padding: 0}}>
                          {addresses && addresses.length > 0 ? (
                            addresses.map((address, index) => (
                              <TouchableOpacity
                                key={index} // Add a unique key for each item
                                style={styles.radioButtonContainer}
                                onPress={() =>
                                  handleAddressSelect(address, index)
                                }>
                                <View
                                  style={{
                                    alignSelf: 'flex-start',
                                    marginTop: 4,
                                  }}>
                                  {selectAddress?.latitude ===
                                  address?.latitude ? (
                                    <FIllSvg width={18} height={18} />
                                  ) : (
                                    <UnfillSvg width={18} height={18} />
                                  )}
                                </View>

                                <View style={styles.addressTextContainer}>
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                      justifyContent: 'space-between',
                                      alignItems: 'flex-start',
                                      gap: 5,
                                    }}>
                                    <Text
                                      style={[styles.addressTitle, {flex: 1}]}
                                      numberOfLines={2}>
                                      {address.line1}
                                    </Text>
                                    {!user?.isGuest && (
                                      <TouchableOpacity
                                        onPress={() => {
                                          setlocationPopUp(false);
                                          navigation.navigate('HomeAddress', {
                                            state: false,
                                            locationname: address.line1,
                                            index: index,
                                            places: true,
                                          });
                                        }}>
                                        <Feather name="edit-2" size={18} />
                                      </TouchableOpacity>
                                    )}
                                  </View>
                                  <Text
                                    style={styles.addressSubtitle}
                                    numberOfLines={3}
                                    ellipsizeMode="tail">
                                    {address.line2}
                                  </Text>
                                </View>
                              </TouchableOpacity>
                            ))
                          ) : (
                            <View>
                              <NoDataIcon width={300} height={250} />
                              <Text
                                allowFontScaling={false}
                                style={[styles.noDataText, {marginTop: 0}]}>
                                {t('noaddressFound')}
                              </Text>
                            </View>
                          )}
                        </ScrollView>

                        {addresses && addresses.length > 0 && (
                          <TouchableOpacity
                            style={[
                              commonStyles.btnContainer,
                              {
                                borderColor: colors.primary,
                                borderWidth: 1,
                                marginBottom: 10,
                                shadowOpacity: 0,
                                width: WP('70'),
                                marginTop: 10,
                              },
                            ]}
                            onPress={() => setlocationPopUp(false)}>
                            <Text
                              style={[
                                commonStyles.btnText,
                                {color: colors.background},
                              ]}>
                              {t('continue')}
                            </Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          style={[
                            commonStyles.btnOutlineContainer,
                            {
                              borderColor: colors.primary,
                              borderWidth: 1,
                              marginBottom: 10,
                              shadowOpacity: 0,
                              width: WP('70'),
                              alignSelf: 'center',
                            },
                          ]}
                          onPress={() => {
                            if (!user?.isGuest) {
                              handleSubmitProfileUpdate();
                            } else {
                              setlocationPopUp(false);
                              setTimeout(() => {
                                setGuestPopUp(true);
                              }, 1000);
                            }
                          }}>
                          <Text
                            style={[
                              commonStyles.btnOutlineText,
                              {color: colors.primary},
                            ]}>
                            {t('addAddress')}
                          </Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              </View>
            </Overlay>
          </BlurView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
    marginHorizontal: 10,
    justifyContent: 'space-between',
  },
  searchInputIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderGrey,
    height: 50,
    paddingHorizontal: 10,
  },
  iconStyle: {
    marginLeft: 5, // Adjust margin as needed
  },
  textInput: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.xSmall,
    marginLeft: 5,
    color: colors.placeholderGrey,
    width: '90%',
  },
  centeredView: {
    justifyContent: 'center',

    width: WP('80'),
    height: heightPercentageToDP('50'),
  },

  modalContainer: {
    alignItems: 'center',
    borderRadius: 30,
    overflow: 'hidden',
    width: WP('80'),
    color: colors.white,
    border: 'none',
    zIndex: -1000,
  },
  modalView: {
    padding: 10,
  },
  map: {
    zIndex: -1,
  },

  radioButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomColor: colors.borderGrey,
    borderBottomWidth: 1,
  },
  addressTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  addressTitle: {
    fontSize: 16,
    fontFamily: fonts.bold,
  },
  addressSubtitle: {
    fontSize: 14,
    color: colors.lightBlack,
    fontFamily: fonts.regular,
  },
  addressCity: {
    fontSize: 12,
    color: colors.lightBlack,
    fontFamily: fonts.regular,
  },
  addNewAddressButton: {
    padding: 15,
    alignItems: 'center',
    borderTopColor: '#e0e0e0',
    borderTopWidth: 1,
    width: '100%',
  },
  addNewAddressText: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: 'bold',
  },
  noDataText: {
    fontSize: fontSizes.xSmall,
    color: colors.black,
    fontFamily: fonts.medium,
    textAlign: 'center',
    marginTop: 20,
  },
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
});
