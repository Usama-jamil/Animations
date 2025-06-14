import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import React, {useState} from 'react';
import CustomHeader from '../header/CustomHeader';
import {colors, fonts} from '../../utils/styles';
import Plus from '../../../assets/icons/plus.svg';
import {useTranslation} from 'react-i18next';
import CardManagementCard from '../card-Management/CardManagement';
import {useFocusEffect} from '@react-navigation/native';
import {API_ENDPOINTS, getRequest} from '../../utils/apiService';
import {useDispatch, useSelector} from 'react-redux';
import {
  setLoading,
  setErrorMessage,
  setError,
} from '../../store/slices/paymentmethod';
import GeneralModal from '../modal/GeneralModal';
import GuestModal from '../guest-modal/GuestModal';
const CardManagement = ({navigation}) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const {isLoading, error, errorMessage} = useSelector(state => state.payment);
  const [cardData, setCardData] = useState([]);
  const [err, seterr] = useState(false);
  const [showPopUp, setShowPopUp] = useState(false);
  const {user} = useSelector(state => state.auth);

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, []),
  );

  const fetchData = async () => {
    dispatch(setLoading(true));
    const result = await getRequest(API_ENDPOINTS.cardManagement.payment);
    dispatch(setLoading(false));
    if (result.success) {
      setCardData(result?.data);
    } else {
      console.log('error');
      seterr(true);
      dispatch(setErrorMessage(result.error));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader title={t('cardManagement')} />
      {err && (
        <GeneralModal
          modalError={true}
          description={errorMessage}
          Set_Modal_Visibilty={seterr}
        />
      )}
      {showPopUp && (
        <GuestModal showPopUp={showPopUp} setShowPopUp={setShowPopUp} />
      )}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size={'large'} color={colors.primary} />
        </View>
      ) : (
        <>
          <ScrollView
            style={{marginHorizontal: 10}}
            showsVerticalScrollIndicator={false}>
            <Text allowFontScaling={false} style={styles.title}>
              {t('linkedCard')}
            </Text>

            <CardManagementCard
              data={cardData}
              seterr={seterr}
              setData={setCardData}
            />
          </ScrollView>
          <View
            style={{
              position: 'absolute',
              bottom: 40,
              right: 20,
            }}>
            <TouchableOpacity
              onPress={() =>
                !user?.isGuest
                  ? navigation.navigate('AttachCards')
                  : setShowPopUp(true)
              }>
              <View
                style={{
                  width: 54,
                  height: 54,
                  backgroundColor: colors.primary,
                  borderRadius: 30,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Plus width={24} height={24} />
              </View>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

export default CardManagement;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 15,
    fontFamily: fonts.medium,
    color: colors.black,
  },
});
