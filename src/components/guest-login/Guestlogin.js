import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { useDispatch } from 'react-redux';
import { setAddresses, setSelectAddress } from '../../store/slices/location';
import { setUser } from '../../store/slices/user';
import { colors, commonStyles } from '../../utils/styles';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS, getRequest } from '../../utils/apiService';

const GuestLogin = ({ setIsLoading, setErr, setErrMsg }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const handleGuestLogin = async () => {
    setIsLoading(true);
    const result = await getRequest(API_ENDPOINTS.auth.guest);
    setIsLoading(false);
    if (result.success) {
      dispatch(setUser(result.data));
      dispatch(setAddresses(result.data.locations));
      dispatch(setSelectAddress(result.data.locations[0]));
    } else { 
      setErr(true);
      setErrMsg(result.error);
    }
  };

  return (
    <TouchableOpacity
      style={[
        commonStyles.btnContainer,
        { backgroundColor: colors.black, marginTop: 10 },
      ]}
      onPress={handleGuestLogin}>
      <Text allowFontScaling={false} style={commonStyles.btnText}>
        {t('continueAsGuest')}
      </Text>
    </TouchableOpacity>
  );
};

export default GuestLogin;
