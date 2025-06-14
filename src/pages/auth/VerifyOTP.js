import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  AppState,
  Dimensions,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {useTranslation} from 'react-i18next';
import Clipboard from '@react-native-clipboard/clipboard';
import CustomHeader from '../../components/header/CustomHeader';
import GeneralModal from '../../components/modal/GeneralModal';
import SuccessIcon from '../../../assets/icons/modal/success.svg';
import {colors, commonStyles, fontSizes, fonts} from '../../utils/styles';
import {useDispatch} from 'react-redux';
import ActivityIndicatorModal from '../../components/modal/ActivityIndicatorModal';
import {API_ENDPOINTS, putRequest} from '../../utils/apiService';
import {setUser} from '../../store/slices/user';
const VerifyOTP = ({navigation, route}) => {
  const userInfo = route?.params?.userData;
  const state = route?.params?.state;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const otpInputs = useRef([]);
  const [timer, setTimer] = useState(60);
  const {t} = useTranslation();
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPopUp, setShowPopUp] = useState(false);
  const dispatch = useDispatch();

  const handleBtnPress = () => {
    setShowPopUp(false);
    setTimeout(() => {
      dispatch(setUser(userInfo));
    }, 500);
  };

  const handleOtpChange = (index, value) => {
    const newOtp = [...otp];
    if (value === '') {
      if (index > 0) {
        otpInputs.current[index - 1].focus();
      }
    } else {
      if (index < otp.length - 1) {
        otpInputs.current[index + 1].focus();
      }
    }
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError('');
  };

  const handleKeyPress = (index, key) => {
    if (key === 'Backspace') {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      if (index > 0) {
        otpInputs.current[index - 1].focus();
      }
    }
  };

  const handleVerifyPress = async () => {
    const isIncomplete = otp.some(digit => digit === '');
    if (isIncomplete) {
      setOtpError(t('completeOTPRequired'));
    } else if (!state) {
      const completeOtp = otp.join('');
      const data = {
        email: userInfo.email,
        pin: completeOtp,
      };

      setIsLoading(true);
      const result = await putRequest(API_ENDPOINTS.auth.otpVerify, data);
      console.log('result', result);
      setIsLoading(false);
      if (result.success) {
        navigation.navigate('AddNewPassword', {email: userInfo?.email});
      } else {
        setErr(true);
        setErrMsg(result.error);
      }
    } else {
      setOtpError('');
      const completeOtp = otp.join('');
      const data = {
        email: userInfo.email,
        pin: completeOtp,
      };

      setIsLoading(true);

      const result = await putRequest(API_ENDPOINTS.auth.otpVerify, data);
      console.log('result', result);
      setIsLoading(false);
      if (result.success) {
        setShowPopUp(!showPopUp);
      } else {
        setErr(true);
        setErrMsg(result.error);
      }
    }
  };

  const resetOTPFieldsAndTime = () => {
    setOtp(['', '', '', '', '', '']);
    setOtpError('');
    otpInputs.current.forEach(input => input.clear());
    otpInputs.current[0].focus();
    setTimer(60);
  };

  const handleResend = async () => {
    const data = {
      email: userInfo.email,
    };

    setIsLoading(true);

    const result = await putRequest(API_ENDPOINTS.auth.forgotPassword, data);
    console.log('result', result);
    setIsLoading(false);
    if (result.success) {
      showToast();
      resetOTPFieldsAndTime();
    } else {
      setErr(true);
      setErrMsg(result.error);
    }
  };

  const showToast = () => {
    Toast.show({
      type: 'success',
      position: 'bottom',
      bottomOffset: 20,
      text1: t('success'),
      text2: t('Otpresentsuccessfully'),
      visibilityTime: 3000,
    });
  };

  const handlePaste = async () => {
    const clipboardContent = await Clipboard.getString();
    if (clipboardContent.length === 6 && !isNaN(clipboardContent)) {
      const otpArray = clipboardContent.split('');
      setOtp(otpArray);
      otpArray.forEach((digit, index) => {
        otpInputs.current[index].setNativeProps({text: digit});
      });
      setOtpError('');
    } else {
      setOtpError(t('invalidOTP'));
    }
  };

  useEffect(() => {
    let interval;
    const handleAppStateChange = nextAppState => {
      if (nextAppState === 'active') {
        const currentTime = new Date().getTime();
        const backgroundTime = currentTime - AppState.lastActiveTime;
        const remainingTime = Math.max(
          0,
          timer - Math.floor(backgroundTime / 1000),
        );
        setTimer(remainingTime);
      } else if (nextAppState === 'background') {
        AppState.lastActiveTime = new Date().getTime();
      }
    };
    const appStateSubscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
    }
    return () => {
      appStateSubscription.remove();
      clearInterval(interval);
    };
  }, [timer]);

  return (
    <SafeAreaView style={styles.container}>
      {isLoading && <ActivityIndicatorModal loaderIndicator={isLoading} />}
      {err && (
        <GeneralModal
          modalError={true}
          description={errMsg}
          Set_Modal_Visibilty={setErr}
        />
      )}
      <GeneralModal
        modalSuccess={showPopUp}
        Set_Modal_Visibilty={setShowPopUp}
        imageSource={<SuccessIcon width={60} height={60} />}
        title={userInfo?.name}
        description={t('accountCreatedSuccessfullyMsg')}
        yesBtnTitle={t('continue')}
        handleYesPress={handleBtnPress}
      />
      <CustomHeader title={t('verifyOTP')} />
      <View style={styles.innerContainer}>
        <Text
          allowFontScaling={false}
          style={[styles.blackText, {marginTop: 10}]}>
          {t('weHaveSentOTP')}
        </Text>
        <Text allowFontScaling={false} style={styles.purpleText}>
          {userInfo?.email}
        </Text>
        <Text
          allowFontScaling={false}
          style={[styles.blackText, {marginTop: 20}]}>
          {t('enterCode')}
        </Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              allowFontScaling={false}
              key={index}
              ref={ref => (otpInputs.current[index] = ref)}
              style={[
                styles.input,
                digit ? styles.filledBorderColor : styles.nonFilledBorderColor,
              ]}
              keyboardType="numeric"
              maxLength={1}
              value={digit}
              onChangeText={value => handleOtpChange(index, value)}
              secureTextEntry={false}
              onFocus={() => {
                otpInputs.current[index].clear();
              }}
              onKeyPress={({nativeEvent}) => {
                handleKeyPress(index, nativeEvent.key);
              }}
            />
          ))}
        </View>
        {/* <TouchableOpacity onPress={handlePaste} style={styles.pasteButton}>
          <Text allowFontScaling={false} style={styles.pasteButtonText}>{t('pasteOTP')}</Text>
        </TouchableOpacity>
        {otpError && <Text allowFontScaling={false} style={styles.errorLabel}>{otpError}</Text>} */}
        <TouchableOpacity
          style={commonStyles.btnContainer}
          onPress={handleVerifyPress}>
          <Text allowFontScaling={false} style={commonStyles.btnText}>
            {t('verify')}
          </Text>
        </TouchableOpacity>
        <Text allowFontScaling={false} style={styles.noCodeText}>
          {t('didNotReceivedCode')}
        </Text>
        {timer > 0 ? (
          <Text allowFontScaling={false} style={styles.timerText}>
            {t('sendAgainIn')} {timer} {t('seconds')}
          </Text>
        ) : (
          <TouchableOpacity
            style={[
              commonStyles.btnOutlineContainer,
              {marginTop: 30, width: '100%'},
            ]}
            onPress={handleResend}>
            <Text allowFontScaling={false} style={commonStyles.btnOutlineText}>
              {t('resendCode')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default VerifyOTP;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  innerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  blackText: {
    fontSize: 14,
    lineHeight: 25,
    color: colors.black,
    fontFamily: fonts.medium,
  },
  purpleText: {
    fontSize: 14,
    lineHeight: 25,
    color: colors.primary,
    fontFamily: fonts.regular,
  },
  otpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 20,
    width: '100%',
    alignSelf: 'center',
  },
  input: {
    width: Dimensions.get('window').width / 6 - 20,
    height: Dimensions.get('window').width / 6 - 20,
    borderWidth: 1,
    borderRadius: 6,
    textAlign: 'center',
    fontSize: 17,
    color: colors.black,
  },
  filledBorderColor: {
    borderColor: colors.primary,
  },
  nonFilledBorderColor: {
    borderColor: colors.darkGrey,
  },
  errorLabel: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 19,
    marginBottom: 15,
    marginHorizontal: 10,
    color: colors.red,
  },
  noCodeText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.semiBold,
    color: colors.black,
    marginTop: 30,
    textAlign: 'center',
  },
  timerText: {
    fontSize: fontSizes.xSmall,
    fontFamily: fonts.regular,
    color: colors.lightBlack,
    margin: 20,
    textAlign: 'center',
  },
  resendTouchOpacity: {
    marginHorizontal: 10,
  },
  resendText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  pasteButton: {
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  pasteButtonText: {
    fontSize: 14,
    color: colors.primary,
  },
});
