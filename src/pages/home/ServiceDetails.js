import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import CustomHeader from '../../components/header/CustomHeader';
import ServiceDetail from '../../components/service-details/ServiceDetails';

import ActivityIndicatorModal from '../../components/modal/ActivityIndicatorModal';
import { API_ENDPOINTS } from '../../utils/apiService';
import GeneralModal from '../../components/modal/GeneralModal';
import { useFocusEffect } from '@react-navigation/native';
import { getRequest } from '../../utils/apiService';
import { useSelector } from 'react-redux';
import { ActivityIndicator } from 'react-native';
import { colors } from '../../utils/styles';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const ServiceDetails = ({ route, navigation }) => {
  const id = route?.params?.id;
  const selectedCompaign = route?.params?.selectedCompaign;
  const complete = route?.params?.complete;
  const booking = route?.params?.bookingid;
  const activeRadio = route?.params?.activeRadio;


  console.log('bookingid', booking);

  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [SingleServices, SetSingleServices] = useState({});

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [id]),
  );

  const fetchData = async () => {
    setIsLoading(true);
    const result = await getRequest(`${API_ENDPOINTS.service.getSingle}/${id}`);
    setIsLoading(false);
    if (result.success) {
      SetSingleServices(result.data);
    } else {
      setErr(true);
      setErrMsg(result.error);
    }
    console.log('result',result)
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

      <CustomHeader title={SingleServices?.title} />

      {isLoading ? (
        <View
          style={{
            justifyContent: 'flex-start',
            alignItems: 'center',
            marginTop: 20,
            flex: 1
          }}>
          <ActivityIndicator size={'large'} color={colors.primary} />
        </View>
      ) : (
    <KeyboardAwareScrollView
                contentContainerStyle={{flex: 1}}
                enableAutomaticScroll
                extraScrollHeight={20}>
          <ServiceDetail
            data={SingleServices}
            compaign={selectedCompaign}
            complete={complete}
            setIsLoading={setIsLoading}
            setErr={setErr}
            setErrMsg={setErrMsg}
            bookingid={booking}
            activeRadio={activeRadio}
          />
        </KeyboardAwareScrollView>
      )}
    </SafeAreaView>
  );
};

export default ServiceDetails;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
