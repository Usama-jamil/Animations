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
import {colors, commonStyles, fonts} from '../../utils/styles';
import CustomHeader from '../../components/header/CustomHeader';
import MailIcon from '../../../assets/icons/auth/mail.svg';
import GeneralModal from '../../components/modal/GeneralModal';
import {API_ENDPOINTS, putRequest} from '../../utils/apiService';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
});

const Login = ({navigation}) => {
  const {t} = useTranslation();
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async values => {
    const data = {
      email: values.email,
    };

    setIsLoading(true);

    const result = await putRequest(API_ENDPOINTS.auth.forgotPassword, data);
    console.log('result', result);
    setIsLoading(false);
    if (result.success) {
      navigation.navigate('VerifyOTP', {
        state: false,
        userData: {email: values.email},
      });
    } else {
      setErr(true);
      setErrMsg(result.error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader title={t('forgotPassword')} />

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
        <>
          <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text allowFontScaling={false} style={styles.text}>
                {t('forgotText')}
              </Text>
              <Formik
                initialValues={{email: ''}}
                validationSchema={LoginSchema}
                onSubmit={handleLogin}>
                {({
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  values,
                  errors,
                  touched,
                }) => (
                  <>
                    <Text allowFontScaling={false} style={styles.inputHeading}>
                      {t('emailAddress')}
                    </Text>
                    <View style={styles.textInputContainer}>
                      <MailIcon width={25} height={25} />
                      <TextInput
                        allowFontScaling={false}
                        style={[styles.textInput, {flex: 1}]}
                        placeholder={t('email')}
                        placeholderTextColor={colors.lightBlack}
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

export default Login;

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
    marginBottom: 20,
    fontFamily: fonts.regular,
  },
});
