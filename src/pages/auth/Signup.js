import React, {useState, useRef} from 'react';
import {
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';

// Components
import {useTranslation} from 'react-i18next';
import CustomHeader from '../../components/header/CustomHeader';

// Data
import {countryData} from '../../data/countryData';
// Third Party
import ActionSheet from 'react-native-actionsheet';
import {Dropdown} from 'react-native-element-dropdown';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import PhoneInput from 'react-native-international-phone-number';

// Styles
import {colors, commonStyles, fontSizes, fonts} from '../../utils/styles';
// Assets
import UserIcon from '../../../assets/icons/auth/user.svg';
import ChevronIcon from '../../../assets/icons/auth/chevron.svg';
import UploadImageIcon from '../../../assets/icons/auth/upload_image.svg';
import MailIcon from '../../../assets/icons/auth/mail.svg';
import PasswordIcon from '../../../assets/icons/auth/password.svg';
import EyeIcon from '../../../assets/icons/auth/eye.svg';
import EyeSlashIcon from '../../../assets/icons/auth/eye_slash.svg';
import GlobalIcon from '../../../assets/icons/auth/globe.svg';
import UnCheckIcon from '../../../assets/icons/auth/checkmark_unfill.svg';
import CheckIcon from '../../../assets/icons/auth/checkmark_fill.svg';
import PhoneIcon from '../../../assets/icons/auth/phone.svg';
import {getTimeZone} from 'react-native-localize';
import {useDispatch} from 'react-redux';
import {useSelector} from 'react-redux';
import ActivityIndicatorModal from '../../components/modal/ActivityIndicatorModal';
import GeneralModal from '../../components/modal/GeneralModal';
import {
  API_ENDPOINTS,
  imageUploadRequest,
  postRequest,
} from '../../utils/apiService';
import {SetUserInformation} from '../../store/slices/user';
import FastImage from 'react-native-fast-image';
import {setAddresses, setSelectAddress} from '../../store/slices/location';
import {KeyboardAvoidingView} from 'react-native';
import {
  compressIfNeeded,
  useRequestPermissions,
} from '../../utils/requestcamerapermission';

const Signup = ({navigation}) => {
  const [fullName, setFullName] = useState('');
  const [fullNameError, setFullNameError] = useState(null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setconfirmPassword] = useState('');

  const [passwordError, setPasswordError] = useState(null);
  const [confirmPasswordError, setconfirmPasswordError] = useState(null);

  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureTextEntryConfirm, setSecureTextEntryConfirm] = useState(true);

  const {t} = useTranslation();
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const {userLang} = useSelector(state => state.auth);
  const [isLoading, setIsLoading] = useState(false);

  // CheckBox Data
  const [checkmark, setCheckmark] = useState(false);
  const [checkmarkError, setCheckMarkError] = useState(null);

  // Phone number data
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [showPhoneError, setShowPhoneError] = useState(null);

  // Country Data
  const [countryValue, setCountryValue] = useState(null);
  const [countryError, setCountryError] = useState(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  // Image Picking Data
  const [selectedImageFile, setSelectedImageFile] = useState('');
  const actionSheetRef = useRef(null);
  const options = ['Camera', 'Photos', 'Cancel'];
  const requestPermissions = useRequestPermissions();
  const dispatch = useDispatch();
  const {fcmToken} = useSelector(state => state.auth);

  console.log('selcted image', selectedImageFile);

  const toggleCheckmark = () => {
    setCheckmark(!checkmark);
    setCheckMarkError(null);
  };

  function handleInputValue(phoneNumber) {
    setInputValue(phoneNumber);
    setShowPhoneError(null);
  }
  function handleSelectedCountry(country) {
    setSelectedCountry(country);
    setShowPhoneError(null);
  }
  function capitalizeEachWord(name) {
    if (!name) return '';
    return name.toLowerCase().replace(/(^|\s)\S/g, char => char.toUpperCase());
  }

  const renderItem = () =>
    isDropdownVisible ? (
      <ChevronIcon width={25} height={25} />
    ) : (
      <ChevronIcon width={25} height={25} />
    );

  const showActionSheet = () => {
    actionSheetRef.current.show();
  };
  const handleCameraClick = () => {
    showCamera();
  };
  const handlePhotosClick = () => {
    showImagePicker();
  };
  const showCamera = async () => {
    const hasPermission = await requestPermissions('camera');
    if (!hasPermission) {
      return;
    }
    launchCamera({mediaType: 'photo'}, async response => {
      if (!response.didCancel && !response.error) {
        const selectedImage = response.assets[0];
        const imageToUpload = await compressIfNeeded(selectedImage);
        handleImageUpload(imageToUpload);
      }
    });
  };
  const showImagePicker = async () => {
    const hasPermission = await requestPermissions('photos');
    if (!hasPermission) {
      return;
    }
    launchImageLibrary({mediaType: 'photo'}, async response => {
      if (response.error) {
        return;
      }
      if (
        !response.didCancel &&
        response.assets &&
        response.assets.length > 0
      ) {
        const selectedImage = response.assets[0];
        const imageToUpload = await compressIfNeeded(selectedImage);
        handleImageUpload(imageToUpload);
      }
    });
  };

  const handleImageUpload = async selectedImageFile => {
    const formData = new FormData();
    formData.append('file', {
      uri: selectedImageFile.uri,
      type: selectedImageFile.type,
      name: selectedImageFile.fileName,
    });

    setIsLoading(true);

    // Upload image
    const uploadResult = await imageUploadRequest(
      API_ENDPOINTS.file.fileUpload,
      formData,
    );
    setIsLoading(false);
    if (uploadResult.success) {
      setSelectedImageFile(uploadResult.data);
    } else {
      setErr(true);
      setErrMsg(uploadResult.error);
      return; // Exit if image upload fails
    }
  };

  const validateEmail = email => {
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
  };

  const handleSignup = async () => {
    let isValid = true;

    // if (!selectedImageFile) {
    //   setImageError(t('yourImageRequired'));
    //   isValid = false;
    // } else {
    //   setImageError(null);
    // }

    if (!fullName.trim()) {
      setFullNameError(t('yourFullNameRequired'));
      isValid = false;
    } else {
      setFullNameError(null);
    }

    if (!inputValue) {
      setShowPhoneError(t('phoneNumberRequired'));
      isValid = false;
    } else {
      setShowPhoneError(null);
    }

    if (!email.trim()) {
      setEmailError(t('emailRequired'));
      isValid = false;
    } else {
      if (!validateEmail(email)) {
        setEmailError(t('invalidEmail'));
        isValid = false;
      } else {
        setEmailError(null);
      }
    }

    if (!password) {
      setPasswordError(t('passwordRequired'));
      isValid = false;
    } else {
      setPasswordError(null);
    }

    if (!confirmPassword) {
      setconfirmPasswordError(t('confirmPasswordRequired'));
      isValid = false;
    } else if (password !== confirmPassword) {
      setconfirmPasswordError(t('passwordMatched'));
      isValid = false;
    } else {
      setconfirmPasswordError(null);
    }

    if (!countryValue) {
      setCountryError(t('countryRequired'));
      isValid = false;
    } else {
      setCountryError(null);
    }

    if (!checkmark) {
      setCheckMarkError(t('pleaseAcceptTermsAndConditions'));
      isValid = false;
    } else {
      setCheckMarkError(null);
    }

    if (isValid) {
      try {
        const capitalizedUserName = capitalizeEachWord(fullName);
        const data = {
          name: capitalizedUserName,
          email: email.trim().toLowerCase(),
          password: password,
          country: countryValue,
          user_type: '1',
          timezone: getTimeZone(),
          language: userLang,
          ...(selectedImageFile && {image: selectedImageFile?.fileName}),
          mobile: selectedCountry?.callingCode + inputValue.replace(/\s+/g, ''),
          flag: selectedCountry?.cca2,
          country_code: selectedCountry?.callingCode,
          device_id: fcmToken || 'dasjkdhkajshdjkahjkdhaksjhd',
          device_type: Platform?.OS,
        };
        console.log('data', data);

        setIsLoading(true);

        const signupResult = await postRequest(API_ENDPOINTS.auth.signup, data);
        setIsLoading(false);
        console.log('signupresu;t', signupResult);

        if (signupResult.success) {
          dispatch(SetUserInformation(signupResult?.data));
          navigation.navigate('VerifyOTP', {
            state: true,
            userData: signupResult?.data,
          });
          dispatch(setAddresses(signupResult.data.locations));
          dispatch(setSelectAddress(signupResult.data.locations[0]));
        } else {
          setErr(true);
          setErrMsg(signupResult.error);
        }
      } catch (error) {
        setIsLoading(false);
        setErr(true);
        setErrMsg('An unexpected error occurred.');
        console.error(error);
      }
    }
  };

  const togglePassword = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const togglePasswordConfirm = () => {
    setSecureTextEntryConfirm(!secureTextEntryConfirm);
  };

  const handlePasswordChange = newPassword => {
    const trimmedPassword = newPassword.replace(/\s/g, ''); // Remove spaces
    setPasswordError(null);
    setPassword(trimmedPassword);
  };

  const handlePasswordChangeForConfirm = newPassword => {
    const trimmedPassword = newPassword.replace(/\s/g, ''); // Remove spaces
    setconfirmPasswordError(null);
    setconfirmPassword(trimmedPassword);
  };

  return (
    <SafeAreaView style={styles.superContainer}>
      {isLoading && <ActivityIndicatorModal loaderIndicator={isLoading} />}
      {err && (
        <GeneralModal
          modalError={true}
          description={errMsg}
          Set_Modal_Visibilty={setErr}
        />
      )}
      <CustomHeader />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <Text allowFontScaling={false} style={styles.headingText}>
            {t('signUp')}
          </Text>
          <TouchableOpacity
            style={styles.uploadImgOpacity}
            onPress={showActionSheet}>
            {selectedImageFile ? (
              <FastImage
                source={{uri: selectedImageFile.path}}
                style={styles.profileImg}
              />
            ) : (
              <UploadImageIcon width={32} height={32} />
            )}
          </TouchableOpacity>
          {/* {imageError && (
          <Text
            allowFontScaling={false}
            style={[styles.errorLabel, { alignSelf: 'center' }]}>
            {imageError}
          </Text>
        )} */}
          <Text allowFontScaling={false} style={styles.inputHeading}>
            {t('fullName')}
          </Text>
          <View style={styles.textInputContainer}>
            <UserIcon width={20} height={20} />
            <TextInput
              allowFontScaling={false}
              style={[styles.textInput, {flex: 1}]}
              placeholder={t('fullName')}
              placeholderTextColor={colors.lightBlack}
              maxLength={20}
              value={fullName}
              onChangeText={newtitle => {
                setFullNameError(null);
                setFullName(newtitle);
              }}
            />
          </View>
          {fullNameError && (
            <Text allowFontScaling={false} style={styles.errorLabel}>
              {fullNameError}
            </Text>
          )}

          <Text allowFontScaling={false} style={styles.inputHeading}>
            {t('phoneNumber')}
          </Text>
          <View style={styles.textInputContainer}>
            <PhoneIcon width={25} height={25} />
            <PhoneInput
              value={inputValue}
              onChangePhoneNumber={handleInputValue}
              defaultCountry={'AE'}
              selectedCountry={selectedCountry}
              onChangeSelectedCountry={handleSelectedCountry}
              placeholder={t('phoneNumber')}
              placeholderTextColor={colors.lightBlack}
              phoneInputStyles={{
                container: {
                  borderWidth: 0,
                  height: 45,
                  width: '90%',
                  marginLeft: 5,
                },
                flagContainer: {
                  height: 48,
                  justifyContent: 'center',
                  backgroundColor: colors.background,
                },
                flag: {
                  marginHorizontal: -15,
                },
                caret: {
                  fontSize: 15,
                  marginRight: -10,
                  marginLeft: -5,
                  marginTop: -3,
                },
                divider: {
                  backgroundColor: '#00000066',
                },
                callingCode: {
                  fontFamily: fonts.regular,
                  fontSize: 14,
                  color: colors.black,
                  marginRight: -10,
                  marginLeft: -5,
                },
                input: {
                  fontFamily: fonts.regular,
                  fontSize: 14,
                  color: colors.black,
                  marginLeft: -10,
                },
              }}
              modalStyles={{
                searchInput: {
                  fontFamily: fonts.regular,
                  fontSize: 14,
                  color: colors.black,
                },
                countryName: {
                  fontFamily: fonts.regular,
                  fontSize: 14,
                  color: colors.black,
                },
              }}
            />
          </View>
          {showPhoneError && (
            <Text allowFontScaling={false} style={styles.errorLabel}>
              {showPhoneError}
            </Text>
          )}

          <Text allowFontScaling={false} style={styles.inputHeading}>
            {t('country')}
          </Text>
          <View style={styles.inputContainer}>
            <GlobalIcon width={24} height={24} />
            <Dropdown
              style={[styles.dropdown]}
              placeholderStyle={styles.placeholderStyle}
              placeholder={t('country')}
              selectedTextStyle={styles.dropDownInput}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              fontFamily={fonts.regular}
              renderRightIcon={renderItem}
              data={countryData}
              search
              autoScroll={false}
              searchPlaceholder={t('search')}
              maxHeight={300}
              labelField="label"
              valueField="label"
              value={countryValue}
              onFocus={() => setIsDropdownVisible(true)}
              onBlur={() => setIsDropdownVisible(false)}
              onChange={item => {
                setCountryValue(item.label);
                setCountryError(null);
              }}
            />
          </View>
          {countryError && (
            <Text allowFontScaling={false} style={styles.errorLabel}>
              {countryError}
            </Text>
          )}

          <Text allowFontScaling={false} style={styles.inputHeading}>
            {t('emailAddress')}
          </Text>
          <View style={styles.textInputContainer}>
            <MailIcon width={24} height={24} />
            <TextInput
              allowFontScaling={false}
              style={[styles.textInput, {flex: 1}]}
              placeholder={t('emailAddress')}
              placeholderTextColor={colors.placeholderGrey}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={newEmail => {
                setEmailError(null), setEmail(newEmail);
              }}
            />
          </View>
          {emailError && (
            <Text allowFontScaling={false} style={styles.errorLabel}>
              {emailError}
            </Text>
          )}
          <Text allowFontScaling={false} style={styles.inputHeading}>
            {t('password')}
          </Text>
          <View
            style={[styles.textInputContainer, styles.passwordInputContainer]}>
            <View style={styles.passwordInputIconContainer}>
              <PasswordIcon width={25} height={25} />
              <TextInput
                allowFontScaling={false}
                style={[styles.textInput, styles.passwordInputWidth]}
                placeholder={t('password')}
                placeholderTextColor={colors.placeholderGrey}
                autoCapitalize="none"
                keyboardType="default"
                secureTextEntry={secureTextEntry}
                value={password}
                onChangeText={handlePasswordChange}
              />
            </View>
            <TouchableOpacity onPress={togglePassword}>
              {secureTextEntry ? (
                <EyeSlashIcon width={25} height={25} />
              ) : (
                <EyeIcon width={25} height={25} />
              )}
            </TouchableOpacity>
          </View>
          {passwordError && (
            <Text allowFontScaling={false} style={styles.errorLabel}>
              {passwordError}
            </Text>
          )}

          <Text allowFontScaling={false} style={styles.inputHeading}>
            {t('confirmPassword')}
          </Text>
          <View
            style={[styles.textInputContainer, styles.passwordInputContainer]}>
            <View style={styles.passwordInputIconContainer}>
              <PasswordIcon width={25} height={25} />
              <TextInput
                allowFontScaling={false}
                style={[styles.textInput, styles.passwordInputWidth]}
                placeholder={t('confirmPassword')}
                placeholderTextColor={colors.placeholderGrey}
                autoCapitalize="none"
                keyboardType="default"
                secureTextEntry={secureTextEntryConfirm}
                value={confirmPassword}
                onChangeText={handlePasswordChangeForConfirm}
              />
            </View>
            <TouchableOpacity onPress={togglePasswordConfirm}>
              {secureTextEntryConfirm ? (
                <EyeSlashIcon width={25} height={25} />
              ) : (
                <EyeIcon width={25} height={25} />
              )}
            </TouchableOpacity>
          </View>
          {confirmPasswordError && (
            <Text allowFontScaling={false} style={styles.errorLabel}>
              {confirmPasswordError}
            </Text>
          )}

          <View style={styles.checkboxContainer}>
            <TouchableOpacity onPress={() => toggleCheckmark()}>
              {checkmark ? (
                <CheckIcon width={25} height={25} />
              ) : (
                <UnCheckIcon width={25} height={25} />
              )}
            </TouchableOpacity>
            <Text
              allowFontScaling={false}
              style={[
                styles.termsAndConditionsText,
                {marginLeft: 10, color: colors.placeholderGrey},
              ]}>
              {t('iAccept')}
            </Text>
            <TouchableOpacity
              style={styles.termsAndConditionsOpacity}
              onPress={() => navigation.navigate('Terms')}>
              <Text
                allowFontScaling={false}
                style={[
                  styles.termsAndConditionsText,
                  {color: colors.primary, marginLeft: 4},
                ]}>
                {t('termsAndConditions')}
              </Text>
            </TouchableOpacity>
          </View>
          {checkmarkError && (
            <Text allowFontScaling={false} style={styles.errorLabel}>
              {checkmarkError}
            </Text>
          )}
          <TouchableOpacity
            style={[commonStyles.btnContainer, {marginHorizontal: 10}]}
            onPress={handleSignup}>
            <Text allowFontScaling={false} style={commonStyles.btnText}>
              {t('createAccount')}
            </Text>
          </TouchableOpacity>

          <View style={styles.noAccountContainer}>
            <Text
              allowFontScaling={false}
              style={[styles.textInput, {height: 25}]}>
              {t('alreadyHaveAnAccount')}{' '}
            </Text>
            <TouchableOpacity
              onPress={() => {
                navigation.goBack();
              }}>
              <Text allowFontScaling={false} style={styles.loginText}>
                {t('login')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ActionSheet
        ref={actionSheetRef}
        title={t('SelectAnOption')}
        options={options}
        cancelButtonIndex={2}
        onPress={index => {
          if (index === 0) {
            handleCameraClick();
          } else if (index === 1) {
            handlePhotosClick();
          }
        }}
      />
    </SafeAreaView>
  );
};

export default Signup;

const styles = StyleSheet.create({
  superContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headingText: {
    textAlign: 'center',
    fontFamily: fonts.bold,
    color: colors.black,
    fontSize: fontSizes.xlarge,
    marginTop: 10,
    marginBottom: 20,
  },
  uploadImgOpacity: {
    width: 90,
    height: 90,
    borderRadius: 90 / 2,
    backgroundColor: colors.uploadImgBg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.darkGrey,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  profileImg: {
    width: 90,
    height: 90,
    borderRadius: 90 / 2,
  },
  uploadImgIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
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
    marginHorizontal: 10,
  },
  errorLabel: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 19,
    color: colors.red,
    marginBottom: 15,
    marginHorizontal: 10,
  },
  inputHeading: {
    fontFamily: fonts.medium,
    fontWeight: '500',
    fontSize: 15,
    lineHeight: 17,
    color: colors.black,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  securePasswordIcon: {
    marginRight: 10,
    tintColor: colors.darkGrey,
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
  noAccountContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  noAccountText: {
    fontSize: 17,
    fontFamily: fonts.regular,
    color: colors.black,
    textAlign: 'center',
    marginRight: 5,
    marginTop: 2,
  },
  loginText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    textAlign: 'center',
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 10,
    marginBottom: 20,
    marginHorizontal: 10,
  },
  termsAndConditionsOpacity: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  termsAndConditionsText: {
    fontSize: fontSizes.xSmall,
    fontFamily: fonts.regular,
  },
  iconStyle: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
  },
  inputContainer: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center', // Ensure items are centered vertically

    borderWidth: 1,
    borderColor: colors.borderGrey,
    borderRadius: 10,
    height: 50,
    marginBottom: 10,
  },
  dropdown: {
    flex: 1,
    height: 50, // Fixed height
  },
  placeholderStyle: {
    fontSize: fontSizes.xSmall,
    paddingHorizontal: 10,
    fontFamily: fonts.regular,
    color: colors.placeholderGrey,
  },
  dropDownInput: {
    paddingHorizontal: 10,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: '#000000',
    flex: 1,
  },
  inputSearchStyle: {
    height: 50,
    fontSize: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
