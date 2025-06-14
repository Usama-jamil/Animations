import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {colors} from '../../utils/styles';
import React, {useEffect, useRef, useState} from 'react';
import CustomHeader from '../../components/header/CustomHeader';
import {useTranslation} from 'react-i18next';
import {API_ENDPOINTS, getRequest} from '../../utils/apiService';
import GeneralModal from '../../components/modal/GeneralModal';
import ListingBookingDetails from '../../components/listing-Booking-Detail/ListingBookingDetails';

const ListingBookingDetail = ({route}) => {
  const {t} = useTranslation();
  const id = route?.params?.id;
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [booking, Setbooking] = useState({});
  const [Business, setBusiness] = useState({});

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setIsLoading(true);
    const bookingRequest = getRequest(
      `${API_ENDPOINTS.listingBookings.getSingle}${id}`,
    );
    const businessRequest = bookingRequest.then(result =>
      result.success
        ? getRequest(
            `${API_ENDPOINTS.business.getSingle}/${result.data.branch}`,
          )
        : Promise.reject(result.error),
    );
    const [bookingResult, businessResult] = await Promise.allSettled([
      bookingRequest,
      businessRequest,
    ]);
    setIsLoading(false);
    if (bookingResult.status === 'fulfilled') {
      Setbooking(bookingResult.value.data);
    } else {
      setErr(true);
      setErrMsg(bookingResult.reason);
    }
    if (businessResult?.status === 'fulfilled') {
      setBusiness(businessResult.value.data);
    } else if (businessResult?.status === 'rejected') {
      setErr(true);
      setErrMsg(businessResult.reason);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader title={t('details')} />
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
        <ScrollView
          contentContainerStyle={{flexGrow: 1, paddingBottom: 30}}
          showsVerticalScrollIndicator={false}>
          <ListingBookingDetails
            data={booking}
            business={Business}
            setIsLoading={setIsLoading}
            setErr={setErr}
            setErrMsg={setErrMsg}
          />
        
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default ListingBookingDetail;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
