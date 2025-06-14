import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from 'react-native';
import React, {useMemo, useState} from 'react';
import CustomHeader from '../../components/header/CustomHeader';
import {useTranslation} from 'react-i18next';
import {colors, commonStyles, fonts, fontSizes} from '../../utils/styles';
import Images from '../../components/card-images/Images';
import Alert from '../../../assets/icons/info.png';
import GeneralModal from '../../components/modal/GeneralModal';
import CalenderCard from '../../components/select-time/CalenderCard';
import WaitingTimeCard from '../../components/select-time/WaitingTimeCard';
import {useDispatch, useSelector} from 'react-redux';
import {API_ENDPOINTS, postRequest} from '../../utils/apiService';
import {useFocusEffect} from '@react-navigation/native';
import {SetDate, SetWaitng} from '../../store/slices/cart';
import Toast from 'react-native-toast-message';
import {getRequest} from '../../utils/apiService';
import NoDataIcon from '../../../assets/icons/no_data.svg';

const SelectTime = ({navigation, route}) => {
  const {t} = useTranslation();
  const {selectedItems, single} = route.params;
  const {selectServies, branchid,  selectBundles,
    selectBogo,} = useSelector(
    state => state.cart,
  );
  const [availbilties, setAvailbilties] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [showPopUp, setShowPopUp] = useState(false);
  const [timeSlot, settimeSlot] = useState({});
  const [selectedTime, setSelectedTime] = useState(null);
  const dispatch = useDispatch();

  const [subscriptionData, setSubscriptionData] = useState([]);

   const filteredServices = useMemo(() => {
      return selectServies.filter(
        service =>
          service.branch === branchid &&
          (!service.compaigntype || service.compaigntype === '' || service.compaigntype === null),
      );
    }, [selectServies, branchid]);


      const filteredServicesForCompaign = useMemo(() => {
    return selectServies.filter(
      service => service.branch === branchid && service.compaigntype,
    );
  }, [selectServies, branchid]);

  
    const filteredBundles = useMemo(() => {
      return selectBundles.filter(bundle => bundle.branch === branchid);
    }, [selectBundles, branchid]);
  
    const filteredBogo = useMemo(() => {
      return selectBogo.filter(bogo => bogo.branch === branchid);
    }, [selectBogo, branchid]);
  
  
    const bogoServiceIds = useMemo(() => {
      return filteredBogo.flatMap(bogo => [
        ...bogo.services.map(service => service._id),
        ...bogo.freeServices.map(service => service._id),
      ]);
    }, [filteredBogo]);
  
    const bundleServiceIds = useMemo(() => {
      return filteredBundles.flatMap(bundle =>
        bundle.services.map(service => service._id),
      );
    }, [filteredBundles]);
  
   

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [selectedItems]),
  );

  useFocusEffect(
    React.useCallback(() => {
      fetchBusinessSubscription();
    }, []),
  );

  console.log('select item', selectedItems);

  const fetchData = async () => {
    setIsLoading(true);

  const allServiceIds = [
    ...filteredServices.map(service => service._id),
    ...bogoServiceIds,
    ...bundleServiceIds,
    ...filteredServicesForCompaign?.flatMap(campaign => campaign.services.map(service => service._id)) || [],

  ];
   
    const ServicesforSingleProfess = selectedItems.flatMap(
      item =>
        allServiceIds.length > 0
          ? allServiceIds.map(serviceId => ({
              professional: item._id,
              service: serviceId, // Include service if available
            }))
          : [{professional: item._id}], // If no service, just send professional
    );

    // For multiple professionals, send only professional if no service is selected
    const servicesForMultipleProfession = selectedItems.map((item, index) => {
      const service = filteredServices[index];
      if (service?._id) {
        return {
          professional: item._id,
          service: service._id, // Include service if it exists
        };
      } else {
        return {
          professional: item._id, // Only send professional if no service
        };
      }
    });

    console.log('singl profesion',ServicesforSingleProfess)

    // Determine the payload based on whether services exist or not
    const data = {
      services: single
        ? ServicesforSingleProfess
        : servicesForMultipleProfession,
      branch: branchid,
    };

    // Log final payload to verify
    console.log(data);

    const result = await postRequest(
      API_ENDPOINTS.teamMembers.teamAvaliability,
      data,
    );

    setIsLoading(false);
    if (result.success) {
      setAvailbilties(result?.data);
    } else {
      setErr(true);
      setErrMsg(result.error);
    }
  };

  const fetchBusinessSubscription = async () => {
    setIsLoading(true);
    const result = await getRequest(
      `${API_ENDPOINTS.subscriptionBusiness.getAll}?branch=${branchid}`,
    );
    console.log('result subscription', result);
    setIsLoading(false);
    if (result.success) {
      setSubscriptionData(result?.data);
    } else {
    }
  };

  const handleBtnNoPress = () => {
    setShowPopUp(false);
  };
  const handlePress = () => {
    setShowPopUp(!showPopUp);
  };

  const next = () => {
    if (subscriptionData?.[0]?.plan?.type === 'free') {
      Toast.show({
        type: 'info',
        position: 'top',
        text1: 'Info',
        text2: 'Free plan Business cannot proceed to  booking',
        visibilityTime: 3000,
      });
      return;
    }

    dispatch(SetDate(timeSlot));
    navigation.navigate('ReviewConfirm', {data: [], price: ''});
    dispatch(SetWaitng(false));
  };

  const handleBookingWaiting = () => {
    if (subscriptionData?.[0]?.plan?.type === 'free') {
      Toast.show({
        type: 'info',
        position: 'top',
        text1: 'Info',
        text2: 'Free plan Business cannot proceed to  booking',
        visibilityTime: 3000,
      });
      return;
    }
    dispatch(SetWaitng(true));
    dispatch(SetDate(timeSlot));
    setShowPopUp(false);
    navigation.navigate('ReviewConfirm', {data: [], price: ''});
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader title={t('selectTime')} />

      {err && (
        <GeneralModal
          modalError={true}
          description={errMsg}
          Set_Modal_Visibilty={setErr}
        />
      )}
      {isLoading ? (
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 20,
          }}>
          <ActivityIndicator size={'large'} color={colors.primary} />
        </View>
      ) : (
        <>
          <ScrollView
            style={{marginHorizontal: 10, marginBottom: 60}}
            showsVerticalScrollIndicator={false}>
            <Text allowFontScaling={false} style={styles.title}>
              {t('professionals')}
            </Text>

            <Images data={selectedItems} />
            <CalenderCard
              data={availbilties}
              selected={timeSlot}
              setSelected={settimeSlot}
              setSelectedTime={setSelectedTime}
            />

            {timeSlot?.slots?.length === 0 ? (
              <View style={styles.noSubscriptionsContainer}>
                <NoDataIcon width={300} height={250} />
                <Text
                  allowFontScaling={false}
                  style={[styles.noText, {marginTop: 0}]}>
                  {t('noTimeSlot')}
                </Text>
              </View>
            ) : (
              <WaitingTimeCard
                data={timeSlot?.slots}
                selectedTime={selectedTime}
                setSelectedTime={setSelectedTime}
              />
            )}
          </ScrollView>

          {timeSlot?.slots?.length === 0 && (
            <TouchableOpacity
              style={[
                [
                  commonStyles.btnOutlineContainer,
                  {
                    marginHorizontal: 10,
                    position: 'absolute',
                    bottom: 80,
                    width: '90%',
                    zIndex: 9999,
                  },
                ],
              ]}
              onPress={handlePress}>
              <Text
                allowFontScaling={false}
                style={commonStyles.btnOutlineText}>
                {t('bookonWaitingList')}
              </Text>
            </TouchableOpacity>
          )}

          {timeSlot.slots?.length > 0 && selectedTime && (
            <TouchableOpacity
              style={[styles.continueButton, commonStyles.btnContainer]}
              onPress={next}>
              <Text allowFontScaling={false} style={commonStyles.btnText}>
                {t('continue')}
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}
      {showPopUp && (
        <GeneralModal
          modalSuccess={showPopUp}
          Set_Modal_Visibilty={setShowPopUp}
          imageSource={<Image source={Alert} width={38} height={38} />}
          title={t('alert')}
          description={t('selectTimeDes')}
          yesBtnTitle={t('bookonWaitingList')}
          handleYesPress={handleBookingWaiting}
          noBtnTitle={t('cancel')}
          handleNoPress={handleBtnNoPress}
        />
      )}
    </SafeAreaView>
  );
};

export default SelectTime;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  title: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.semiBold,
    color: colors.black,
  },
  continueButton: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
  },
  noText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: fontSizes.medium,
    fontFamily: fonts.regular,
    color: colors.black,
  },
  noSubscriptionsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
});
