import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';

// Third Party
import Icon from 'react-native-vector-icons/FontAwesome';
import auth from '@react-native-firebase/auth';
import { appleAuth } from '@invertase/react-native-apple-authentication';
// import { AnalyticsCutomEvent } from '../../utils/AnalyticsCutomEvent';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
// import {loginSocialUser, setUser} from '../../store/slices/user';
import ActivityIndicatorModal from '../modal/ActivityIndicatorModal';
import GeneralModal from '../modal/GeneralModal';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { colors, fonts } from '../../utils/styles';
import { API_ENDPOINTS, postRequest } from '../../utils/apiService';
import { getTimeZone } from 'react-native-localize';
import { setUser } from '../../store/slices/user';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { setAddresses, setSelectAddress } from '../../store/slices/location';

GoogleSignin.configure({
  webClientId:
    '49725877840-up3j9grcg7ginnjib75i9fpug42l2hf5.apps.googleusercontent.com',
});

const SocialLogin = ({ setIsLoading, setErr, setErrMsg }) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { fcmToken } = useSelector(state => state.auth);

  const { t } = useTranslation();

  const onAppleButtonPress = async () => {
    if (Platform.OS !== 'ios') {
      Toast.show({
        type: 'error',
        text1: t('Error'),
        text2: t('DeviceNotSupported'),
        text1Style: { fontSize: 16 },
        text2Style: { fontSize: 14 },
      });
    } else {
      try {
        // Start the sign-in request
        const appleAuthRequestResponse = await appleAuth.performRequest({
          requestedOperation: appleAuth.Operation.LOGIN,
          requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
        });
  
        // Ensure Apple returned a user identityToken
        if (!appleAuthRequestResponse.identityToken) {
          throw new Error('Apple Sign-In failed - no identity token returned');
        }
  
        // Extract values
        const { identityToken, nonce, fullName, email, user } =
          appleAuthRequestResponse;
  
        console.log('Apple fullName:', fullName,identityToken);
  
        // Check if fullName is null
        const userFullName =
          fullName?.givenName || fullName?.familyName
            ? `${fullName.givenName || ''} ${fullName.familyName || ''}`.trim()
            : 'Apple User';
  
        // Generate an email if Apple does not provide one
        const generatedEmail = email
          ? email
          : `${user}@appleuser.firebaseapp.com`; // Unique email
  
        // Create Firebase Apple credential
        const appleCredential = auth.AppleAuthProvider.credential(
          identityToken,
          nonce
        );
  
  
        const data = {
          social_id: user,
          social_type: 'apple',
          device_id: fcmToken || '',
          device_type: Platform?.OS,
          timezone: getTimeZone(),
          name: userFullName, // Use the fallback name if null
          email: generatedEmail,
          user_type: '1',
        };
  
        console.log('User Data:', data);
  
        // Send data to backend
        const result = await postRequest(API_ENDPOINTS.auth.socialLogin, data);
  
        if (result.success) {
          dispatch(setUser(result.data));
          dispatch(setAddresses(result?.data?.locations));
          dispatch(setSelectAddress(result.data.locations[0]));
        } else {
          setErr(true);
          setErrMsg(result.error);
        }   
        return auth().signInWithCredential(appleCredential);      } catch (error) {
        console.error('Apple Sign-In Error:', error);
      }
    }
  };
  

  const onGoogleButtonPress = async () => {

    try {
      // Ensure Google Play services are available on the device
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Start the Google sign-in process
      const { idToken, user } = await GoogleSignin.signIn();

      // Create a Google credential using the ID token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Sign in with Firebase using the Google credentials
      const firebaseUserCredential = await auth().signInWithCredential(
        googleCredential,
      );
      setIsLoading(true);
      // Prepare the data for your API call
      const data = {
        social_id: googleCredential.token,
        social_type: 'google',
        device_id: fcmToken || '',
        device_type: Platform?.OS,
        timezone: getTimeZone(),
        name: user.name,
        email: user.email,
        user_type: '1',
      };

      // Call your backend API

      const result = await postRequest(API_ENDPOINTS.auth.socialLogin, data);
      setIsLoading(false);

      if (result.success) {
        // Dispatch action to set the user in your app state
        dispatch(setUser(result.data));
        console.log('location', result?.data?.locations)
        dispatch(setAddresses(result?.data?.locations));
        dispatch(setSelectAddress(result.data.locations[0]));

      } else {
        setErr(true);
        setErrMsg(result.error);
      }
    } catch (error) {
      console.log('Google Sign-In Error:', error);

      // Handle common errors during Google sign-in
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // User cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // Operation (e.g. sign-in) is in progress
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // Play services are not available or outdated
      } else {
        // Some other error occurred
        // setErr(true);
        // setErrMsg('Google Sign-In failed. Please try again later.');
        console.error('Apple Sign-In Error:', error);
        throw error; // Rethrow the error to handle it in the calling code
      }
    }
  };

  return (
    <View style={{ marginVertical: 20 }}>
      <View style={styles.divider}>
        <View style={styles.dividerTextContainer}>
          <View style={styles.rectangular}></View>
          <Text allowFontScaling={false} style={styles.dividerText}>
            Or
          </Text>
          <View style={styles.rectangular}></View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.appleButton, { flexDirection: 'row' }]}
        onPress={onGoogleButtonPress}>
        <Image
          source={require('../../../assets/images/google.png')}
          style={styles.img}
        />
        <Text
          allowFontScaling={false}
          style={[
            styles.buttonText,
            { color: colors.black, fontFamily: fonts.medium },
          ]}>
          {t('signInWithGoogle')}
        </Text>
      </TouchableOpacity>
      {Platform.OS === 'ios' && (
        <TouchableOpacity
          style={[styles.appleButton]}
          onPress={onAppleButtonPress}>
          <Icon name="apple" size={28} color="#000000" style={styles.inputIcon} />
          <Text
            allowFontScaling={false}
            style={[
              styles.buttonText,
              { color: colors.black, fontFamily: fonts.medium },
            ]}>
            {t('signInWithApple')}
          </Text>
        </TouchableOpacity>

      )}


    </View>
  );
};

export default SocialLogin;

const styles = StyleSheet.create({
  googleButton: {
    height: 56,
    backgroundColor: 'tranparent',
    borderWidth: 1,
    borderColor: colors.borderGrey,
    borderRadius: 16,
    justifyContent: 'center',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  appleButton: {
    height: 56,
    backgroundColor: 'tranparent',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    borderRadius: 16,
    justifyContent: 'center',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Divider line style
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 10,
  },
  dividerText: {
    width: '10%',
    color: '#CCCCCC',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: fonts.regular
  },
  img: {
    width: 28,
    height: 28,
    marginRight: 30,
  },
  inputIcon: {
    marginRight: 30,
  },
  rectangular: {
    borderRadius: 100,
    borderWidth: 1,
    width: '45%',
    borderColor: colors.borderGrey,
  },
});
