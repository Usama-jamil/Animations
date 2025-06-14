import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
  FlatList,
} from 'react-native';
import {colors, commonStyles, fonts} from '../../utils/styles';
import React, {useRef, useState} from 'react';
import CustomHeader from '../../components/header/CustomHeader';
import Checkmark from '../../../assets/icons/checkmark-badge.svg';
import {useNavigation} from '@react-navigation/native';
import {
  compressImage,
  MAX_SIZE_MB,
  useRequestPermissions,
} from '../../utils/requestcamerapermission';
import ActivityIndicatorModal from '../../components/modal/ActivityIndicatorModal';
import {Formik} from 'formik';
import * as Yup from 'yup';
import moment from 'moment';
import Toast from 'react-native-toast-message';
import GeneralModal from '../../components/modal/GeneralModal';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import ActionSheet from 'react-native-actionsheet';
import {
  API_ENDPOINTS,
  imageUploadRequest,
  putRequest,
} from '../../utils/apiService';
import Cross from '../../../assets/icons/more/cancel.svg';

const ReturnListing = ({route}) => {
  const navigation = useNavigation();
  const id = route?.params?.id || '6822f2ad6d031554d0631cd9';
  const [select, setSelect] = useState(false);
  const options = ['Camera', 'Photos', 'Cancel'];
  const actionSheetRef = useRef(null);
  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const requestPermissions = useRequestPermissions();

  const handlePhotosClick = async () => {
    const hasPermission = await requestPermissions('photos');
    console.log('haspermission', hasPermission);
    if (hasPermission) {
      try {
        const options = {
          mediaType: 'photo',
          selectionLimit: 20, // Allow multiple images up to 20
          quality: 0.8,
        };

        launchImageLibrary(options, async response => {
          if (response.didCancel) {
            console.log('User cancelled image picker');
            return;
          } else if (response.errorMessage) {
            console.log('Error picking image:', response.errorMessage);
            return;
          }

          const processedImages = [];

          for (const asset of response.assets) {
            let photoObj = {
              id: Date.now().toString() + Math.random().toString(),
              uri: asset.uri,
              fileName: asset.fileName || `photo_${Date.now()}.jpg`,
              type: asset.type,
            };

            // Check if compression is needed
            const imageSizeMB = asset.fileSize / (1024 * 1024);
            console.log(
              'Before compression - Image size:',
              imageSizeMB.toFixed(2),
              'MB',
            );

            if (imageSizeMB > MAX_SIZE_MB) {
              const compressedImage = await compressImage(photoObj);
              if (compressedImage) {
                // Get compressed file size
                const response = await fetch(compressedImage.fileUrl);
                const blob = await response.blob();
                const compressedSizeMB = blob.size / (1024 * 1024);
                console.log(
                  'After compression - Image size:',
                  compressedSizeMB.toFixed(2),
                  'MB',
                );

                photoObj = {
                  ...photoObj,
                  uri: compressedImage.fileUrl,
                  fileName: compressedImage.fileName,
                  type: compressedImage.fileType,
                };
              }
            }
            processedImages.push(photoObj);
          }

          if (processedImages.length > 0) {
            handleUploadUserImg(processedImages);
          }
        });
      } catch (error) {
        console.log('Error picking image:', error);
      }
    }
  };

  const handleCameraClick = async () => {
    const hasPermission = await requestPermissions('camera');
    if (hasPermission) {
      try {
        if (photos.length >= 20) {
          Toast.show({
            type: 'error',
            text1: 'Maximum photos reached',
            text2: 'You can only add up to 20 photos',
          });
          return;
        }

        const options = {
          mediaType: 'photo',
          quality: 0.8,
          saveToPhotos: true,
        };

        launchCamera(options, async response => {
          if (response.didCancel) {
            console.log('User cancelled camera');
            return;
          } else if (response.errorMessage) {
            console.log('Error in camera process:', response.errorMessage);
            return;
          }

          const asset = response.assets[0];
          let photoObj = {
            id: Date.now().toString() + Math.random().toString(),
            uri: asset.uri,
            fileName: `photo_${Date.now()}.jpg`,
            type: asset.type,
          };

          // Check if compression is needed
          const imageSizeMB = asset.fileSize / (1024 * 1024);
          console.log(
            'Before compression - Image size:',
            imageSizeMB.toFixed(2),
            'MB',
          );

          if (imageSizeMB > MAX_SIZE_MB) {
            const compressedImage = await compressImage(photoObj);
            if (compressedImage) {
              // Get compressed file size
              const response = await fetch(compressedImage.fileUrl);
              const blob = await response.blob();
              const compressedSizeMB = blob.size / (1024 * 1024);
              console.log(
                'After compression - Image size:',
                compressedSizeMB.toFixed(2),
                'MB',
              );

              photoObj = {
                ...photoObj,
                uri: compressedImage.fileUrl,
                fileName: compressedImage.fileName,
                type: compressedImage.fileType,
              };
            }
          }

          handleUploadUserImg([photoObj]);
        });
      } catch (error) {
        console.log('Error in camera process:', error);
      }
    }
  };

  const handleUploadUserImg = async selectedPhotos => {
    setIsLoading(true);
    const uploadedPhotos = [];

    for (const photo of selectedPhotos) {
      const formData = new FormData();
      formData.append('file', {
        uri: photo.uri,
        type: photo.type || 'image/jpeg',
        name: photo.fileName || `photo_${Date.now()}.jpg`,
      });

      try {
        const uploadResult = await imageUploadRequest(
          API_ENDPOINTS.file.fileUpload,
          formData,
        );
        console.log('Upload result:', uploadResult);
        if (uploadResult.success) {
          const data = uploadResult?.data;
          if (Array.isArray(data)) {
            uploadedPhotos.push(...data);
          } else if (data && typeof data === 'object') {
            uploadedPhotos.push(data);
          }
        } else {
          setErr(true);
          setErrMsg(uploadResult.error);
        }
      } catch (error) {
        console.log('Upload error:', error);
        setErr(true);
        setErrMsg(error.message || 'Upload failed');
      }
    }

    // Update photos state with all uploaded images
    setPhotos(prevPhotos => [...prevPhotos, ...uploadedPhotos]);
    setIsLoading(false);
  };

  const deletePhoto = index => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    setPhotos(updatedPhotos);
  };

  const showActionSheet = () => {
    actionSheetRef.current.show(); // Simply show the action sheet
  };

  const validationSchema = Yup.object().shape({
    note: Yup.string(),
  });

  const handleReturn = async values => {
    if (photos?.length === 0) {
      setPhotoError('At least one photo is required');
      return;
    }
    setIsLoading(true);
    const payload = {
      images: photos.map(photo => photo.fileName), // Use URIs for upload
      note: values.note,
      date: moment().format('YYYY-MM-DD hh:mm A'),
    };
    console.log('payload', payload);

    const response = await putRequest(
      `${API_ENDPOINTS.listingBookings.return}${id}`,
      payload,
    );

    if (response.success) {
      setIsLoading(false);
      if (Platform.OS === 'android') {
        navigation.replace('Home', {
          screen: 'Booking',
          params: {focused: true},
        });
      } else {
        navigation.navigate('Home', {
          screen: 'Booking',
          params: {focused: true},
        });
      }
      // setSelect(true);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Picked successfully.',
      });
    } else {
      setErr(true);
      setErrMsg(response.error);
    }
  };

  const renderPhoto = ({item, index}) => (
    <View style={styles.photoContainer}>
      <Image source={{uri: item?.path}} style={styles.photo} />
      <TouchableOpacity
        style={styles.deletePhotoIconContainer}
        onPress={() => deletePhoto(index)}>
        <Cross width={16} height={16} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader title={'Return Listing'} />
      {err && (
        <GeneralModal
          modalError={true}
          description={errMsg}
          Set_Modal_Visibilty={setErr}
          imageSource={<Checkmark width={38} height={38} />}
          handleNoPress={() => setErr(false)}
          noBtnTitle={'Dismiss'}
        />
      )}
      {isLoading && <ActivityIndicatorModal loaderIndicator={true} />}
      <Formik
        initialValues={{note: '', photos}}
        validationSchema={validationSchema}
        onSubmit={handleReturn}>
        {({handleChange, handleSubmit, values, errors, touched}) => (
          <>
            <ScrollView style={{marginHorizontal: 15}}>
              <Text style={styles.content}>
                Remember to take a picture with the listing at return for
                documentation.
              </Text>
              <View style={styles.parent}>
                <View style={styles.listWrapper}>
                  {/* Add Photo Button */}
                  <TouchableOpacity
                    style={[
                      styles.addPhotoButton,
                      photoError && {
                        borderColor: 'red',
                        borderWidth: 1,
                        borderStyle: 'solid',
                      },
                    ]}
                    onPress={() => showActionSheet(false)}>
                    <View style={{alignItems: 'center', gap: 6}}>
                      <Image
                        source={require('../../../assets/icons/imgadd.png')}
                        style={styles.addPhotoIcon}
                      />
                      <Text style={styles.phototext}>Upload Photo</Text>
                    </View>
                  </TouchableOpacity>

                  {photos?.length > 0 && (
                    <FlatList
                      data={photos}
                      renderItem={(item, index) => renderPhoto(item, index)}
                      keyExtractor={(item, index) => index.toString()}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    />
                  )}
                </View>
              </View>
              {photoError && (
                <Text allowFontScaling={false} style={styles.errorLabel}>
                  {photoError}
                </Text>
              )}
              <Text style={styles.pickup}>Return Note</Text>
              <TextInput
                allowFontScaling={false}
                placeholder="Enter Note"
                placeholderTextColor={'#DADADA'}
                style={[styles.message, {height: 96}]}
                multiline={true}
                textAlignVertical="top"
                value={values.note}
                onChangeText={handleChange('note')}
              />
              <TouchableOpacity
                style={[commonStyles.btnContainer, {marginTop: 20}]}
                onPress={handleSubmit}>
                <Text style={commonStyles.btnText}>Confirm Return</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* {select && (
              <GeneralModal
                modalSuccess={true}
                title={'Success'}
                description={'Picked successfully.'}
                imageSource={<Checkmark width={38} height={38} />}
                background={true}
                yesBtnTitle={'Dismiss'}
                handleYesPress={() => {
                  setSelect(false);
                  if (Platform.OS === 'android') {
                    navigation.replace('BottomTabBar', {
                      screen: 'Booking',
                      params: {focused: true},
                    });
                  } else {
                    navigation.navigate('BottomTabBar', {
                      screen: 'Booking',
                      params: {focused: true},
                    });
                  }
                }}
                Set_Modal_Visibilty={setSelect}
              />
            )} */}
            <ActionSheet
              ref={actionSheetRef}
              title={'Select Image'}
              options={options}
              cancelButtonIndex={2}
              onPress={index => {
                if (index === 0) handleCameraClick();
                else if (index === 1) handlePhotosClick();
              }}
            />
          </>
        )}
      </Formik>
    </SafeAreaView>
  );
};

export default ReturnListing;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    fontFamily: fonts.regular,
    color: colors.black,
    fontSize: 14,
  },
  pickup: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.black,
    marginTop: 15,
  },
  text: {
    fontFamily: fonts.regular,
    color: colors.white,
    fontSize: 14,
    marginTop: 25,
    lineHeight: 22,
  },
  parent: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },
  img: {
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    // alignSelf:'center',
    borderRadius: 20,
    right: 2,
    top: 3,
  },
  upload: {
    width: 71,
    height: 71,
    backgroundColor: '#383B45',
    borderRadius: 10,
    borderStyle: 'dotted',
    borderColor: '#A6A6A6',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txt: {
    color: '#C7C7C7',
    fontSize: 8,
    fontFamily: fonts.regular,
  },

  message: {
    height: 140,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.black,
    borderColor: colors.borderColor,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 18,
    marginTop: 10,
  },
  deletePhotoIcon: {
    width: 20,
    height: 20,
  },
  addPhotoButton: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#A6A6A6',
    borderWidth: 1,
    marginRight: 8,
    borderRadius: 10,
    borderStyle: 'dotted',
    backgroundColor: colors.whiteGray,
  },
  addPhotoIcon: {
    width: 21,
    height: 21,
    tintColor: '#8F8F8F',
  },
  phototext: {
    color: '#797979',
    fontFamily: fonts.regular,
    fontSize: 11,
  },
  listWrapper: {
    flexDirection: 'row',
    //marginTop: 20,
    gap: 2,
  },
  photoContainer: {
    marginRight: 10,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  deletePhotoIconContainer: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: colors.primary,
    borderRadius: 5,
  },
  deletePhotoIcon: {
    width: 14,
    height: 14,
  },
  errorLabel: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 19,
    color: colors.red,
    marginTop: 5,
  },
});
