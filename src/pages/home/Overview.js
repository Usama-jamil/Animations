import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import CustomHeader from '../../components/header/CustomHeader';
import {colors} from '../../utils/styles';
import OverView from '../../components/overview/OverView';
import {useTranslation} from 'react-i18next';
import {useIsFocused} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import GeneralModal from '../../components/modal/GeneralModal';
import {useBookingOverViewCalculation} from '../../components/overview/useBookingOverView';
import {API_ENDPOINTS, getRequest} from '../../utils/apiService';

const Overview = ({navigation}) => {
  const {t} = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [data, setData] = useState(null);
  const isFocused = useIsFocused();
  const [firstCompaignId, setFirstCompaignId] = useState(null); // Changed to store just the ID
  const [hasItems, setHasItems] = useState(false);
  const apiCallMade = useRef(false);
  const {
    selectServies,
    SelectedProducts,
    branchid,
    currencyCode,
    fare,
    activeRadio,
    selectBundles,
    selectBogo,
  } = useSelector(state => state.cart);

  console.log('filteredServicesForCompaign', filteredServicesForCompaign);

  // Use the custom hook
  const {
    fetchCalculation,
    filteredProducts,
    filteredServices,
    filteredBundles,
    filteredBogo,
    filteredServicesForCompaign,
  } = useBookingOverViewCalculation({
    selectServies,
    SelectedProducts,
    branchid,
    activeRadio,
    fare,
    selectBundles,
    selectBogo,
    firstcomapignid: firstCompaignId, // Pass the ID directly
  });

  useEffect(() => {
    const fetchCampaignData = async () => {
      try {
        const result = await getRequest(
          `${API_ENDPOINTS.compaigns.getAll}?branch=${branchid}`,
        );

        if (result.success) {
          const firstPurchaseCampaign = result?.data?.data?.find(
            campaign => campaign?.type === 'firstPurchase',
          );
          // Store just the ID or null if not found
          setFirstCompaignId(firstPurchaseCampaign?._id || null);
        } else {
          console.error('Error fetching campaigns:', result.error);
          setFirstCompaignId(null);
        }
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        setFirstCompaignId(null);
      }
    };

    fetchCampaignData();
  }, [branchid]);

  console.log('firstCompaignId', firstCompaignId);

  useEffect(() => {
    const calculate = async () => {
      setIsLoading(true); // Start loading before the calculation

      try {
        const result = await fetchCalculation();
        if (result.success) {
          setIsLoading(false);
          setData(result?.data);
        } else {
          setIsLoading(false);
          setErr(true);
          setErrMsg(result.error);
        }
      } catch (error) {
        setIsLoading(false);
        setErr(true);
        setErrMsg(error.message || 'An error occurred');
      }
    };

    calculate(); // Execute the calculation logic
  }, [fetchCalculation, firstCompaignId]);

  useEffect(() => {
    if (
      isFocused &&
      filteredProducts.length === 0 &&
      filteredServices.length === 0 &&
      filteredBogo.length === 0 &&
      filteredBundles?.length === 0 &&
      filteredServicesForCompaign?.length === 0
    ) {
      navigation.navigate('HomeDetails', {
        id: branchid,
        bookingFor: activeRadio === 'HomeService' ? 'homeservice' : 'inplace',
      });
    }
  }, [
    filteredProducts,
    filteredServices,
    filteredBogo,
    filteredBundles,
    navigation,
    isFocused,
    branchid,
    activeRadio,
    filteredServicesForCompaign,
  ]);

  useEffect(() => {
    setHasItems(
      filteredProducts?.length > 0 ||
        filteredServices?.length > 0 ||
        filteredBogo?.length > 0 ||
        filteredBundles?.length > 0 ||
        filteredServicesForCompaign?.length > 0,
    );
  }, [
    filteredProducts,
    filteredServices,
    filteredBogo,
    filteredBundles,
    filteredServicesForCompaign,
  ]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader title={t('overView')} />
      {err && (
        <GeneralModal
          modalError={true}
          description={errMsg}
          Set_Modal_Visibilty={setErr}
        />
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size={'large'} color={colors.primary} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <OverView
            data={data}
            currencyCode={currencyCode}
            hasItems={hasItems}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default Overview;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
});
