import React, { useState } from 'react';
import {
  SafeAreaView,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
} from 'react-native';

// Component import
import GeneralModal from '../../components/modal/GeneralModal';
import CustomHeader from '../../components/header/CustomHeader';

// Third Party
import { useTranslation } from 'react-i18next';

// Styles
import { colors, fonts } from '../../utils/styles';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Assets
import ArrowIcon from '../../../assets/icons/arrow-right.svg';
import LogoutIcon from '../../../assets/icons/logout.svg';
import DeleteIcon from '../../../assets/icons/delete.svg';
import LogoutModalIcon from '../../../assets/icons/logout_modal.svg';
import CancelModalIcon from '../../../assets/icons/cancel_modal.svg';
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/slices/user';
import { useSelector } from 'react-redux';
import ActivityIndicatorModal from '../../components/modal/ActivityIndicatorModal';
import { API_ENDPOINTS, deleteRequest } from '../../utils/apiService';
import { postRequest } from '../../utils/apiService';
import {
  SetBranchId,
  SetProductEmpty,
  SetServiceBasedMembers,
  SetServiceEmpty,
  SetSubscriptionEmpty,
  SetWaitng,
} from '../../store/slices/cart';
import { addLocation, clearAddresses, setSelectAddress } from '../../store/slices/location';
const AccountManagement = ({ navigation }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Modal
  const [showModal, setShowModal] = useState(false);
  const [tappedBtnID, setTappedBtnID] = useState(null);


  const handleYesPress = async () => {
    setShowModal(!showModal);
    setIsLoading(true);

    // Helper function to clear user-related data and reset state
    const clearUserData = () => {
      dispatch(setUser(null));
      dispatch(SetProductEmpty([]));
      dispatch(SetServiceEmpty([]));
      dispatch(SetSubscriptionEmpty([]));
      dispatch(SetWaitng(false));
      dispatch(SetBranchId(''));
      dispatch(SetServiceBasedMembers([]));
      dispatch(clearAddresses());
      dispatch(setSelectAddress({}));
    };

    // Sign out from Google
    const signOutFromGoogle = async () => {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
    };

    try {
      let result;

      if (tappedBtnID === 1) {
        // For logout, clear data and sign out from Google before making the request
           setTimeout(() => {
            clearUserData();
          }, 500);
        await signOutFromGoogle();
        result = await postRequest(API_ENDPOINTS.auth.logout);
      } else {
        // For delete account, make the API call first, and then clear data and sign out only if successful
        result = await deleteRequest(`${API_ENDPOINTS.auth.delete}${user?._id}`);

        if (result.success) {
             setTimeout(() => {
            clearUserData();
          }, 500);
          await signOutFromGoogle();
        }
      }

      // Handle error response for delete request
      if (!result.success) {
        setErr(true);
        setErrMsg(result.error || 'An unexpected error occurred.');
      }
    } catch (error) {
      // Handle general API call error
      console.log('error',error)
      // setErr(true);
      // setErrMsg('An error occurred while processing the request.');
    } finally {
      setIsLoading(false);
    }
  };



  const handleCancelPress = () => {
    setShowModal(!showModal);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {isLoading && <ActivityIndicatorModal loaderIndicator={isLoading} />}
      {err && (
        <GeneralModal
          modalError={true}
          description={errMsg}
          Set_Modal_Visibilty={setErr}
        />
      )}
      <CustomHeader title={t('accountManagement')} />
      <TouchableOpacity
        style={styles.accountOptionContainer}
        onPress={() => {
          setTappedBtnID(1);
          setShowModal(true);
        }}>
        <LogoutIcon width={25} height={25} />
        <Text allowFontScaling={false} style={styles.accountOptionTitleText}>
          {t('logout')}
        </Text>
        <ArrowIcon width={25} height={25} />
      </TouchableOpacity>
      
      {!user?.isGuest && (
 <TouchableOpacity
 style={styles.accountOptionContainer}
 onPress={() => {
   setTappedBtnID(2);
   setShowModal(true);
 }}>
 <DeleteIcon width={25} height={25} />
 <Text allowFontScaling={false} style={styles.accountOptionTitleText}>
   {t('deleteAccount')}
 </Text>
 <ArrowIcon width={25} height={25} />
</TouchableOpacity>
      )}
     
      {showModal && (
        <GeneralModal
          modalSuccess={true}
          Set_Modal_Visibilty={setShowModal}
          imageSource={
            tappedBtnID === 1 ? (
              <LogoutModalIcon width={40} height={40} />
            ) : (
              <CancelModalIcon width={40} height={40} />
            )
          }
          title={tappedBtnID === 1 ? t('logout') : t('deleteAccount')}
          description={
            tappedBtnID === 1
              ? t('areYouSureLogout')
              : t('areSureDeleteAccount')
          }
          yesBtnTitle={tappedBtnID === 1 ? t('logout') : t('yes')}
          handleYesPress={handleYesPress}
          noBtnTitle={tappedBtnID === 1 ? t('dismiss') : t('no')}
          handleNoPress={handleCancelPress}
        />
      )}
    </SafeAreaView>
  );
};

export default AccountManagement;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  accountOptionContainer: {
    paddingVertical: 15,
    justifyContent: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    borderBottomColor: colors.borderGrey,
    borderBottomWidth: 1,
  },
  iconStyle: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  accountOptionTitleText: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    color: colors.black,
    marginLeft: 15,
    flex: 1,
  },
});
