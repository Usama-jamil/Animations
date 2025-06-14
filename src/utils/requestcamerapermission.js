import { Platform, Alert, Linking } from "react-native";
import { PERMISSIONS, request, check, RESULTS } from "react-native-permissions";
import { Image as CompressImage } from "react-native-compressor";

export const useRequestPermissions = () => {
  const requestPermissions = async selection => {
    try {
      let permissionResult;
      if (Platform.OS === 'android') {
        switch (selection) {
          case 'camera':
            permissionResult = await check(PERMISSIONS.ANDROID.CAMERA);
            if (permissionResult !== RESULTS.GRANTED) {
              permissionResult = await request(PERMISSIONS.ANDROID.CAMERA);
            }
            break;
          case 'photos':
            if (Platform.Version >= 33) {
              permissionResult = await check(
                PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
              );
              if (permissionResult !== RESULTS.GRANTED) {
                permissionResult = await request(
                  PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
                );
              }
            } else {
              permissionResult = await check(
                PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
              );
              if (permissionResult !== RESULTS.GRANTED) {
                permissionResult = await request(
                  PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
                );
              }
            }
            break;
          default:
            return false;
        }
      } else if (Platform.OS === 'ios') {
        switch (selection) {
          case 'camera':
            permissionResult = await check(PERMISSIONS.IOS.CAMERA);
            if (permissionResult !== RESULTS.GRANTED) {
              permissionResult = await request(PERMISSIONS.IOS.CAMERA);
            }
            break;
          case 'photos':
            permissionResult = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);
            if (permissionResult !== RESULTS.GRANTED) {
              permissionResult = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
            }
            break;
          default:
            return false;
        }
      }

      switch (permissionResult) {
        case RESULTS.DENIED:
          let permissionType;
          switch (selection) {
            case 'camera':
              permissionType =
                'Your permission is required to access your camera.';
              break;
            case 'photos':
              permissionType =
                'Your permission is required to access your photos folder.';
              break;
            default:
              return false;
          }
          Alert.alert('Permission Denied:', permissionType);
          return false;
        case RESULTS.GRANTED:
          return true;
        case RESULTS.BLOCKED:
          Alert.alert(
            'Permission Blocked:',
            selection === 'camera'
              ? 'Camera access is blocked. Please enable it in the settings.'
              : selection === 'photos'
              ? 'Photo library access is blocked. Please enable it in the settings.'
              : '',
            [
              {text: 'Cancel', style: 'cancel'},
              {
                text: 'Open settings',
                onPress: () => Linking.openSettings(),
              },
            ],
          );
          return false;
        default:
          return false;
      }
    } catch (error) {
      return false;
    }
  };

  return requestPermissions;
};

export const compressImage = async (image) => {
  try {
    const compressedImageUri = await CompressImage?.compress(image?.uri, {
      compressionMethod: "auto",
    });
    return {
      fileUrl: compressedImageUri,
      fileName: image?.fileName,
      fileType: image?.type,
    };
  } catch (error) {
    return image;
  }
};



export const compressIfNeeded = async photoObj => {

  // Calculate original image size in MB
  const fileSizeBytes = photoObj.fileSize || photoObj.size || 0;
  const originalSizeMB = fileSizeBytes / (1024 * 1024);
  console.log('Original image size:', originalSizeMB.toFixed(2), 'MB');

  if (originalSizeMB > MAX_SIZE_MB) {
    const compressedImage = await compressImage(photoObj);
    if (compressedImage) {
      // Log compression success
      console.log('Image compressed successfully');

      // Try fetching compressed image size if fileUrl is available
      try {
        const response = await fetch(compressedImage.fileUrl);
        const blob = await response.blob();
        const compressedSizeMB = blob.size / (1024 * 1024);
        console.log('Compressed image size:', compressedSizeMB.toFixed(2), 'MB');
      } catch (error) {
        console.warn('Failed to fetch compressed image size:', error);
      }

      return {
        ...photoObj,
        uri: compressedImage.fileUrl,
        fileName: compressedImage.fileName,
        type: compressedImage.fileType,
      };
    }
  }

  // If no compression needed or compression failed, return original
  return photoObj;
};


export const MAX_SIZE_MB = 0.5;