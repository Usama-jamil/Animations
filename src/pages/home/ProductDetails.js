import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import CustomHeader from '../../components/header/CustomHeader';
import ProductDetail from '../../components/product-details/ProductDetails';
import {useTranslation} from 'react-i18next';
import {GetProductsById} from '../../store/slices/product';
import {useDispatch, useSelector} from 'react-redux';
import ActivityIndicatorModal from '../../components/modal/ActivityIndicatorModal';
import GeneralModal from '../../components/modal/GeneralModal';
import {API_ENDPOINTS} from '../../utils/apiService';
import {useFocusEffect} from '@react-navigation/native';
import {getRequest} from '../../utils/apiService';
import {colors} from '../../utils/styles';

const ProductDetails = ({route}) => {
  const {t} = useTranslation();
  const id = route.params?.id;
  const complete = route?.params?.complete;
  const bookingid = route?.params?.bookingid;
  const freeSample = route?.params?.freeSample;

  console.log('id', freeSample);

  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [SingleProduct, SetSingleProduct] = useState({});

  const {SelectedProducts} = useSelector(state => state.cart);
  const selectedVariantIds = SelectedProducts.find(
    product => product.inventory === id,
  );

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [id]),
  );

  const fetchData = async () => {
    setIsLoading(true);
    const result = await getRequest(`${API_ENDPOINTS.product.getSingle}/${id}`);
    console.log('result', result);
    setIsLoading(false);
    if (result.success) {
      SetSingleProduct(result?.data);
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
      <CustomHeader title={t('details')} />

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
        <ProductDetail
          data={SingleProduct}
          selected={selectedVariantIds}
          complete={complete}
          setIsLoading={setIsLoading}
          setErr={setErr}
          setErrMsg={setErrMsg}
          bookingid={bookingid}
          freeSample={freeSample}
        />
      )}
    </SafeAreaView>
  );
};

export default ProductDetails;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
