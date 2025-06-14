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
import {Formik} from 'formik';
import * as Yup from 'yup';
import {colors, commonStyles, fontSizes, fonts} from '../../utils/styles';
import CustomHeader from '../../components/header/CustomHeader';

// Assets
import PasswordIcon from '../../../assets/icons/auth/password.svg';
import EyeIcon from '../../../assets/icons/auth/eye.svg';
import EyeSlashIcon from '../../../assets/icons/auth/eye_slash.svg';
import GeneralModal from '../../components/modal/GeneralModal';
import SuccessIcon from '../../../assets/icons/modal/new_password_success.svg';
import {API_ENDPOINTS, putRequest} from '../../utils/apiService';

const LoginSchema = Yup.object().shape({
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

const AddNewPassword = ({navigation, route}) => {
  const email = route?.params?.email;

  const {t} = useTranslation();
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [showPopUp, setShowPopUp] = useState(false);

  const handlePress = async values => {
    const data = {
      email: email,
      user_type: '1',
      newpassword: values.password,
      retypenewpassword: values.confirmPassword,
    };

    setIsLoading(true);

    const result = await putRequest(API_ENDPOINTS.auth.resetPassword, data);
    console.log('result', result);
    setIsLoading(false);
    if (result.success) {
      setShowPopUp(!showPopUp);
    } else {
      setErr(true);
      setErrMsg(result.error);
    }
  };

  const togglePassword = (setFieldValue, fieldName, currentValue) => {
    setFieldValue(fieldName, !currentValue);
  };

  const handleBtnPress = () => {
    setShowPopUp(false);
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader title={t('addNewPassword')} />

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
        imageSource={<SuccessIcon width={80} height={80} />}
        title={t('success')}
        description={t('passwordResetSuccessfully')}
        yesBtnTitle={t('login')}
        handleYesPress={handleBtnPress}
      />

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
        <>
          <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text allowFontScaling={false} style={styles.text}>
                {t('newPasswordText')}
              </Text>
              <Formik
                initialValues={{
                  password: '',
                  confirmPassword: '',
                  secureTextEntry: true,
                  confirmSecureTextEntry: true,
                }}
                validationSchema={LoginSchema}
                onSubmit={handlePress}>
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
                    <Text allowFontScaling={false} style={styles.inputHeading}>
                      {t('newPassword')}
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
                          placeholder={t('newPassword')}
                          placeholderTextColor={colors.grey}
                          autoCapitalize="none"
                          keyboardType="default"
                          secureTextEntry={values.secureTextEntry}
                          value={values.password}
                          onChangeText={handleChange('password')}
                          onBlur={handleBlur('password')}
                        />
                      </View>
                      <TouchableOpacity
                        onPress={() =>
                          togglePassword(
                            setFieldValue,
                            'secureTextEntry',
                            values.secureTextEntry,
                          )
                        }>
                        {values.secureTextEntry ? (
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

                    <Text allowFontScaling={false} style={styles.inputHeading}>
                      {t('confirmPassword')}
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
                          placeholder={t('confirmPassword')}
                          placeholderTextColor={colors.grey}
                          autoCapitalize="none"
                          keyboardType="default"
                          secureTextEntry={values.confirmSecureTextEntry}
                          value={values.confirmPassword}
                          onChangeText={handleChange('confirmPassword')}
                          onBlur={handleBlur('confirmPassword')}
                        />
                      </View>
                      <TouchableOpacity
                        onPress={() =>
                          togglePassword(
                            setFieldValue,
                            'confirmSecureTextEntry',
                            values.confirmSecureTextEntry,
                          )
                        }>
                        {values.confirmSecureTextEntry ? (
                          <EyeSlashIcon width={25} height={25} />
                        ) : (
                          <EyeIcon width={25} height={25} />
                        )}
                      </TouchableOpacity>
                    </View>
                    {errors.confirmPassword && touched.confirmPassword && (
                      <Text allowFontScaling={false} style={styles.errorLabel}>
                        {errors.confirmPassword}
                      </Text>
                    )}

                    <TouchableOpacity
                      style={commonStyles.btnContainer}
                      onPress={handleSubmit}>
                      <Text
                        allowFontScaling={false}
                        style={commonStyles.btnText}>
                        {t('send')}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </Formik>
            </ScrollView>
          </KeyboardAvoidingView>
        </>
      )}
    </SafeAreaView>
  );
};

export default AddNewPassword;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  inputHeading: {
    fontFamily: fonts.medium,
    fontWeight: '500',
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
    marginHorizontal: 10,
  },
  textInput: {
    fontFamily: fonts.regular,
    fontSize: 14,
    marginLeft: 10,
    height: 50,
    color: colors.black,
  },
  text: {
    color: colors.black,
    marginBottom: 30,
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
});
