import React, {useEffect, useRef, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import CustomHeader from '../../components/header/CustomHeader';
import {useTranslation} from 'react-i18next';
import {colors, fontSizes, fonts} from '../../utils/styles';
import CameraIcon from '../../../assets/icons/camera.svg';
import PhoneIcon from '../../../assets/icons/auth/phone.svg';
import {parsePhoneNumber} from 'libphonenumber-js';
import PhoneInput from 'react-native-international-phone-number';
import {useFocusEffect} from '@react-navigation/native';
import {
  API_ENDPOINTS,
  getRequest,
  imageUploadRequest,
  putRequest,
} from '../../utils/apiService';
import GeneralModal from '../../components/modal/GeneralModal';
import ActionSheet from 'react-native-actionsheet';
import FastImage from 'react-native-fast-image';
import UserAvatar from 'react-native-user-avatar';
import {
  compressIfNeeded,
  requestCameraPermission,
  useRequestPermissions,
} from '../../utils/requestcamerapermission';

const EditProfile = ({navigation}) => {
  const {t} = useTranslation();
  const [inputValue, setInputValue] = useState('');
  const [selectedCountry, setSelectedCountry] = useState();
  const [User, setUser] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState('');
  const actionSheetRef = useRef(null);
  const options = ['Camera', 'Photos', 'Cancel'];
  const [error, setError] = useState(false);
  const requestPermissions = useRequestPermissions();

  console.log('user', User);

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

    launchCamera({mediaType: 'photo', includeExtra: true}, async response => {
      if (!response.didCancel && !response.error) {
        const selectedImage = response.assets[0];
        const imageToUpload = await compressIfNeeded(selectedImage);
        setSelectedImageFile(imageToUpload);
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
        setSelectedImageFile(imageToUpload);
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
    const uploadResult = await imageUploadRequest(
      API_ENDPOINTS.file.fileUpload,
      formData,
    );

    console.log('image', uploadResult);

    setIsLoading(false);

    if (uploadResult.success) {
      return uploadResult.data.fileName;
    } else {
      console.log('Image upload failed');
      setErr(true);
      setErrMsg(uploadResult.error);
      return null;
    }
  };

  const handleSelectedCountry = country => {
    setSelectedCountry(country);
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required(t('yourFullNameRequired')),
    phoneNumber: Yup.string()
      .required(t('phoneNumberRequired'))
      .test('isValidPhoneNumber', t('invalidPhoneFormat'), function (value) {
        if (!value) return false; // Ensure the field is not empty
        const phoneNumberString = selectedCountry?.callingCode + value.trim();
        if (phoneNumberString.length < 6) {
          return this.createError({message: t('phoneNumberShort')});
        }
        const phoneNumber = parsePhoneNumber(phoneNumberString);
        return phoneNumber && phoneNumber.isValid();
      }),
  });

  const handleSubmitProfileUpdate = async values => {
    console.log('values', values);
    const imageFilename = selectedImageFile
      ? await handleImageUpload(selectedImageFile)
      : null;

    console.log('imageFilename', imageFilename);
    const profileData = {
      name: values.name,
      country_code: selectedCountry?.callingCode,
      mobile:
        selectedCountry?.callingCode + values?.phoneNumber.replace(/\s+/g, ''),
      flag: selectedCountry?.cca2,
      ...(selectedImageFile && {image: imageFilename}),
    };

    setIsLoading(true);

    // Update profile
    const updateResult = await putRequest(
      API_ENDPOINTS.auth.profileUpdate,
      profileData,
    );

    setIsLoading(false);

    if (updateResult.success) {
      navigation.goBack();
      // Navigate or show success message
    } else {
      console.log('Profile update failed');
      setErr(true);
      setErrMsg(updateResult.error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, []),
  );

  const fetchData = async () => {
    setIsLoading(true);
    const result = await getRequest(API_ENDPOINTS.auth.profile);
    setIsLoading(false);
    if (result.success) {
      setUser(result.data);
      setInputValue(result.data.mobile); // Set the initial phone number value
    } else {
      console.log('error');
      setErr(true);
      setErrMsg(result.error);
    }
  };

  return (
    <Formik
      initialValues={{name: '', phoneNumber: ''}}
      validationSchema={validationSchema}
      onSubmit={handleSubmitProfileUpdate}>
      {({
        handleChange,
        handleBlur,
        handleSubmit,
        values,
        errors,
        touched,
        setFieldValue,
      }) => {
        {
          useEffect(() => {
            if (User) {
              setFieldValue('name', User.name);
            }
          }, [setFieldValue, User]);
        }
        return (
          <SafeAreaView style={styles.container}>
            <CustomHeader title={t('editProfile')} />
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
              <>
                <ScrollView
                  contentContainerStyle={styles.scrollViewContainer}
                  showsVerticalScrollIndicator={false}>
                  <View style={styles.contentContainer}>
                    <View style={styles.outsidecircle}>
                      <View style={styles.circle}>
                        <View style={styles.insideCircle}>
                          <View style={styles.iconContainer}>
                            {selectedImageFile ? (
                              <FastImage
                                source={{uri: selectedImageFile.uri}}
                                style={styles.profileImage}
                              />
                            ) : !error &&
                              User?.image !==
                                'https://timezzi-bucket.s3.amazonaws.com/noImg.png' ? (
                              <Image
                                source={{uri: User?.image}}
                                width={58}
                                height={58}
                                style={{borderRadius: 29, resizeMode: 'cover'}}
                                onError={() => setError(true)}
                              />
                            ) : (
                              <UserAvatar
                                size={50}
                                name={
                                  User?.name
                                    ?.split(' ')
                                    .map(word => word.charAt(0).toUpperCase())
                                    .join('') || ''
                                }
                                bgColors={[colors.primary]}
                              />
                            )}
                            <TouchableOpacity
                              style={styles.cameraIcon}
                              onPress={showActionSheet}>
                              <CameraIcon width={26} height={26} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </View>

                    <View>
                      <Text allowFontScaling={false} style={styles.name}>
                        {t('fullName')}
                      </Text>
                      <View>
                        <TextInput
                          allowFontScaling={false}
                          placeholder={t('enterName')}
                          placeholderTextColor={colors.lightBlack}
                          style={[styles.textinput, {color: colors.black}]}
                          onChangeText={handleChange('name')}
                          onBlur={handleBlur('name')}
                          value={values.name}
                        />
                        {touched.name && errors.name ? (
                          <Text
                            allowFontScaling={false}
                            style={styles.errorLabel}>
                            {errors.name}
                          </Text>
                        ) : null}
                      </View>
                    </View>

                    <Text allowFontScaling={false} style={styles.inputHeading}>
                      {t('phoneNumber')}
                    </Text>
                    <View style={styles.textInputContainer}>
                      <PhoneIcon width={25} height={25} />
                      <PhoneInput
                        defaultValue={User?.mobile}
                        value={values.phoneNumber} // Bind the value to Formik's phoneNumber
                        onChangePhoneNumber={handleChange('phoneNumber')} // Update Formik's state
                        selectedCountry={selectedCountry}
                        onChangeSelectedCountry={handleSelectedCountry}
                        placeholder={t('phoneNumber')}
                        placeholderTextColor={colors.lightBlack}
                        phoneInputStyles={styles.phoneInputStyles}
                        modalStyles={styles.modalStyles}
                      />
                    </View>

                    {touched.phoneNumber && errors.phoneNumber ? (
                      <Text allowFontScaling={false} style={styles.errorLabel}>
                        {errors.phoneNumber}
                      </Text>
                    ) : null}
                  </View>
                </ScrollView>

                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                  <Text allowFontScaling={false} style={styles.insidebtn}>
                    {t('save')}
                  </Text>
                </TouchableOpacity>
              </>
            )}
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
      }}
    </Formik>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    gap: 33,
  },
  labelStyle: {
    fontFamily: fonts.semiBold,
    color: colors.black,
    fontSize: 18,
  },
  outsidecircle: {
    borderWidth: 1,
    marginTop: 40,
    alignSelf: 'center',
    borderRadius: 50,
    padding: 7,
    width: 94,
    height: 94,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: colors.borderGrey,
  },
  circle: {
    borderWidth: 1,
    borderRadius: 40,
    width: 82,
    height: 82,
    borderColor: colors.borderGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insideCircle: {
    borderWidth: 1,
    width: 70,
    height: 70,
    borderRadius: 38,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  textinput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderGrey,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginTop: 5,
    height: 50,
    fontFamily: fonts.regular,
  },
  name: {
    fontSize: 15,
    fontFamily: fonts.medium,
    color: colors.black,
    marginTop: 30,
  },
  flagtextinput: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.borderGrey,
    borderRadius: 10,
    marginTop: 5,
    alignItems: 'center',
    paddingLeft: 12,
    fontFamily: fonts.regular,
  },
  button: {
    paddingVertical: 17,
    backgroundColor: colors.primary,
    alignItems: 'center',
    borderRadius: 10,
    marginVertical: 20,
    marginHorizontal: 10,
  },
  insidebtn: {
    fontSize: fontSizes.small,
    color: colors.background,
    fontFamily: fonts.regular,
  },
  errorLabel: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.red,
    marginTop: 5,
  },
  inputHeading: {
    fontFamily: fonts.regular,
    fontWeight: '500',
    fontSize: 15,
    lineHeight: 17,
    color: colors.black,
    marginBottom: 10,
    marginVertical: 20,
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  scrollViewContainer: {
    flexGrow: 0,
  },
  contentContainer: {
    marginHorizontal: 10,
  },
  cameraIcon: {
    position: 'absolute',
    top: 34,
    right: -10,
  },
  phoneInputStyles: {
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
  },
  modalStyles: {
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
  },
});
