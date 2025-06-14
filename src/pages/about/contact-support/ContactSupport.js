import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {Formik} from 'formik';
import * as Yup from 'yup';

// Import Custom Header
import CustomHeader from '../../../components/header/CustomHeader';

// Third Party
import {useTranslation} from 'react-i18next';
import {colors, commonStyles, fontSizes, fonts} from '../../../utils/styles';
import Toast from 'react-native-toast-message';
import ActivityIndicatorModal from '../../../components/modal/ActivityIndicatorModal';
import GeneralModal from '../../../components/modal/GeneralModal';
import {API_ENDPOINTS, postRequest} from '../../../utils/apiService';
import {useSelector} from 'react-redux';
import GuestModal from '../../../components/guest-modal/GuestModal';
const ContactSupport = ({navigation}) => {
  const {t} = useTranslation();
  const {user} = useSelector(state => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [showPopUp, setShowPopUp] = useState(false);

  const validationSchema = Yup.object().shape({
    title: Yup.string().required(t('titleRequired')),
    message: Yup.string().required(t('messageRequired')),
  });

  const ON_SUBMIT = async (values, {resetForm}) => {
    const data = {
      name: user?.name,
      email: user?.email,
      subject: values?.title,
      message: values?.message,
    };

    setIsLoading(true);

    const result = await postRequest(API_ENDPOINTS.auth.contact, data);
    setIsLoading(false);
    if (result.success) {
      Toast.show({
        type: 'success',
        position: 'top',
        bottomOffset: 20,
        text1: t('success'),
        text2: t('querySubmittedSuccessfully'),
        visibilityTime: 3000,
      });

      resetForm();
      navigation.goBack();
    } else {
      setErr(true);
      setErrMsg(result.error);
    }
  };

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
      {showPopUp && (
        <GuestModal showPopUp={showPopUp} setShowPopUp={setShowPopUp} />
      )}
      <CustomHeader title={t('contactSupport')} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          style={styles.innerContainer}
          contentContainerStyle={{flexGrow: 1}}
          showsVerticalScrollIndicator={false}>
          <Formik
            initialValues={{title: '', message: ''}}
            validationSchema={validationSchema}
            onSubmit={ON_SUBMIT}>
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              setFieldValue, // Use this to update values with processed input
            }) => (
              <View style={styles.formContainer}>
                <Text allowFontScaling={false} style={styles.labelText}>
                  {t('title')}
                </Text>
                <TextInput
                  allowFontScaling={false}
                  style={styles.input}
                  placeholder={t('title')}
                  placeholderTextColor={colors.placeholderGrey}
                  onChangeText={text => {
                    const capitalizedText = text.replace(
                      /(?:^|\. *)([a-z])/g,
                      match => match.toUpperCase(),
                    );
                    setFieldValue('title', capitalizedText);
                  }}
                  onBlur={handleBlur('title')}
                  value={values.title}
                />
                {touched.title && errors.title && (
                  <Text allowFontScaling={false} style={styles.error}>
                    {errors.title}
                  </Text>
                )}
                <Text allowFontScaling={false} style={styles.labelText}>
                  {t('message')}
                </Text>
                <TextInput
                  allowFontScaling={false}
                  style={[styles.input, styles.textArea]}
                  placeholder={t('writeMessage')}
                  placeholderTextColor={colors.placeholderGrey}
                  onChangeText={text => {
                    const capitalizedText = text.replace(
                      /(?:^|\. *)([a-z])/g,
                      match => match.toUpperCase(),
                    );
                    setFieldValue('message', capitalizedText);
                  }}
                  onBlur={handleBlur('message')}
                  value={values.message}
                  multiline={true}
                />
                {touched.message && errors.message && (
                  <Text allowFontScaling={false} style={styles.error}>
                    {errors.message}
                  </Text>
                )}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    onPress={()=> !user?.isGuest ? handleSubmit : setShowPopUp(true)}
                    style={commonStyles.btnContainer}>
                    <Text allowFontScaling={false} style={commonStyles.btnText}>
                      {t('send')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ContactSupport;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  innerContainer: {
    padding: 10,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  labelText: {
    fontSize: fontSizes.medium,
    marginBottom: 5,
    color: colors.black,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderGrey,
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    fontFamily: fonts.regular,
  },
  textArea: {
    height: 180,
    textAlignVertical: 'top',
  },
  error: {
    color: colors.red,
    marginBottom: 10,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
});
