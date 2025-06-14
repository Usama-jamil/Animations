import {SafeAreaView, StyleSheet, View} from 'react-native';
import React, {useState, useEffect} from 'react';
import CustomHeader from '../../components/header/CustomHeader';
import {API_ENDPOINTS} from '../../utils/apiService';
import GeneralModal from '../../components/modal/GeneralModal';
import {useFocusEffect} from '@react-navigation/native';
import {getRequest} from '../../utils/apiService';
import {ActivityIndicator} from 'react-native';
import {colors} from '../../utils/styles';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import BookingModal from '../../components/rental-modal/RentalModal';
import ListingDetails from '../../components/listing-Detail/ListingDetail';

const ListingDetail = ({route, navigation}) => {
  const id = route?.params?.id || '682eb7cc68d7df35c0d4c782';
  const booking = route?.params?.bookingid;
  const activeRadio = route?.params?.activeRadio;

  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [SingleServices, SetSingleServices] = useState({});
  const [showBookingPopUp, setShowBookingPopUp] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [id]),
  );

  const fetchData = async () => {
    setIsLoading(true);
    const result = await getRequest(`${API_ENDPOINTS.rental.getSingle}/${id}`);
    setIsLoading(false);
    if (result.success) {
      SetSingleServices(result.data);
    } else {
      setErr(true);
      setErrMsg(result.error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {err && (
        <GeneralModal
          modalError={true}
          description={errMsg}
          Set_Modal_Visibilty={setErr}
        />
      )}

      <CustomHeader title={SingleServices?.name} />
      {showBookingPopUp && (
        <BookingModal
          Set_Modal_Visibilty={setShowBookingPopUp}
          handleYesPress={() => {
            setShowBookingPopUp(false);
          }}
          handleNoPress={() => setShowBookingPopUp(false)}
          data={SingleServices}
          currency={SingleServices?.currency?.code}
        />
      )}

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
        <KeyboardAwareScrollView
          contentContainerStyle={{flex: 1}}
          enableAutomaticScroll
          extraScrollHeight={20}>
          <ListingDetails
            data={SingleServices}
            setIsLoading={setIsLoading}
            setErr={setErr}
            setErrMsg={setErrMsg}
            bookingid={booking}
            activeRadio={activeRadio}
            setShowBookingPopUp={setShowBookingPopUp}
          />
        </KeyboardAwareScrollView>
      )}
    </SafeAreaView>
  );
};

export default ListingDetail;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
