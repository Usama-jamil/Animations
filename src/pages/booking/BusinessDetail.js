import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import React, { useState } from 'react';
import CustomHeader from '../../components/header/CustomHeader';
import ServiceDetailsImage from '../../../assets/images/service-detail.png';
import { colors, fontSizes, fonts } from '../../utils/styles';
import global from '../../../assets/icons/booking/globe-alt.png';
import Facebook from '../../../assets/icons/booking/Facebook.png';
import Instagram from '../../../assets/icons/booking/instagram.png';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS, getRequest } from '../../utils/apiService';
import { useFocusEffect } from '@react-navigation/native';
import GeneralModal from '../../components/modal/GeneralModal';
import FastImage from 'react-native-fast-image';
import CountryFlag from 'react-native-country-flag';

const BusinessDetail = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { id } = route.params;

  const [loading, setloading] = useState(false);
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [businessDetails, SetbusinessDetails] = useState({});

  console.log('business details data', businessDetails);
  console.log('id', id);

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [id]),
  );

  const fetchData = async () => {
    setloading(true);
    const result = await getRequest(
      `${API_ENDPOINTS.business.getSingle}/${id}`,
    );
    setloading(false);
    if (result.success) {
      SetbusinessDetails(result?.data);
    } else {
      setErr(true);
      setErrMsg(result.error);
    }
  };

  const openURL = url => {
    if (!url) {
      Alert.alert('Error', 'The URL is  empty.');
      return;
    }

    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
    Linking.openURL(formattedUrl).catch(err => {
      console.log('An error occurred', err);
      Alert.alert("Couldn't load page", err.message);
    });
  };

  const socialLinks = businessDetails?.socialLinks || {};
  console.log('social links', socialLinks);

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader title={t('details')} />
      {err && (
        <GeneralModal
          modalError={true}
          description={errMsg}
          Set_Modal_Visibilty={setErr}
        />
      )}

      {loading ? (
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
            style={{ marginHorizontal: 10 }}
            showsVerticalScrollIndicator={false}>
            <FastImage source={ServiceDetailsImage} style={styles.image} />

            <View
              style={[
                styles.card,
                { marginTop: 20, backgroundColor: colors.whiteGray },
              ]}>
              <View style={[styles.section, { marginTop: 0 }]}>
                <Text allowFontScaling={false} style={styles.cardtitle}>
                  {t('businessName')}
                </Text>
                <Text allowFontScaling={false} style={styles.subtitle}>
                  {businessDetails?.business?.name}
                </Text>
              </View>

              <View style={styles.section}>
                <Text allowFontScaling={false} style={styles.cardtitle}>
                  {t('contactNumber')}
                </Text>

                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                  {businessDetails?.flag && (
                    <CountryFlag
                      isoCode={businessDetails?.flag}
                      style={styles.flagIcon}
                      size={20}
                    />
                  )}

                  <Text allowFontScaling={false} style={styles.subtitle}>
                    {businessDetails?.contactNumber}
                  </Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text allowFontScaling={false} style={styles.cardtitle}>
                  {t('category')}
                </Text>
                {businessDetails?.categories?.map(data => (
                  <Text allowFontScaling={false} style={styles.subtitle}>
                    {data?.name}
                  </Text>
                ))}
              </View>

              <View style={styles.section}>
                <Text allowFontScaling={false} style={styles.cardtitle}>
                  {t('genderPreference')}
                </Text>
                <Text allowFontScaling={false} style={styles.subtitle}>
                  {businessDetails?.gender}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.card,
                { backgroundColor: colors.whiteGray, marginTop: 20 },
              ]}>
              <View style={[styles.section, { marginTop: 0 }]}>
                <Text allowFontScaling={false} style={styles.cardtitle}>
                  {t('website')}
                </Text>
                <Pressable
                  onPress={() =>
                    openURL(businessDetails?.socialLinks?.website)
                  }>
                  <Text allowFontScaling={false} style={styles.subtitle}>
                    {businessDetails?.socialLinks?.website}
                  </Text>
                </Pressable>
              </View>

              <View style={styles.section}>
                <Text allowFontScaling={false} style={styles.cardtitle}>
                  {t('location')}
                </Text>
                <Text allowFontScaling={false} style={styles.subtitle}>
                  {businessDetails?.address?.line1}
                </Text>
              </View>
            </View>

            <View style={styles.socialIcons}>
              <Pressable
                onPress={() =>
                  navigation.navigate('OpeningHours', {
                    hours: businessDetails?.openingHours,
                  })
                }>
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.cardtitle,
                    {
                      color: colors.primary,
                      textDecorationColor: colors.primary,
                      textDecorationLine: 'underline',
                    },
                  ]}>
                  {t('openingHours')}
                </Text>
              </Pressable>
              <View style={styles.rowContainer}>
                {socialLinks.instagram ? (
                  <Pressable onPress={() => openURL(socialLinks.instagram)}>
                    <FastImage style={styles.socialImage} source={Instagram} />
                  </Pressable>
                ) : null}
                {socialLinks.facebook ? (
                  <Pressable onPress={() => openURL(socialLinks.facebook)}>
                    <FastImage style={styles.socialImage} source={Facebook} />
                  </Pressable>
                ) : null}
                {socialLinks.website ? (
                  <Pressable onPress={() => openURL(socialLinks.website)}>
                    <FastImage style={styles.socialImage} source={global} />
                  </Pressable>
                ) : null}
              </View>
            </View>
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
};

export default BusinessDetail;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  image: {
    height: 171,
    width: '100%',
    resizeMode: 'cover',
    borderRadius: 8,
  },
  card: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 15,
  },
  cardtitle: {
    fontSize: fontSizes.xSmall,
    fontFamily: fonts.medium,
    color: colors.black,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.lightBlack,
  },
  section: {
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
    paddingBottom: 10,
    marginTop: 10,
  },
  socialIcons: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginTop: 20,
  },
  socialImage: {
    width: 28,
    height: 28,
    resizeMode: 'cover',
  },
  flagIcon: {
    width: 30,
    height: 35,
    resizeMode: 'contain',
  },
});
