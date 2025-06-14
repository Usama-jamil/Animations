import {
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ActivityIndicator} from 'react-native';
import Toast from 'react-native-toast-message';
import CustomHeader from '../../components/header/CustomHeader';
import {API_ENDPOINTS, postRequest} from '../../utils/apiService';
import GeneralModal from '../../components/modal/GeneralModal';
import {colors, commonStyles, fonts, fontSizes} from '../../utils/styles';
import usePaymentSheet from '../../components/payment-sheet/PaymentSheet';
import { useFocusEffect } from '@react-navigation/native';
const Payment = ({navigation, route}) => {
  const {t} = useTranslation();
  const bookingId = route?.params?.bookingId;
  const tip = route?.params?.tip;
  const currencyCode = route?.params?.currencyCode;
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const {initializePaymentSheet, openPaymentSheet,isLoading:paymentloading } = usePaymentSheet();

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        await initializePaymentSheet();
      })();
    }, []),
  );

  const addCard = async paymentId => {
    setIsLoading(true);
    const payload = {
      bookingId,
      tip,
      paymentId,
    };
    const result = await postRequest(API_ENDPOINTS.tip.addTip, payload);
    if (result?.success) {
      setIsLoading(false);
      Toast.show({
        type: 'success',
        position: 'top',
        bottomOffset: 20,
        text1: t('success'),
        text2: t('Tipsentsuccessfully'),
        visibilityTime: 3000,
      });
      navigation.goBack();
    } else {
      setIsLoading(false);
      setErr(true);
      setErrMsg(result.error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title={t('Payment')} />

      {err && (
        <GeneralModal
          modalError={true}
          description={errMsg}
          Set_Modal_Visibilty={setErr}
        />
      )}
      {isLoading || paymentloading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.purple} />
        </View>
      ) : (
        <ScrollView
          style={{marginHorizontal: 20}}
          showsVerticalScrollIndicator={false}>
             <Text allowFontScaling={false} style={styles.Cardprice}>
            {tip}
            <Text allowFontScaling={false} style={styles.Cardcurrency}>
              {' '}
              {currencyCode}{' '}
            </Text>{' '}
          </Text>

          <TouchableOpacity
            style={[styles.continueButton, commonStyles.btnContainer]}
            onPress={async () => {
              const paymentId = await openPaymentSheet(); // ✅ Wait for Payment ID
              if (paymentId) {
                addCard(paymentId); // ✅ Send Payment ID to handlePayNow
              }
            }}>


            <Text allowFontScaling={false} style={commonStyles.btnText}>
              {t('payNow')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default Payment;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
 Cardprice: {
     fontSize: fontSizes.large,
     fontFamily: fonts.semiBold,
     color: colors.primary,
     textAlign: 'center',
     marginTop: 20,
   },
   Cardcurrency: {
     fontSize: fontSizes.xMedium,
     fontFamily: fonts.medium,
     color: colors.primary,
   },
  continueButton: {
    marginTop: 20,
    marginBottom: 20,
  },


  errorLabel: {
    fontFamily: fonts.bold,
    fontSize: 15,
    lineHeight: 19,
    color: colors.errorRed,
    marginBottom: 15,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    fontFamily: fonts.medium,
    marginTop: 5,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
