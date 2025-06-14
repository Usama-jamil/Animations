import React, {useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Image,
  Linking,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {colors, commonStyles, fonts} from '../../utils/styles';
import PhoneIcon from '../../../assets/icons/phone.svg';
import CustomHeader from '../../components/header/CustomHeader';
import {useFocusEffect} from '@react-navigation/native';
import {API_ENDPOINTS, getRequest} from '../../utils/apiService';
import GeneralModal from '../../components/modal/GeneralModal';
import CountryFlag from 'react-native-country-flag';
import UserAvatar from 'react-native-user-avatar';
import { useSelector } from 'react-redux';
import GuestModal from '../../components/guest-modal/GuestModal';

const Profile = ({navigation}) => {
  const {t} = useTranslation();
  const [User, setUser] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [error, setError] = useState(false);
    const [guestPopUp, setGuestPopUp] = useState(false);
    const {user} = useSelector(state => state.auth);

  console.log('user',User)

  const defaultImageUrl = 'https://timezzi-bucket.s3.amazonaws.com/noImg.png';
  console.log('image', User);

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
    } else {
      console.log('error');
      setErr(true);
      setErrMsg(result.error);
    }
  };

  const handleCallPress = () => {
    if (User?.mobile) {
      Linking.openURL(`tel:${User.mobile}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title={t('profile')} />
      {err && (
        <GeneralModal
          modalError={true}
          description={errMsg}
          Set_Modal_Visibilty={setErr}
        />
      )}
{guestPopUp && (
        <GuestModal showPopUp={guestPopUp} setShowPopUp={setGuestPopUp} />
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
          <ScrollView
            contentContainerStyle={{paddingBottom: 100}}
            showsVerticalScrollIndicator={false}>
            <View style={{marginHorizontal: 10}}>
              <View style={styles.outsidecircle}>
                <View style={styles.circle}>
                  <View style={styles.insideCircle}>
                    <View style={styles.iconContainer}>
                      {User &&
                      User?.image &&
                      User.image.trim() !== defaultImageUrl.trim() &&
                      !error ? (
                        <Image
                          source={{
                            uri: User?.image,
                          }}
                          width={74}
                          height={74}
                          style={{borderRadius: 74/2}}
                          resizeMode="cover"
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
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.name}>
                <Text allowFontScaling={false} style={styles.txt}>
                  {t('fullName')}
                </Text>
                <Text allowFontScaling={false} style={styles.insidetxt}>
                  {User?.name}
                </Text>
                <View style={styles.line} />
              </View>

              <View style={styles.name}>
                <View style={styles.phoneIcon}>
                  <Text allowFontScaling={false} style={styles.txt}>
                    {t('contactNumber')}
                  </Text>
                  <TouchableOpacity onPress={handleCallPress}>
                    <PhoneIcon />
                  </TouchableOpacity>
                </View>
                <View style={styles.flag}>
                  {User?.flag && (
                    <CountryFlag
                      isoCode={User?.flag}
                      style={styles.flagIcon}
                      size={20}
                    />
                  )}
                  <Text allowFontScaling={false} style={styles.insidetxt}>
                    {User?.mobile}
                  </Text>
                </View>

                <View style={styles.line} />
              </View>

              <View style={styles.name}>
                <Text allowFontScaling={false} style={styles.txt}>
                  {t('emailAddress')}
                </Text>
                <Text allowFontScaling={false} style={styles.insidetxt}>
                  {User?.email}
                </Text>
                <View style={styles.line} />
              </View>
              {User?.address && (
                <View style={styles.name}>
                  <Text allowFontScaling={false} style={styles.txt}>
                    {t('homeAddress')}
                  </Text>
                  <Text allowFontScaling={false} style={styles.insidetxt}>
                    {User?.address?.line1}
                  </Text>
                  <View style={styles.line} />
                </View>
              )}
            </View>
          </ScrollView>
          <TouchableOpacity
            style={[
              commonStyles.btnContainer,
              {marginHorizontal: 10, marginBottom: 20},
            ]}
            onPress={() => !user?.isGuest ? navigation.navigate('HomeAddress', {state: false}) : setGuestPopUp(true)}>
            <Text allowFontScaling={false} style={commonStyles.btnText}>
              {t('addHomeAddress')}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headProfile: {
    flexDirection: 'row',
    gap: 33,
  },
  labelStyle: {
    fontFamily: fonts.semiBold,
    color: colors.black,
    fontSize: 18,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 32,
  },
  outsidecircle: {
    borderWidth: 1,
    marginTop: 40,
    alignSelf: 'center',
    borderRadius: 70,
    padding: 7,
    width: 107,
    height: 107,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: colors.borderGrey,
  },
  circle: {
    borderWidth: 1,
    borderRadius: 50,
    padding: 7,
    width: 95,
    height: 95,
    borderColor: colors.borderGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insideCircle: {
    borderWidth: 1,
    width: 81,
    height: 81,
    borderRadius: 45,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    position: 'absolute',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: colors.primary,

    alignItems: 'center',
    borderRadius: 10,
    marginHorizontal: 10,
    marginBottom: 10,
    justifyContent: 'center',
  },

  txt: {
    fontFamily: fonts.medium,
    color: colors.black,
    fontSize: 15,
  },
  insideText: {
    fontFamily: fonts.regular,
    color: colors.background,
    fontSize: 14,
  },
  name: {
    marginTop: 25,
  },
  line: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.borderGrey,
  },
  phoneIcon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  flag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  insidetxt: {
    color: colors.lightBlack,
    fontSize: 14,
    fontFamily: fonts.medium,
    marginTop: 10,
  },
  insidebtn: {
    fontSize: 12,
    color: colors.background,
    fontFamily: fonts.regular,
  },
  flagIcon: {
    width: 30,
    height: 35,
    resizeMode: 'contain',
    marginTop: 4,
  },
});
