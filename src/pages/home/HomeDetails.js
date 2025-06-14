import React, {useEffect, useState, useCallback} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  BackHandler,
  Image,
} from 'react-native';
import moment from 'moment';
// Import Components
import HomeDetailCover from '../../components/home-details/HomeDetailCover';
import HomeDetail from '../../components/home-details/HomeDetail';
import Alert from '../../../assets/icons/info.png';
// Assets
import Star from '../../../assets/icons/light_star.svg';
import Location from '../../../assets/icons/location-pin.svg';
import Clock from '../../../assets/icons/clock_Black.svg';
// Styles
import {colors, fonts} from '../../utils/styles';
import {useTranslation} from 'react-i18next';
const screenWidth = Dimensions.get('window').width;
const isSmallScreen = screenWidth < 400;
import ActivityIndicatorModal from '../../components/modal/ActivityIndicatorModal';
import GeneralModal from '../../components/modal/GeneralModal';
import {useFocusEffect} from '@react-navigation/native';
import {API_ENDPOINTS, postRequest} from '../../utils/apiService';
import {
  SetCurrencyCode,
  SetSelectedProductEmpty,
  SetSelectedServiceEmpty,
  SetSelectedSubsciptionEmpty,
} from '../../store/slices/cart';
import {getRequest} from '../../utils/apiService';
import Compaign from '../../components/home-details/Compaign';
import {useDispatch, useSelector} from 'react-redux';
import Discover from '../../components/home-details/Discover';

const HomeDetails = ({route, navigation}) => {
  const {t} = useTranslation();
  const id = route?.params?.id || '67ff9ac1a65b2c01fab21039';
  const bookingFor = route?.params?.bookingFor || 'inplace';
  const [SingleBusiness, SetSingleBusiness] = useState({});
  const [businessloading, setBusinessloading] = useState(false);

  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [isOpenToday, setIsOpenToday] = useState(false);
  const [Likeloading, setLikeloading] = useState(false);
  const [compaignsData, SetCompaignData] = useState([]);
  const [activeButton, setActiveButton] = useState('Featured');
  const [showPopUp, setShowPopUp] = useState(false);

  const dispatch = useDispatch();
  const {selectServies, activeRadio, SelectedProducts, selectSubscription} =
    useSelector(state => state.cart);
  const filteredServices = selectServies.filter(
    service => service.branch === id,
  );
  const filteredProducts = SelectedProducts.filter(
    product => product.branch === id,
  );

  const filteredSubscription = selectSubscription.filter(
    subscription => subscription.branch === id,
  );

  useFocusEffect(
    useCallback(() => {
      fetchData();
      fetchCompaignData();
    }, [id]),
  );

  const fetchData = async () => {
    setBusinessloading(true);
    const result = await getRequest(
      `${API_ENDPOINTS.business.getSingle}/${id}`,
    );
    setBusinessloading(false);
    if (result.success) {
      SetSingleBusiness(result?.data);
      if (SingleBusiness) {
        Vistor();
      }
    } else {
      setErr(true);
      setErrMsg(result.error);
    }
  };

  const fetchCompaignData = async () => {
    setBusinessloading(true);
    // Determine the serviceType based on activeRadio
    const serviceType =
      activeRadio === 'HomeService' ? 'homeservice' : 'inplace';

    try {
      const result = await getRequest(
        `${API_ENDPOINTS.compaigns.getAll}?branch=${id}&serviceType=${
          serviceType || 'inplace'
        }&typeOnly=true`,
      );
      setBusinessloading(false);

      if (result.success) {
        SetCompaignData(result?.data?.data);
      } else {
        console.error('Error in fetching campaign:', result.error);
        setErr(true);
        setErrMsg(result.error);
      }
    } catch (error) {
      setBusinessloading(false);
      console.error('Unexpected error:', error);
      setErr(true);
      setErrMsg('An unexpected error occurred');
    }
  };

  const Vistor = async () => {
    const data = {
      branch: id,
    };
    const result = await postRequest(`${API_ENDPOINTS.visitor.visit}`, data);
    if (result.success) {
    } else {
      setErr(true);
      setErrMsg(result.error);
      console.log('error in vistor', result.error);
    }
  };

  useEffect(() => {
    if (SingleBusiness && SingleBusiness.openingHours) {
      const currentDay = moment().format('dddd');
      const todayHours = SingleBusiness?.openingHours?.find(
        data => data.day === currentDay,
      );
      setIsOpenToday(todayHours ? true : false);
      dispatch(SetCurrencyCode(SingleBusiness?.currency?.code));
    }
  }, [SingleBusiness]);

  useEffect(() => {
    if (activeRadio) {
      fetchCompaignData();
    }
  }, [activeRadio]);

  const handleYesPress = () => {
    dispatch(SetSelectedProductEmpty({branchId: id}));
    dispatch(SetSelectedSubsciptionEmpty({branchId: id}));
    dispatch(SetSelectedServiceEmpty({branchId: id}));
    setShowPopUp(false);
    navigation.goBack();
  };

  const handleNoPress = () => {
    setShowPopUp(false);
  };

  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        if (
          filteredServices.length > 0 ||
          filteredProducts.length > 0 ||
          filteredSubscription.length > 0
        ) {
          setShowPopUp(true);
          return true;
        } else {
          navigation.goBack();
          return true; // Return true to prevent default back action
        }
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
      );

      return () => backHandler.remove();
    }, [filteredServices, navigation]),
  );
  const handleBackPress = useCallback(() => {
    if (filteredServices.length > 0) {
      setShowPopUp(true);
    } else {
      setShowPopUp(false);
      navigation.goBack();
    }
  }, [filteredServices, navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {err && (
        <GeneralModal
          modalError={true}
          description={errMsg}
          Set_Modal_Visibilty={setErr}
        />
      )}
      {(businessloading || Likeloading) && (
        <ActivityIndicatorModal
          loaderIndicator={businessloading || Likeloading}
        />
      )}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{backgroundColor: 'blue'}}>
        <HomeDetailCover
          image={SingleBusiness?.image}
          id={SingleBusiness?._id}
          setloading={setLikeloading}
          activeButton={activeButton}
          likes={SingleBusiness?.likes}
          fetchData={fetchData}
          branchId={id}
          onBackPress={handleBackPress}
        />

        <View style={styles.body}>
          <View style={styles.headerBody}>
            <View style={styles.review}>
              <Star width={18} height={18} />
              <Text allowFontScaling={false} style={styles.reviewTitle}>
                {SingleBusiness?.averageRating?.toFixed(1)} (
                {SingleBusiness?.totalReviews})
              </Text>
            </View>
            <Text allowFontScaling={false} style={styles.headerRightText}>
              {isOpenToday ? t('openToday') : t('closedToday')}
            </Text>
          </View>
          <Text allowFontScaling={false} style={styles.serviceTitle}>
            {SingleBusiness?.name}
          </Text>
          <View style={styles.Location_view}>
            <View>
              <Location width={24} height={24} />
            </View>
            <View style={{flex: 1, alignSelf: 'flex-start'}}>
              <Text
                allowFontScaling={false}
                style={styles.ServiceSubTitle}
                numberOfLines={2}>
                {SingleBusiness?.address?.line1}
              </Text>
            </View>
          </View>
          <View style={styles.Location_view}>
            <View>
              <Clock width={24} height={24} />
            </View>
            <View style={{flex: 1, alignSelf: 'flex-start'}}>
              <Text
                allowFontScaling={false}
                style={styles.ServiceSubTitle}
                numberOfLines={2}>
                Mon - Sun | 09 AM - 12 AM
              </Text>
            </View>
          </View>
          {compaignsData && <Compaign data={compaignsData} branchId={id} />}
          <Discover businessdata={SingleBusiness} id={SingleBusiness?._id} />
          <HomeDetail
            branchId={id}
            activeButton={activeButton}
            setActiveButton={setActiveButton}
            bookingFor={bookingFor}
            businessdata={SingleBusiness}
            activeRadio={activeRadio}
            setErr={setErr}
            setErrMsg={setErrMsg}
          />
        </View>
      </ScrollView>

      {showPopUp && (
        <GeneralModal
          modalSuccess={showPopUp}
          Set_Modal_Visibilty={setShowPopUp}
          imageSource={<Image source={Alert} width={38} height={38} />}
          title={t('alert')}
          description={t('backnavigationAlert')}
          yesBtnTitle={t('yes')}
          handleYesPress={handleYesPress}
          noBtnTitle={t('no')}
          handleNoPress={handleNoPress}
        />
      )}
    </SafeAreaView>
  );
};

export default HomeDetails;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  body: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    flex: 1,
    marginTop: -15,
    padding: isSmallScreen ? 16 : 20,
  },
  headerBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  review: {
    borderRadius: 22,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: -62,
  },
  reviewTitle: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.background,
    marginTop: 3,
  },
  headerRightText: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.green,
  },
  serviceTitle: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: colors.black,
  },
  ServiceSubTitle: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.black,
  },
  Location_view: {
    flexDirection: 'row',
    alignItems: 'center', // Ensures top alignment
    gap: 5,
    marginTop: 5,
  },
});
