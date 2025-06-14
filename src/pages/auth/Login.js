import React, {useState} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {colors, commonStyles, fontSizes, fonts} from '../../utils/styles';
import CustomHeader from '../../components/header/CustomHeader';

import MailIcon from '../../../assets/icons/auth/mail.svg';
import PasswordIcon from '../../../assets/icons/auth/password.svg';
import EyeIcon from '../../../assets/icons/auth/eye.svg';
import EyeSlashIcon from '../../../assets/icons/auth/eye_slash.svg';
import {getTimeZone} from 'react-native-localize';
import GeneralModal from '../../components/modal/GeneralModal';

import {API_ENDPOINTS, getRequest, postRequest} from '../../utils/apiService';
import {setUser} from '../../store/slices/user';

import SocialLogin from '../../components/auth/SocialLogin';
import {setAddresses, setSelectAddress} from '../../store/slices/location';
import ActivityIndicatorModal from '../../components/modal/ActivityIndicatorModal';
import {useNavigation} from '@react-navigation/native';
import Guestlogin from '../../components/guest-login/Guestlogin';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .matches(/^\S*$/, 'Password cannot contain spaces') // Ensure no spaces in password
    .required('Password is required'),
});

const Login = () => {
  const dispatch = useDispatch();
  const {fcmToken} = useSelector(state => state.auth);
  const {t} = useTranslation();
  const navigation = useNavigation();
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  const ON_SUBMIT = async values => {
    const payload = {
      email: values.email.trim().toLowerCase(),
      password: values.password,
      device_id: fcmToken || '',
      device_type: Platform.OS,
      timezone: getTimeZone(),
      user_type: '1',
    };

    setIsLoading(true);

    const result = await postRequest(API_ENDPOINTS.auth.login, payload);
    setIsLoading(false); // Ensure loading state is set to false here
    console.log('result', result);
    if (result.success) {
      // Handle successful login
      dispatch(setUser(result.data));
      dispatch(setAddresses(result.data.locations));
      dispatch(setSelectAddress(result.data.locations[0]));
    } else {
      // Handle login failure
      if (result.status === 409) {
        navigation.navigate('VerifyOTP', {
          state: true,
          userData: {email: values.email.trim()},
        });
      }
      setErr(true);
      setErrMsg(result.error);
    }
  };

  const togglePassword = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  return (
    <SafeAreaView style={styles.superContainer}>
      <CustomHeader />

      {err && (
        <GeneralModal
          modalError={true}
          description={errMsg}
          Set_Modal_Visibilty={setErr}
        />
      )}

      {isLoading && <ActivityIndicatorModal loaderIndicator={isLoading} />}

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text allowFontScaling={false} style={styles.headingText}>
            {t('login')}
          </Text>

          <Formik
            initialValues={{
              email: '',
              password: '',
            }}
            validationSchema={LoginSchema}
            onSubmit={ON_SUBMIT}>
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              setFieldValue,
            }) => (
              <>
                {/* Email Input */}
                <Text allowFontScaling={false} style={styles.inputHeading}>
                  {t('emailAddress')}
                </Text>
                <View style={styles.textInputContainer}>
                  <MailIcon width={25} height={25} />
                  <TextInput
                    allowFontScaling={false}
                    style={[styles.textInput, {flex: 1}]}
                    placeholder={t('email')}
                    placeholderTextColor={colors.grey}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                  />
                </View>
                {errors.email && touched.email && (
                  <Text allowFontScaling={false} style={styles.errorLabel}>
                    {errors.email}
                  </Text>
                )}

                {/* Password Input */}
                <Text allowFontScaling={false} style={styles.inputHeading}>
                  {t('password')}
                </Text>
                <View
                  style={[
                    styles.textInputContainer,
                    styles.passwordInputContainer,
                  ]}>
                  <View style={styles.passwordInputIconContainer}>
                    <PasswordIcon width={25} height={25} />
                    <TextInput
                      allowFontScaling={false}
                      style={[styles.textInput, styles.passwordInputWidth]}
                      placeholder={t('password')}
                      placeholderTextColor={colors.grey}
                      autoCapitalize="none"
                      keyboardType="default"
                      secureTextEntry={secureTextEntry}
                      value={values.password}
                      onChangeText={handleChange('password')}
                      onBlur={handleBlur('password')}
                    />
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      togglePassword(setFieldValue, values.secureTextEntry)
                    }>
                    {secureTextEntry ? (
                      <EyeSlashIcon width={25} height={25} />
                    ) : (
                      <EyeIcon width={25} height={25} />
                    )}
                  </TouchableOpacity>
                </View>
                {errors.password && touched.password && (
                  <Text allowFontScaling={false} style={styles.errorLabel}>
                    {errors.password}
                  </Text>
                )}

                <TouchableOpacity
                  style={styles.forgotPasswordTouchOpacity}
                  onPress={() => {
                    setFieldValue('password', '');
                    setFieldValue('email', '');
                    navigation.navigate('ForgotPassword');
                  }}>
                  <Text style={styles.forgotPasswordText}>
                    {t('forgotPassword?')}
                  </Text>
                </TouchableOpacity>

                {/* Submit Button */}
                <TouchableOpacity
                  style={commonStyles.btnContainer}
                  onPress={handleSubmit}>
                  <Text allowFontScaling={false} style={commonStyles.btnText}>
                    {t('login')}
                  </Text>
                </TouchableOpacity>

                <Guestlogin
                  setIsLoading={setIsLoading}
                  setErr={setErr}
                  setErrMsg={setErrMsg}
                />
              </>
            )}
          </Formik>

          <SocialLogin
            setIsLoading={setIsLoading}
            setErr={setErr}
            setErrMsg={setErrMsg}
          />

          <View style={styles.bottomContainer}>
            <View style={styles.rowContainer}>
              <Text allowFontScaling={false} style={styles.text}>
                {t('don’tHaveAnAccount?')}{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text allowFontScaling={false} style={styles.signUpText}>
                  {t('signUp')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  superContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  headingText: {
    textAlign: 'center',
    fontFamily: fonts.bold,
    color: colors.black,
    fontSize: fontSizes.large,
    marginTop: 15,
    marginBottom: 25,
  },
  inputHeading: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 17,
    color: colors.black,
    marginBottom: 10,
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
    borderColor: colors.grey,
  },
  errorLabel: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 19,
    color: colors.red,
    marginBottom: 15,
  },
  textInput: {
    fontFamily: fonts.regular,
    fontSize: 14,
    marginLeft: 10,
    height: 50,
    color: colors.black,
  },
  passwordInputContainer: {
    justifyContent: 'space-between',
  },
  passwordInputIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInputWidth: {
    width: '82%',
  },
  bottomContainer: {
    justifyContent: 'flex-end',
  },
  text: {
    color: colors.black,
    textAlign: 'center',
    fontFamily: fonts.medium,
  },
  signUpText: {
    color: colors.primary,
    fontFamily: fonts.medium,
    textDecorationLine: 'underline',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  forgotPasswordTouchOpacity: {
    marginBottom: 30,
    alignSelf: 'flex-end',
  },
});
