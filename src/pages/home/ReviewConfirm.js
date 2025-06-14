import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import CustomHeader from '../../components/header/CustomHeader';
import {useTranslation} from 'react-i18next';
import {colors, fontSizes, fonts} from '../../utils/styles';

// Asset
import Location from '../../../assets/icons/location-pin.svg';
import Star from '../../../assets/icons/light_star.svg';
import Calender from '../../../assets/icons/calendar.svg';
import Clock from '../../../assets/icons/clock_Black.svg';
import Gift from '../../../assets/icons/gift_purple.svg';
import Cross from '../../../assets/icons/more/cancel.svg';

import Review from '../../components/review-confirm/Review';
import {useCallback} from 'react';
import {commonStyles} from '../../utils/styles';
import {useSelector} from 'react-redux';
import moment from 'moment';
import {useFocusEffect} from '@react-navigation/native';
import {getRequest, API_ENDPOINTS} from '../../utils/apiService';
import GeneralModal from '../../components/modal/GeneralModal';
import Toast from 'react-native-toast-message';
import FastImage from 'react-native-fast-image';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useBookingConfirmCalculation} from '../../components/service-details/useBookingConfirm';

const ReviewConfirm = ({route, navigation}) => {
  const {t} = useTranslation();
  const {
    selectTime,
    selectdate,
    branchid,
    currencyCode,
    activeRadio,
    fare,
    selectServies,
    SelectedProducts,
    selectBundles,
    selectBogo,
  } = useSelector(state => state.cart);

  const data = route?.params?.data || [];

  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [SingleBusiness, setSingleBusiness] = useState(null);
  const [note, setnote] = useState('');
  const [discountCode, setdiscountCode] = useState('');
  const [giftCode, setgiftCode] = useState('');
  const [discountError, setdiscountError] = useState(null);
  const [giftError, setgiftError] = useState(null);
  const [giftCards, setGiftCards] = useState([]);
  const [subscriptionData, setSubscriptionData] = useState([]);
  const [errMsg, setErrMsg] = useState('');
  const [discountId, setDiscountId] = useState('');
  const [giftCardId, setGiftCardId] = useState('');
  const [selectedGiftCards, setSelectedGiftCards] = useState([]);
  const [firstCompaignId, setFirstCompaignId] = useState(null); // Changed to store just the ID
  const [Bookingdata, setBookingData] = useState(null);

  const {fetchCalculation} = useBookingConfirmCalculation({
    selectServies,
    SelectedProducts,
    branchid,
    activeRadio,
    fare,
    selectBundles,
    selectBogo,
    firstCompaignId,
    discountId,
    giftCardId,
    selectedGiftCards,
  });

  console.log('Calculatedata', Bookingdata);

  useFocusEffect(
    useCallback(() => {
      fetchAllData();
    }, []),
  );

  useEffect(() => {
    const calculate = async () => {
      const result = await fetchCalculation();
      if (result.success) {
        setBookingData(result.data);
      } else {
        setErr(true);
        setErrMsg(result.error);
      }
    };
    calculate();
  }, [firstCompaignId, discountId, giftCardId, selectedGiftCards]);

  useEffect(() => {
    if (data && data.length > 0) {
      setSelectedGiftCards(data);
    }
  }, [data]);

  const fetchAllData = async () => {
    setIsLoading(true);

    try {
      const [
        businessResult,
        giftCardsResult,
        subscriptionResult,
        compaignData,
      ] = await Promise.allSettled([
        getRequest(`${API_ENDPOINTS.business.getSingle}/${branchid}`),
        getRequest(
          `${API_ENDPOINTS.giftCards.getAll}?branch=${branchid}&applyFor=${bookingFor}`,
        ),
        getRequest(
          `${API_ENDPOINTS.subscriptionBusiness.getAll}?branch=${branchid}`,
        ),
        getRequest(`${API_ENDPOINTS.compaigns.getAll}?branch=${branchid}`),
      ]);

      // Handle Business Data
      if (
        businessResult.status === 'fulfilled' &&
        businessResult.value.success
      ) {
        setSingleBusiness(businessResult.value.data);
      } else {
        setErr(true);
        setErrMsg(
          businessResult.reason?.error || 'Failed to fetch business details',
        );
      }

      // Handle Gift Cards Data
      if (
        giftCardsResult.status === 'fulfilled' &&
        giftCardsResult.value.success
      ) {
        setGiftCards(giftCardsResult.value.data.data);
      } else {
        setErr(true);
        setErrMsg(
          giftCardsResult.reason?.error || 'Failed to fetch gift cards',
        );
      }

      // Handle Subscription Data
      if (
        subscriptionResult.status === 'fulfilled' &&
        subscriptionResult.value.success
      ) {
        setSubscriptionData(subscriptionResult.value.data);
      } else {
        setErr(true);
        setErrMsg(
          subscriptionResult.reason?.error ||
            'Failed to fetch subscription data',
        );
      }

      // Handle Campaign Data
      if (compaignData.status === 'fulfilled' && compaignData.value.success) {
        const firstPurchaseCampaign = compaignData.value.data.data?.find(
          campaign => campaign?.type === 'firstPurchase',
        );
        setFirstCompaignId(firstPurchaseCampaign?._id || null);
      } else {
        setErr(true);
        setErrMsg(
          compaignData.reason?.error || 'Failed to fetch subscription data',
        );
      }
    } catch (error) {
      console.log('error', error);
      setErr(true);
      setErrMsg('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const ApplyDiscountCode = async () => {
    if (!discountCode) {
      setdiscountError(t('discountCodeRequired'));
    } else {
      setIsLoading(true);
      const endpoint = `${API_ENDPOINTS.discount.applyCode}?code=${discountCode}&branch=${branchid}&applyFor=${bookingFor}`;
      const result = await getRequest(endpoint);
      setIsLoading(false);
      if (result.success) {
        if (result?.data?.amount > Bookingdata?.receipt?.total) {
          Toast.show({
            type: 'error',
            position: 'top',
            bottomOffset: 20,
            text1: t('discountError'),
            text2: t('discountGreaterThanTotal'),
            visibilityTime: 4000,
          });
        } else {
          setDiscountId(result?.data?._id);
          Toast.show({
            type: 'success',
            position: 'top',
            bottomOffset: 20,
            text1: t('success'),
            text2: t('discountAppliedSuccessfully'),
            visibilityTime: 3000,
          });
        }
      } else {
        setErr(true);
        setErrMsg(result.error);
      }
    }
  };

  const ApplyGiftCode = async () => {
    if (!giftCode) {
      setgiftError(t('giftCodeRequired'));
    } else {
      setIsLoading(true);
      const endpoint = `${API_ENDPOINTS.giftCards.applyCode}?code=${giftCode}&branch=${branchid}&applyFor=${bookingFor}`;
      const result = await getRequest(endpoint);
      setIsLoading(false);
      console.log('data', result?.data?.amount);
      if (result.success) {
        if (result?.data?.amount > Bookingdata?.receipt?.total) {
          Toast.show({
            type: 'error',
            position: 'top',
            bottomOffset: 20,
            text1: t('giftCodeError'),
            text2: t('giftCodeGreaterThanTotal'),
            visibilityTime: 4000,
          });
        } else {
          setGiftCardId(result?.data?._id);
          Toast.show({
            type: 'success',
            position: 'top',
            bottomOffset: 20,
            text1: t('success'),
            text2: t('giftCodeAppliedSuccessfully'),
            visibilityTime: 3000,
          });
        }
      } else {
        setErr(true);
        setErrMsg(result.error);
      }
    }
  };

  const handleNext = () => {
    navigation.navigate('PayNow', {
      notes: note,
      total: Bookingdata?.receipt?.total,
      giftCards: data,
      businessSubscription: subscriptionData[0],
      firstcomapignid: firstCompaignId,
      giftCardId,
      discountId,
    });
  };
  const bookingFor = activeRadio === 'HomeService' ? 'homeservice' : 'inplace';

  console.log('data', data);

  const handleRemoveGiftCard = id => {
    console.log('id', id);
    // Remove the selected gift card by filtering it out
    const updatedGiftCards = selectedGiftCards.filter(card => card._id !== id);
    console.log('updatedGiftCards', updatedGiftCards);
    setSelectedGiftCards(updatedGiftCards);
    // Show success toast message
    Toast.show({
      type: 'success',
      position: 'top',
      bottomOffset: 20,
      text1: t('success'),
      text2: t('giftCardRemovedSuccessfully'),
      visibilityTime: 3000,
    });
  };

  const removeDiscount = () => {
    setdiscountCode(''); // Clear discount code
    setDiscountId(''); // Clear discount ID
    Toast.show({
      type: 'success',
      position: 'top',
      text1: t('success'),
      text2: t('discountRemovedSuccessfully'),
      visibilityTime: 3000,
    });
  };

  // Function to remove gift card
  const removeGiftCard = () => {
    setgiftCode(''); // Clear gift card code
    setGiftCardId(''); // Clear gift card ID
    Toast.show({
      type: 'success',
      position: 'top',
      text1: t('success'),
      text2: t('giftCardRemovedSuccessfully'),
      visibilityTime: 3000,
    });
  };

  const campaignDiscount =
    Array.isArray(Bookingdata?.receipt?.compaigns) &&
    Bookingdata?.receipt?.compaigns?.length > 0
      ? Bookingdata?.receipt?.compaigns?.reduce(
          (acc, campaign) => acc + (campaign?.discount || 0),
          0,
        ) // Sum all campaign discounts
      : Bookingdata?.receipt?.compaigns?.[0]?.discount || 0; // If there's only one campaign, use its discount

  const generalDiscount = Bookingdata?.receipt?.discount || 0;
  const giftDiscount = Bookingdata?.receipt?.giftcard || 0;
  const totalDiscount = Bookingdata?.receipt?.discounts || 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader title={t('reviewandConfirm')} />

      {err && (
        <GeneralModal
          modalError={true}
          description={errMsg}
          Set_Modal_Visibilty={setErr}
        />
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
        <KeyboardAwareScrollView
          contentContainerStyle={{flex: 1}}
          enableAutomaticScroll
          extraScrollHeight={20}>
          <ScrollView
            style={{marginHorizontal: 10}}
            showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <FastImage
                source={{uri: SingleBusiness?.image}}
                style={styles.Image}
              />

              <View style={{flex: 1}}>
                <Text allowFontScaling={false} style={styles.headerTitle}>
                  {SingleBusiness?.name}
                </Text>
                <View
                  style={[
                    styles.rowContainer,
                    {marginVertical: 5, alignItems: 'flex-start'},
                  ]}>
                  <Location width={18} height={18} />

                  <Text allowFontScaling={false} style={styles.locationText}>
                    {SingleBusiness?.address?.line1}
                  </Text>
                </View>

                <View style={styles.rowContainer}>
                  <Star width={24} height={24} />

                  <Text allowFontScaling={false} style={styles.starText}>
                    {SingleBusiness?.averageRating?.toFixed(1)} (
                    {SingleBusiness?.totalReviews})
                  </Text>
                </View>
              </View>
            </View>

            {selectdate &&
              selectdate.day &&
              selectdate.date &&
              selectdate.month &&
              selectdate.year && (
                <View
                  style={[
                    styles.rowContainer,
                    {marginVertical: 10, gap: 15, marginTop: 10},
                  ]}>
                  <Calender width={20} height={20} />
                  <Text allowFontScaling={false} style={styles.dateText}>
                    {selectdate.day} {selectdate.date} {selectdate.month}{' '}
                    {selectdate.year}
                  </Text>
                </View>
              )}

            {selectTime && selectTime.startTime && selectTime.endTime && (
              <View style={[styles.rowContainer, {gap: 15}]}>
                <Clock width={20} height={20} />
                <Text allowFontScaling={false} style={styles.dateText}>
                  {moment(selectTime.startTime).format('h:mm A')} -{' '}
                  {moment(selectTime.endTime).format('h:mm A')}
                </Text>
              </View>
            )}

            <Review data={Bookingdata} currencyCode={currencyCode} />
            {selectedGiftCards?.map(data => (
              <View style={[styles.card, {backgroundColor: colors.lightGreen}]}>
                <TouchableOpacity
                  onPress={() => handleRemoveGiftCard(data?._id, data?.amount)}
                  style={{alignSelf: 'flex-end'}}>
                  <Cross width={20} height={20} />
                </TouchableOpacity>
                <Text allowFontScaling={false} style={styles.title}>
                  {t('giftCards')}
                </Text>
                <View style={{alignSelf: 'flex-end'}}>
                  <Text allowFontScaling={false} style={styles.price}>
                    {data?.amount}
                    <Text allowFontScaling={false} style={styles.currency}>
                      {' '}
                      {currencyCode}
                    </Text>
                  </Text>
                </View>
                <Text
                  allowFontScaling={false}
                  style={[styles.currency, {fontSize: fontSizes.xSmall}]}>
                  {data?.code}
                </Text>
              </View>
            ))}

            <Text
              allowFontScaling={false}
              style={[styles.heading, {marginTop: 20}]}>
              {t('discount')}
            </Text>

            <View style={styles.input_container}>
              <TextInput
                allowFontScaling={false}
                placeholder={t('enterCode')}
                placeholderTextColor={colors.grey}
                style={styles.TextInput}
                autoCapitalize="none"
                value={discountCode}
                onChangeText={code => {
                  setdiscountCode(code);
                }}
              />
              <TouchableOpacity
                style={[
                  styles.apply_button,
                  Bookingdata?.receipt?.discount > 0 && {
                    backgroundColor: colors.warning,
                  },
                ]}
                onPress={
                  Bookingdata?.receipt?.discount > 0
                    ? removeDiscount
                    : ApplyDiscountCode
                }>
                <Text allowFontScaling={false} style={styles.apply_Text}>
                  {Bookingdata?.receipt?.discount > 0
                    ? t('remove')
                    : t('apply')}
                </Text>
              </TouchableOpacity>
            </View>
            {discountError && (
              <Text allowFontScaling={false} style={styles.errorLabel}>
                {discountError}
              </Text>
            )}

            <Text
              allowFontScaling={false}
              style={[styles.heading, {marginTop: 20}]}>
              {t('giftCard')}
            </Text>

            <View style={styles.input_container}>
              <TextInput
                allowFontScaling={false}
                placeholder={t('entergiftcard')}
                placeholderTextColor={colors.grey}
                autoCapitalize="none"
                style={styles.TextInput}
                value={giftCode}
                onChangeText={Code => {
                  setgiftCode(Code);
                }}
              />
              <TouchableOpacity
                style={[
                  styles.apply_button,
                  Bookingdata?.receipt?.giftcard > 0 && {
                    backgroundColor: colors.warning,
                  },
                ]}
                onPress={
                  Bookingdata?.receipt?.giftcard > 0
                    ? removeGiftCard
                    : ApplyGiftCode
                }>
                <Text allowFontScaling={false} style={styles.apply_Text}>
                  {Bookingdata?.receipt?.giftcard > 0
                    ? t('remove')
                    : t('apply')}
                </Text>
              </TouchableOpacity>
            </View>
            {giftError && (
              <Text allowFontScaling={false} style={styles.errorLabel}>
                {giftError}
              </Text>
            )}

            <View style={[styles.card, {marginTop: 20}]}>
              {fare > 0 && (
                <View
                  style={[
                    styles.rowContainer,
                    {justifyContent: 'space-between'},
                  ]}>
                  <Text allowFontScaling={false} style={styles.cardtitle}>
                    {t('fare')}
                  </Text>
                  <Text allowFontScaling={false} style={styles.Cardprice}>
                    {fare}{' '}
                    <Text allowFontScaling={false} style={styles.Cardcurrency}>
                      {' '}
                      {currencyCode}
                    </Text>
                  </Text>
                </View>
              )}

              <View
                style={[
                  styles.rowContainer,
                  {justifyContent: 'space-between'},
                ]}>
                <Text allowFontScaling={false} style={styles.cardtitle}>
                  {t('subtotal')}
                </Text>
                <Text allowFontScaling={false} style={styles.Cardprice}>
                  {Bookingdata?.receipt?.subTotal}
                  <Text allowFontScaling={false} style={styles.Cardcurrency}>
                    {' '}
                    {currencyCode}
                  </Text>
                </Text>
              </View>

              {Bookingdata?.receipt?.compaigns &&
                Bookingdata?.receipt?.compaigns?.length > 0 && (
                  <View
                    style={[
                      styles.rowContainer,
                      {justifyContent: 'space-between', marginTop: 10},
                    ]}>
                    <Text allowFontScaling={false} style={styles.cardtitle}>
                      {Bookingdata?.receipt?.compaigns?.[0]?.title}
                    </Text>
                    <Text
                      allowFontScaling={false}
                      style={[styles.cardtitle, {color: colors.primary}]}>
                      {campaignDiscount} {currencyCode}
                    </Text>
                  </View>
                )}
              {generalDiscount > 0 && (
                <View
                  style={[
                    styles.rowContainer,
                    {justifyContent: 'space-between', marginTop: 10},
                  ]}>
                  <Text allowFontScaling={false} style={styles.cardtitle}>
                    {t('discount')}
                  </Text>
                  <Text
                    allowFontScaling={false}
                    style={[styles.cardtitle, {color: colors.primary}]}>
                    {generalDiscount} {currencyCode}
                  </Text>
                </View>
              )}
              {giftDiscount > 0 && (
                <View
                  style={[
                    styles.rowContainer,
                    {justifyContent: 'space-between', marginTop: 10},
                  ]}>
                  <Text allowFontScaling={false} style={styles.cardtitle}>
                    {t('giftdiscount')}
                  </Text>
                  <Text
                    allowFontScaling={false}
                    style={[styles.cardtitle, {color: colors.primary}]}>
                    {giftDiscount} {currencyCode}
                  </Text>
                </View>
              )}

              {(generalDiscount > 0 || giftDiscount > 0) &&
                totalDiscount > 0 && (
                  <View
                    style={[
                      styles.rowContainer,
                      {justifyContent: 'space-between', marginTop: 10},
                    ]}>
                    <Text allowFontScaling={false} style={styles.cardtitle}>
                      {t('totalDiscount')}
                    </Text>
                    <Text
                      allowFontScaling={false}
                      style={[styles.cardtitle, {color: colors.primary}]}>
                      {totalDiscount} {currencyCode}
                    </Text>
                  </View>
                )}

              <View
                style={[
                  styles.rowContainer,
                  {justifyContent: 'space-between', marginTop: 10},
                ]}>
                <Text
                  allowFontScaling={false}
                  style={[styles.cardtitle, {color: colors.black}]}>
                  {t('total')}
                </Text>

                <Text
                  allowFontScaling={false}
                  style={[styles.Cardprice, {color: colors.primary}]}>
                  {Bookingdata?.receipt?.total}{' '}
                  <Text
                    allowFontScaling={false}
                    style={[styles.Cardcurrency, {color: colors.primary}]}>
                    {currencyCode}
                  </Text>
                </Text>
              </View>
            </View>

            <Text
              allowFontScaling={false}
              style={[styles.heading, {marginTop: 20}]}>
              {t('bookingNotes')}
            </Text>

            <TextInput
              allowFontScaling={false}
              style={styles.msgTextInput}
              placeholder={t('typenote')}
              placeholderTextColor={colors.placeholderGrey}
              multiline={true}
              numberOfLines={6}
              textAlignVertical="top"
              autoCapitalize="none"
              keyboardType="default"
              value={note}
              onChangeText={text => {
                setnote(text);
              }}
            />

            {giftCards?.length > 0 && (
              <TouchableOpacity
                style={styles.giftBanner}
                onPress={() =>
                  navigation.navigate('GiftCards', {
                    branchid: branchid,
                    selectedGiftCards: selectedGiftCards,
                  })
                }>
                <Gift width={32} height={32} />

                <View style={{flex: 1}}>
                  <Text allowFontScaling={false} style={styles.gift_title}>
                    {t('giftCards')}
                  </Text>
                  <Text allowFontScaling={false} style={styles.gift_subtitle}>
                    {t('thisstoreoffersgiftcards,buynow.')}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[commonStyles.btnContainer, {marginVertical: 30}]}
              onPress={handleNext}>
              <Text allowFontScaling={false} style={commonStyles.btnText}>
                {t('continue')}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAwareScrollView>
      )}
    </SafeAreaView>
  );
};

export default ReviewConfirm;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: fontSizes.xSmall,
    fontFamily: fonts.bold,
    color: colors.black,
  },
  heading: {
    fontSize: fontSizes.xSmall,
    fontFamily: fonts.bold,
    color: colors.black,
  },
  locationText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.black,
    flex: 1,
  },
  starText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.black,
  },
  Image: {
    width: 100,
    height: 90,
    borderRadius: 10,
    resizeMode: 'cover',
  },

  dateText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.black,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  heading: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.semiBold,
    color: colors.black,
  },
  input_container: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderGrey,
  },
  apply_button: {
    width: 80,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: colors.primary,
  },
  apply_Text: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.background,
  },
  TextInput: {
    flex: 1,
    paddingStart: 18,
    fontSize: fontSizes.xSmall,
    fontFamily: fonts.regular,
  },
  balance_banner: {
    backgroundColor: colors.lightbeige,
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  card: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderGrey,
    padding: 13,
  },
  cardtitle: {
    fontSize: fontSizes.xSmall,
    fontFamily: fonts.semiBold,
    color: colors.darkGrey,
  },
  Cardsubtitle: {
    fontSize: fontSizes.mSmall,
    fontFamily: fonts.regular,
    color: colors.black,
  },
  Cardprice: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.semiBold,
    color: colors.black,
  },
  Cardcurrency: {
    fontSize: fontSizes.xSmall,
    fontFamily: fonts.medium,
    color: colors.black,
  },
  msgTextInput: {
    height: 125,
    borderColor: colors.borderGrey,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingTop: 13,
    marginBottom: 15,
    fontFamily: fonts.regular,
    color: colors.black,
    fontSize: 12,
  },
  giftBanner: {
    borderRadius: 18,
    backgroundColor: colors.lightGreen,
    paddingHorizontal: 24,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  gift_title: {
    fontSize: fontSizes.small,
    fontFamily: fonts.semiBold,
    color: colors.black,
  },
  gift_subtitle: {
    fontSize: fontSizes.mSmall,
    fontFamily: fonts.regular,
    color: colors.black,
  },

  card: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginVertical: 10,
    borderRadius: 10,
  },
  title: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.semiBold,
    color: colors.black,
  },
  price: {
    fontSize: fontSizes.xSmall,
    fontFamily: fonts.semiBold,
    color: colors.black,
    marginTop: -10,
  },
  currency: {
    fontSize: fontSizes.small,
    fontFamily: fonts.medium,
    color: colors.black,
  },
  errorLabel: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 19,
    color: colors.red,
    marginTop: 10,
  },
});
