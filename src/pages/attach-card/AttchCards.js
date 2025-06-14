import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import React, {useState} from 'react';
import CustomHeader from '../../components/header/CustomHeader';
import {useTranslation} from 'react-i18next';
import {colors, commonStyles, fontSizes} from '../../utils/styles';
import GeneralModal from '../../components/modal/GeneralModal';
import {fonts} from '../../utils/styles';
import Checkmark from '../../../assets/icons/checkmark-badge.svg';
import {CardField, createPaymentMethod} from '@stripe/stripe-react-native';
import {ActivityIndicator} from 'react-native';
import {API_ENDPOINTS, postRequest} from '../../utils/apiService';
import Toast from 'react-native-toast-message';

const screenWidth = Dimensions.get('window').width;
const isSmallScreen = screenWidth < 400;

const AttachCards = ({navigation}) => {
  const {t} = useTranslation();
  const [cardDetails, setCardDetails] = useState(null);
  const [cardholderName, setCardholderName] = useState('');
  const [cardholderNameError, setCardholderNameError] = useState('');
  const [showPopUp, setShowPopUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentId, setPaymentId] = useState();
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  const addCard = async () => {
    setShowPopUp(false);

    setIsLoading(true);
    const payload = {
      paymentMethodId: paymentId,
    };

    const result = await postRequest(
      API_ENDPOINTS.cardManagement.payment,
      payload,
    );
    console.log('result', result);
    setIsLoading(false);

    if (result.success) {
      Toast.show({
        type: 'success',
        position: 'top',
        bottomOffset: 20,
        text1: t('success'),
      text2: t('cardcreateSuccessfully'),
        visibilityTime: 3000,
      });
      navigation.goBack();
    } else {
      setErr(true);
      setErrMsg(result.error);
    }
  };

  const handleAttachCard = async () => {
    let isValid = true;

    // Validate cardholder name
    if (!cardholderName) {
      setCardholderNameError(t('cardholdernameisrequired.'));
      isValid = false;
    } else {
      setCardholderNameError('');
    }

    // Validate card details
    if (!cardDetails?.complete) {
      setErr(true);
      setErrMsg(`Please enter complete card details`);
      isValid = false;
    } else if (cardDetails?.validNumber === 'Invalid') {
      setErr(true);
      setErrMsg(`Please enter a valid card number`);
      isValid = false;
    } else if (cardDetails?.validCVC === 'Invalid') {
      setErr(true);
      setErrMsg(`Please enter a valid CVC number`);
      isValid = false;
    } else if (cardDetails?.validExpiryDate === 'Invalid') {
      setErr(true);
      setErrMsg(`Please enter a valid card expiry date`);
      isValid = false;
    }

    // Prevent further execution if validation fails
    if (!isValid) {
      return;
    }

    const {paymentMethod, error} = await createPaymentMethod({
      paymentMethodType: 'Card',
      card: cardDetails,
    });

    if (error) {
        setErr(true);
        setErrMsg(error?.localizedMessage);
    } else {
      setPaymentId(paymentMethod?.id);
      setShowPopUp(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title={t('attachCard')} />

      {err && (
        <GeneralModal
          modalError={true}
          description={errMsg}
          Set_Modal_Visibilty={setErr}
        />
      )}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          style={{marginHorizontal: 10}}
          showsVerticalScrollIndicator={false}>
          <Text
            allowFontScaling={false}
            style={[styles.inputHeading, {marginTop: 20}]}>
            {t('cardname')}
          </Text>
          <View style={styles.textInputContainer}>
            <TextInput
              allowFontScaling={false}
              style={[
                styles.textInput,
                {flex: 1, color: colors.graycolor, fontfamily: fonts.regular},
              ]}
              placeholderTextColor={colors.graycolor}
              value={cardholderName}
              onChangeText={setCardholderName}
              keyboardType="default"
            />
          </View>
          {cardholderNameError ? (
            <Text allowFontScaling={false} style={styles.errorText}>
              {cardholderNameError}
            </Text>
          ) : null}

          <CardField
            postalCodeEnabled={false}
            placeholders={{
              number: '4242 4242 4242 4242',
            }}
            cardStyle={styles.cardField}
            style={{
              width: '100%',
              height: 50,
              marginVertical: 30,
            }}
            onCardChange={details => {
              setCardDetails(details);
            }}
          />

          {showPopUp && (
            <GeneralModal
              modalSuccess={true}
              Set_Modal_Visibilty={setShowPopUp}
              imageSource={<Checkmark width={38} height={38} />}
              title={t('success')}
              description={t('cardAttachedSuccessfully')}
              yesBtnTitle={t('yes')}
              noBtnTitle={t('no')}
              handleYesPress={addCard}
              handleNoPress={() => setShowPopUp(false)}
            />
          )}

          <TouchableOpacity
            style={[styles.continueButton, commonStyles.btnContainer]}
            onPress={handleAttachCard}>
            <Text allowFontScaling={false} style={commonStyles.btnText}>
              {t('attach')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default AttachCards;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  cardField: {
    borderWidth: 1,
    borderColor: colors.borderGrey,
    borderRadius: 8,
    padding: 10,
  },
  continueButton: {
    marginTop: 40,
    marginBottom: 20,
  },

  textInput: {
    fontFamily: fonts.regular,
    fontSize: 14,
    marginLeft: 10,
    height: 50,
    color: colors.black,
  },
  inputHeading: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 17,
    color: colors.black,
    marginVertical: 10,
  },

  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    marginBottom: 15,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderGrey,
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
});
