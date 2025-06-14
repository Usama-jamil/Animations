import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useState} from 'react';
import CustomHeader from '../../components/header/CustomHeader';
import {colors, fonts} from '../../utils/styles';
import BookingDetailsComponent from '../../components/booking-details/BookingDetails';
import {API_ENDPOINTS, getRequest} from '../../utils/apiService';
import {useFocusEffect} from '@react-navigation/native';
import GeneralModal from '../../components/modal/GeneralModal';
import {useTranslation} from 'react-i18next';

const BookingDetail = ({route, navigation}) => {
  const {id} = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [booking, Setbooking] = useState({});
  const [SingleBusiness, SetSingleBusiness] = useState({});
  const {t} = useTranslation();
  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [id]),
  );

  const fetchData = async () => {
    setIsLoading(true);

    const bookingRequest = getRequest(`${API_ENDPOINTS.booking.single}${id}`);
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
      SetSingleBusiness(businessResult.value.data);
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
          contentContainerStyle={{paddingBottom: 30}}
          showsVerticalScrollIndicator={false}>
          <BookingDetailsComponent
            data={booking}
            businessdata={SingleBusiness}
            fetchData={fetchData}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default BookingDetail;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
