import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';

// Styles
import {colors, commonStyles, fontSizes, fonts} from '../../utils/styles';

// Third Party
import {useTranslation} from 'react-i18next';

import Card from './Card';
// Import Navigation
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useDispatch} from 'react-redux';

import {useSelector} from 'react-redux';
import {getRequest, postRequest} from '../../utils/apiService';
import {API_ENDPOINTS} from '../../utils/apiService';
import {
  SetActiveRadio,
  SetBusiness,
  SetFareHomeService,
  SetSelectedProductEmpty,
  SetSelectedServiceEmpty,
  SetSelectedSubsciptionEmpty,
} from '../../store/slices/cart';
import {SetBranchId} from '../../store/slices/cart';
import Alert from '../../../assets/icons/info.png';
import GeneralModal from '../../components/modal/GeneralModal';
import Toast from 'react-native-toast-message';
import GuestModal from '../guest-modal/GuestModal';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import BusinessInfo from './BusinessInfo';
import ProfessionalList from './ProfessionalList';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Bundles from './Bundles';

var limit = 10;

const haversineDistance = (coords1, coords2) => {
  const toRadian = angle => (Math.PI / 180) * angle;
  const distance = (a, b) => (Math.PI / 180) * (b - a);
  const R = 6371; // Radius of Earth in kilometers

  const dLat = distance(coords1.latitude, coords2.latitude);
  const dLon = distance(coords1.longitude, coords2.longitude);

  const lat1 = toRadian(coords1.latitude);
  const lat2 = toRadian(coords2.latitude);

  // Haversine formula
  const a =
    Math.pow(Math.sin(dLat / 2), 2) +
    Math.pow(Math.sin(dLon / 2), 2) * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.asin(Math.sqrt(a));

  return R * c; // Distance in kilometers
};

const HomeDetail = ({
  branchId,
  activeButton,
  setActiveButton,
  businessdata,
  activeRadio,
  setErr,
  setErrMsg,
}) => {
  const {t} = useTranslation();

  const [data, setdata] = useState([]);
  const [products, SetProducts] = useState([]);
  const [Page, setPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const {
    selectServies,
    SelectedProducts,
    selectBundles,
    selectListing,
    selectBogo,
  } = useSelector(state => state.cart);
  const [loading, setLoading] = useState(false);
  const [showPopUp, setShowPopUp] = useState(false);

  const {user} = useSelector(state => state.auth);
  const scrollViewRef = useRef(null);
  const [guestPopUp, setGuestPopUp] = useState(false);

  const filteredServices = selectServies.filter(
    service =>
      service.branch === branchId &&
      (!service.compaigntype ||
        service.compaigntype === '' ||
        service.compaigntype === null),
  );

  const filteredServicesForCompaign = selectServies.filter(
    service => service.branch === branchId && service.compaigntype,
  );

  const filteredProducts = SelectedProducts.filter(
    product => product.branch === branchId,
  );

  const filteredBundles = selectBundles.filter(
    bundle => bundle.branch === branchId,
  );

  const filteredBogo = selectBogo.filter(bogo => bogo.branch === branchId);

  const filterHappyHour = filteredServicesForCompaign.filter(
    data => data?.type === 'happyHour',
  );
  const filterEarlyBird = filteredServicesForCompaign.filter(
    data => data?.type === 'earlyBirdDiscount',
  );

  const businessCoords = businessdata?.address?.location?.coordinates;
  const userCoords = user?.address?.location?.coordinates;
  const maxDistance = businessdata?.homeService?.maxDistance;
  const fare = businessdata?.homeService?.fare;
  const pagerRef = useRef(null);
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);

  // On button press
  const handleButtonPress = (value, index) => {
    setActiveButton(value);
    pagerRef.current?.setPage(index); // Navigate to selected page
    scrollViewRef.current?.scrollTo({
      x: offset,
      animated: true,
    });
  };

  // Function to check if the user is within booking range
  const isWithinRange = () => {
    // console.log('Business Coords:', businessCoords, userCoords);
    if (businessCoords && userCoords && maxDistance) {
      const distance = haversineDistance(
        {latitude: businessCoords[1], longitude: businessCoords[0]}, // business latitude, longitude
        {latitude: userCoords[1], longitude: userCoords[0]}, // user latitude, longitude
      );

      return distance <= maxDistance;
    }
    return false;
  };

  const handleContinue = async () => {
    const showToast = (title, description) => {
      Toast.show({
        type: 'info',
        position: 'top',
        bottomOffset: 20,
        text1: t(title),
        text2: t(description),
        visibilityTime: 3000,
      });
    };

    const isValidBookingRange = () => {
      if (!user?.address) {
        showToast('error', 'homeservicewithoutAddress');
        navigation.navigate('HomeAddress', {state: false});
        return false;
      }
      if (!isWithinRange()) {
        showToast('bookingRange', 'bookingRangeDes');
        return false;
      }
      return true;
    };

    // Common checks for both Inplace and HomeService
    if (user?.isGuest) {
      setGuestPopUp(true);
      return;
    }

    dispatch(SetBusiness(businessdata?.name));

    console.log('Counts:', {
      products: filteredProducts?.length,
      services: filteredServices?.length,
      bundles: filteredBundles?.length,
      bogo: filteredBogo?.length,
      happyHour: filterHappyHour?.length,
      EarlyBird: filterEarlyBird?.length,
    });

    // Check if nothing is selected
    if (
      !filteredProducts?.length &&
      !filteredServices?.length &&
      !filteredBundles?.length &&
      !filteredBogo?.length &&
      !filteredServicesForCompaign?.length
    ) {
      showToast('selectService', 'selectServiceDes');
      return;
    }

    // Service cannot be selected with bundle
    if (filteredServices?.length > 0 && filteredBundles?.length > 0) {
      showToast('invalidCombination', 'serviceWithBundleInvalid');
      return;
    }

    // Service cannot be selected with BOGO
    if (filteredServices?.length > 0 && filteredBogo?.length > 0) {
      showToast('invalidCombination', 'serviceWithBogoInvalid');
      return;
    }

    // Service cannot be selected with Happy Hour Discount
    if (filteredServices?.length > 0 && filterHappyHour?.length > 0) {
      showToast('invalidCombination', 'serviceWithHappyHourInvalid');
      return;
    }

    // Service cannot be selected with Early Bird Discount
    if (filteredServices?.length > 0 && filterEarlyBird?.length > 0) {
      showToast('invalidCombination', 'serviceWithEarlyBirdInvalid');
      return;
    }

    // Product cannot be selected with bundle
    if (filteredProducts?.length > 0 && filteredBundles?.length > 0) {
      showToast('invalidCombination', 'productWithBundleInvalid');
      return;
    }

    // // Product cannot be selected with BOGO
    // if (filteredProducts?.length > 0 && filteredBogo?.length > 0) {
    //   showToast('invalidCombination', 'productWithBogoInvalid');
    //   return;
    // }

    // if bogo and bundle both selected
    if (filteredBogo?.length > 0 && filteredBundles?.length > 0) {
      showToast('invalidCombination', 'bundlesWithBogoInvalid');
      return;
    }

    // if Happy Hour and bundle both selected
    if (filterHappyHour?.length > 0 && filteredBundles?.length > 0) {
      showToast('invalidCombination', 'campaignWithBundleInvalid');
      return;
    }

    // if Happy Hour and bogo both selected
    if (filterHappyHour?.length > 0 && filteredBogo?.length > 0) {
      showToast('invalidCombination', 'campaignWithBogoInvalid');
      return;
    }

    // if Early Bird and bundle both selected
    if (filterEarlyBird?.length > 0 && filteredBundles?.length > 0) {
      showToast('invalidCombination', 'campaignWithBundleInvalid');
      return;
    }

    // if Early Bird  and bogo both selected
    if (filterEarlyBird?.length > 0 && filteredBogo?.length > 0) {
      showToast('invalidCombination', 'campaignWithBogoInvalid');
      return;
    }

    // Cannot mix happy hour and early bird services
    if (filterHappyHour?.length > 0 && filterEarlyBird?.length > 0) {
      showToast('invalidCombination', 'cannotMixCampaignTypes');
      return;
    }

    // Only product selected (invalid)
    if (
      filteredProducts?.length > 0 &&
      !filteredServices?.length &&
      !filteredBundles?.length &&
      !filteredBogo?.length &&
      !filteredServicesForCompaign?.length
    ) {
      showToast('selectService', 'selectServiceDes');
      return;
    }

    const hasServicesOnly =
      filteredServices?.length > 0 &&
      filteredProducts?.length === 0 &&
      filteredBogo?.length === 0 &&
      filteredBundles?.length === 0 &&
      filterHappyHour?.length === 0 &&
      filterEarlyBird?.length === 0;

    const hasProductsAndServices =
      filteredProducts?.length > 0 &&
      filteredServices?.length > 0 &&
      filteredBundles?.length === 0 &&
      filteredBogo?.length === 0 &&
      filterHappyHour?.length === 0 &&
      filterEarlyBird?.length === 0;

    const hasBundlesOnly =
      filteredBundles?.length > 0 &&
      filteredProducts?.length === 0 &&
      filteredServices?.length === 0 &&
      filteredBogo?.length === 0 &&
      filterHappyHour?.length === 0 &&
      filterEarlyBird?.length === 0;

    const hasBogoOnly =
      filteredBogo?.length > 0 &&
      filteredProducts?.length === 0 &&
      filteredServices?.length === 0 &&
      filteredBundles?.length === 0 &&
      filterHappyHour?.length === 0 &&
      filterEarlyBird?.length === 0;

    const hasHappyHour =
      filterHappyHour?.length > 0 &&
      filteredProducts?.length === 0 &&
      filteredServices?.length === 0 &&
      filteredBundles?.length === 0 &&
      filteredBogo?.length === 0 &&
      filterEarlyBird?.length === 0;

    const hasEarlyBirdOnly =
      filterEarlyBird?.length > 0 &&
      filteredProducts?.length === 0 &&
      filteredServices?.length === 0 &&
      filteredBundles?.length === 0 &&
      filteredBogo?.length === 0 &&
      filterHappyHour?.length === 0;

    const isValidCase =
      hasServicesOnly ||
      hasProductsAndServices ||
      hasBundlesOnly ||
      hasBogoOnly ||
      hasHappyHour ||
      hasEarlyBirdOnly;

    console.log('isValidCase', isValidCase);

    if (!isValidCase) {
      Toast.show({
        type: 'error',
        position: 'top',
        text1: t('invalidCombination'),
        text2: t('invalidSelectionDes'),
        visibilityTime: 4000,
      });
      return;
    }

    // Additional check for HomeService
    if (activeRadio !== 'Inplace' && !isValidBookingRange()) {
      return;
    }

    // All checks passed - proceed
    dispatch(SetBranchId(branchId));
    dispatch(SetFareHomeService(activeRadio === 'Inplace' ? 0 : fare));
    await fetchAndNavigate();
  };
  const fetchAndNavigate = async () => {
    console.log('called');
    try {
      setLoading(true);
      if (
        filteredBundles?.length > 0 ||
        filteredBogo?.length > 0 ||
        filterHappyHour?.length > 0 ||
        filterEarlyBird?.length > 0
      ) {
        navigation.navigate('OverView');
        return;
      }
      const data = {
        services:
          filteredServices?.length > 0
            ? filteredServices?.map(data => data?._id)
            : [],
        branch: branchId,
        inventories:
          filteredProducts?.length > 0
            ? filteredProducts?.map(data => data?._id)
            : [],
      };

      const result = await postRequest(
        `${API_ENDPOINTS.product.suggested}`,
        data,
      );

      setLoading(false);
      if (result.success && result?.data?.data.length > 0) {
        navigation.navigate('SuggestedProducts', {
          services: filteredServices,
          filteredProducts,
        });
      } else {
        // If no products are returned, navigate to OverView
        navigation.navigate('OverView');
      }
    } catch (error) {
      setLoading(false);
      setErr(true);
      setErrMsg('An error occurred while fetching products.');
      console.error('Error fetching products:', error);
    }
  };

  const RadioButton = [
    {
      label: t('onSite'),
      value: 'Inplace',
      icon: require('../../../assets/icons/inPlace.png'),
    },
    {
      label: t('homeService'),
      value: 'HomeService',
      icon: require('../../../assets/icons/homeService.png'),
    },
  ];

  const routes = [
    {key: 'Featured', title: t('services')},
    {key: 'Products', title: t('products')},
    // {key: 'Subscriptions', title: t('mySubscriptions')},
    {key: 'bundle', title: t('bundle')},
    {key: 'rental', title: t('rental')},
    {key: 'professionals', title: t('professionals')},
    {key: 'about', title: t('about')},
  ];

  const handleRadioPress = value => {
    if (user?.isGuest) {
      setGuestPopUp(true);
      return;
    }

    if (filteredServices?.length === 0) {
      dispatch(SetActiveRadio(value));
      return;
    }

    if (value === 'HomeService') {
      if (user.address && user?.address) {
        setShowPopUp(true);
      } else {
        Toast.show({
          type: 'info',
          position: 'top',
          bottomOffset: 20,
          text1: t('error'),
          text2: t('homeservicewithoutAddress'),
          visibilityTime: 3000,
        });
        navigation.navigate('HomeAddress', {state: false});
      }
    } else {
      setShowPopUp(true);
    }
  };
  const handleYesPress = () => {
    const newValue = activeRadio === 'Inplace' ? 'HomeService' : 'Inplace';

    dispatch(SetActiveRadio(newValue));
    dispatch(SetSelectedProductEmpty({branchId: branchId}));
    dispatch(SetSelectedSubsciptionEmpty({branchId: branchId}));
    dispatch(SetSelectedServiceEmpty({branchId: branchId}));

    setShowPopUp(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchData(activeButton);
    }, [activeButton, activeRadio]),
  );

  const abortController = new AbortController();

  const fetchData = async buttonName => {
    if (loading) return; // Prevent duplicate requests

    setLoading(true);
    let result, endpoint;
    try {
      switch (buttonName) {
        case 'Featured':
          if (activeRadio === 'HomeService') {
            endpoint = `${API_ENDPOINTS.service.getAll}?pageno=${Page}&limit=${limit}&serviceType=homeservice&branch=${branchId}`;
          } else {
            endpoint = `${API_ENDPOINTS.service.getAll}?pageno=${Page}&limit=${limit}&branch=${branchId}&serviceType=inplace`;
          }
          break;
        case 'Products':
          endpoint = `${API_ENDPOINTS.product.getAll}?pageno=${Page}&limit=${limit}&branch=${branchId}`;
          break;
        case 'bundle':
          endpoint = `${API_ENDPOINTS.compaigns.getAll}?pageno=${Page}&limit=${limit}&branch=${branchId}&type=bundleDeal`;
          break;
        case 'rental':
          endpoint = `${API_ENDPOINTS.rental.getAll}?pageno=${Page}&limit=${limit}&branch=${branchId}`;
          break;
        default:
          break;
      }

      result = await getRequest(endpoint, {signal: abortController.signal}); // Pass the abort signal

      if (result.success) {
        if (buttonName === 'Featured') {
          setdata(result?.data?.data);
        } else if (buttonName === 'Products') {
          SetProducts(result?.data?.data);
        } else if (buttonName === 'bundle') {
          setdata(result?.data?.data);
        } else if (buttonName === 'rental') {
          setdata(result?.data?.data);
        }
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Fetch Error:', error);
      }
    } finally {
      setLoading(false);
      setActiveButton(buttonName);
    }
  };

  const fetchMoreData = async () => {
    if (Page < TotalPages && !loading) {
      setPage(Page + 1);
      setLoading(true);

      let result;
      let endpoint;
      const nextPage = Page + 1;

      try {
        switch (activeButton) {
          case 'Featured':
            if (activeRadio === 'HomeService') {
              endpoint = `${API_ENDPOINTS.service.getAll}?pageno=${nextPage}&limit=${limit}&serviceType=homeservice&branch=${branchId}`;
            } else {
              endpoint = `${API_ENDPOINTS.service.getAll}?pageno=${nextPage}&limit=${limit}&branch=${branchId}&serviceType=inplace`;
            }
            break;
          case 'Products':
            endpoint = `${API_ENDPOINTS.product.getAll}?pageno=${nextPage}&limit=${limit}&branch=${branchId}`;
            break;
          case 'bundle':
            endpoint = `${API_ENDPOINTS.compaigns.getAll}?pageno=${Page}&limit=${limit}&branch=${branchId}&type=bundleDeal`;

            break;
          case 'rental':
            endpoint = `${API_ENDPOINTS.rental.getAll}?pageno=${Page}&limit=${limit}&branch=${branchId}`;
            break;
          default:
            break;
        }

        result = await getRequest(endpoint);

        if (result.success) {
          if (activeButton === 'Featured') {
            setdata(prevData => [...prevData, ...result?.data?.data]);
          } else if (activeButton === 'Products') {
            SetProducts(prevProducts => [
              ...prevProducts,
              ...result?.data?.data,
            ]);
          } else if (activeButton === 'bundle') {
            setdata(prevData => [...prevData, ...result?.data?.data]);
          } else if (activeButton === 'rental') {
            setdata(prevData => [...prevData, ...result?.data?.data]);
          }
          // Update total pages if available

          setTotalPages(result?.data?.totalPages);
        }
      } catch (error) {
        console.error('Fetch Error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const renderScene = ({route}) => {
    switch (route.key) {
      case 'Featured':
        return (
          <View style={{flex: 1}}>
            {loading ? (
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 20,
                }}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <>
                <Card
                  data={data}
                  activeButton={route.key}
                  selecteddata={selectServies}
                  fetchMoreData={fetchMoreData}
                  activeRadio={activeRadio}
                />
                <TouchableOpacity
                  style={[
                    commonStyles.btnContainer,
                    {
                      marginTop: 20,
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: 0,
                    },
                  ]}
                  onPress={handleContinue}>
                  <Text allowFontScaling={false} style={commonStyles.btnText}>
                    {t('continue')}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        );
      case 'Products':
        return (
          <View style={{flex: 1}}>
            {loading ? (
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 20,
                }}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <>
                <Card
                  data={products}
                  activeButton={route.key}
                  selecteddata={SelectedProducts}
                  fetchMoreData={fetchMoreData}
                />
                <TouchableOpacity
                  style={[
                    commonStyles.btnContainer,
                    {
                      marginTop: 20,
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: 0,
                    },
                  ]}
                  onPress={handleContinue}>
                  <Text allowFontScaling={false} style={commonStyles.btnText}>
                    {t('continue')}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        );

      case 'bundle':
        return (
          <View style={{flex: 1}}>
            {loading ? (
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 20,
                }}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <>
                <Bundles data={data} fetchMoreData={fetchMoreData} />
                {data?.length > 0 && (
                  <TouchableOpacity
                    style={[
                      commonStyles.btnContainer,
                      {
                        marginTop: 20,
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                      },
                    ]}
                    onPress={handleContinue}>
                    <Text allowFontScaling={false} style={commonStyles.btnText}>
                      {t('continue')}
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        );
      case 'rental':
        return (
          <View style={{flex: 1}}>
            {loading ? (
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 20,
                }}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <>
                <Card
                  data={data}
                  activeButton={route.key}
                  selecteddata={selectListing}
                  fetchMoreData={fetchMoreData}
                  currency={businessdata?.currency?.code}
                />
                <TouchableOpacity
                  style={[
                    commonStyles.btnContainer,
                    {
                      marginTop: 20,
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: 0,
                    },
                  ]}
                  onPress={handleContinue}>
                  <Text allowFontScaling={false} style={commonStyles.btnText}>
                    {t('continue')}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        );
      case 'professionals':
        return (
          <View style={{flex: 1}}>
            <ProfessionalList data={businessdata?.teamMembers} />
            <TouchableOpacity
              style={[
                commonStyles.btnContainer,
                {
                  marginTop: 20,
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                },
              ]}
              onPress={handleContinue}>
              <Text allowFontScaling={false} style={commonStyles.btnText}>
                {t('continue')}
              </Text>
            </TouchableOpacity>
          </View>
        );
      case 'about':
        return (
          <View style={{flex: 1}}>
            <BusinessInfo businessdata={businessdata} />
            <TouchableOpacity
              style={[
                commonStyles.btnContainer,
                {
                  marginTop: 20,
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                },
              ]}
              onPress={handleContinue}>
              <Text allowFontScaling={false} style={commonStyles.btnText}>
                {t('continue')}
              </Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return (
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text>No Data</Text>
          </View>
        );
    }
  };

  return (
    <View style={{flex: 1, height: 450}}>
      {activeButton === 'Featured' && (
        <>
          <View style={[styles.button_container, {marginVertical: 10}]}>
            {RadioButton.map(({label, value, icon}) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.placeItem,
                  activeRadio === value
                    ? styles.selectedPlaceItem
                    : styles.unselectedPlaceItem,
                ]}
                onPress={() => handleRadioPress(value)}>
                <Image
                  source={icon}
                  style={[
                    styles.placeIcon,
                    activeRadio === value
                      ? styles.SelectedplaceIcon
                      : styles.placeIcon,
                  ]}
                />
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.placeText,
                    activeRadio === value
                      ? styles.selectedText
                      : colors.unselectedText,
                  ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {guestPopUp && (
        <GuestModal showPopUp={guestPopUp} setShowPopUp={setGuestPopUp} />
      )}
      <TabView
        navigationState={{index, routes}}
        renderScene={renderScene}
        onIndexChange={i => {
          setIndex(i);
          const selected = routes[i].key;
          handleButtonPress(selected, i);
        }}
        initialLayout={{width: layout.width}}
        renderTabBar={props => (
          <TabBar
            {...props}
            scrollEnabled
            indicatorStyle={{backgroundColor: colors.primary, height: 3}}
            style={{backgroundColor: 'white'}}
            renderLabel={({route, focused}) => (
              <Text
                allowFontScaling={false}
                style={{
                  color: focused ? colors.primary : colors.lightBlack,
                  fontFamily: focused ? fonts.bold : fonts.regular,
                  fontSize: 14,
                  paddingHorizontal: 5,
                }}>
                {route.title}
              </Text>
            )}
          />
        )}
        style={{flex: 1}}
      />

      {showPopUp && (
        <GeneralModal
          modalSuccess={showPopUp}
          Set_Modal_Visibilty={setShowPopUp}
          imageSource={<Image source={Alert} width={38} height={38} />}
          title={t('alert')}
          description={t('homeServiceAlert')}
          yesBtnTitle={
            activeRadio === 'Inplace'
              ? t('homeServiceText')
              : t('inplaceServiceText')
          }
          handleYesPress={handleYesPress}
          noBtnTitle={t('cancel')}
          handleNoPress={() => setShowPopUp(false)}
        />
      )}
    </View>
  );
};

export default HomeDetail;

const styles = StyleSheet.create({
  button_container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  button: {
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  activeButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    fontSize: 15,
    fontFamily: fonts.medium,
    color: colors.background,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  radioButtonTitle: {
    fontSize: 14,
    fontFamily: fonts.medium,

    marginTop: 2,
  },
  activeRadioButtonTitle: {
    color: colors.primary,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  waitingOpacitiesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderBottomColor: colors.borderGrey,
    borderBottomWidth: 1,
    flex: 1,
    gap: 30,
  },

  selectedBookingText: {
    fontFamily: fonts.bold,
    color: colors.primary,
    fontSize: 14,
    borderBottomWidth: 3,
    borderBottomColor: colors.primary,
  },
  nonSelectedBookingText: {
    fontFamily: fonts.regular,
    color: colors.lightBlack,
    fontSize: 13,
  },
  WaitingList: {
    paddingBottom: 20,
  },
  noWaitingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  noDataImg: {
    height: 150,
    width: 200,
    resizeMode: 'contain',
  },
  noDataText: {
    fontFamily: fonts.regular,
    color: colors.black,
    fontSize: 14,
    lineHeight: 24,
  },
  placeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 20,
  },
  selectedPlaceItem: {
    backgroundColor: colors.primary,
  },
  unselectedPlaceItem: {
    borderWidth: 1,
    borderColor: '#F0EAFF',
    backgroundColor: 'transparent',
  },
  placeIcon: {
    width: 28,
    height: 28,
    resizeMode: 'cover',
    tintColor: colors.black,
  },
  SelectedplaceIcon: {
    width: 28,
    height: 28,
    resizeMode: 'cover',
    tintColor: colors.background,
  },

  placeText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.black,
  },
  selectedText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.background,
  },
  unselectedText: {
    color: colors.black,
  },
});
