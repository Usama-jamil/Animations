import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import React, {useState, useEffect, useMemo} from 'react';
import CustomHeader from '../../components/header/CustomHeader';
import {useTranslation} from 'react-i18next';
import {colors, commonStyles, fontSizes, fonts} from '../../utils/styles';
import GeneralModal from '../../components/modal/GeneralModal';
import Checkmark from '../../../assets/icons/checkmark-badge.svg';
import {useDispatch, useSelector} from 'react-redux';
import {API_ENDPOINTS, postRequest} from '../../utils/apiService';
import {
  SetActiveRadio,
  SetBranchId,
  SetBusiness,
  SetDate,
  SetFareHomeService,
  SetSelectedBogoEmpty,
  SetSelectedBundleEmpty,
  SetSelectedProductEmpty,
  SetSelectedServiceEmpty,
  SetSelectedSubsciptionEmpty,
  SetServiceBasedMembers,
  SetTime,
  SetWaitng,
} from '../../store/slices/cart';
import ReactNativeCalendarEvents from 'react-native-calendar-events';
import moment from 'moment';
import {useFocusEffect} from '@react-navigation/native';
import usePaymentSheet from '../../components/payment-sheet/PaymentSheet';

const PayNow = ({navigation, route}) => {
  const {t} = useTranslation();
  const {
    notes,
    total,
    giftCards,
    businessSubscription,
    firstcomapignid,
    discountId,
    giftCardId,
  } = route.params;

  const dispatch = useDispatch();

  const [showPopUp, setShowPopUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const {
    initializePaymentSheet,
    openPaymentSheet,
    isLoading: paymentloading,
  } = usePaymentSheet();

  const {
    selectServies,
    SelectedProducts,
    teamMembers,
    selectTime,
    selectdate,
    isWaiting,
    serviceBasedMembers,
    branchid,
    currencyCode,
    fare,
    activeRadio,
    selectBundles,
    selectBogo,
  } = useSelector(state => state.cart);

  console.log('selectTime', selectTime);
  const {user} = useSelector(state => state.auth);
  const {pickedCal} = useSelector(state => state.calender);

  const filteredProducts = useMemo(() => {
    return SelectedProducts.filter(product => product.branch === branchid);
  }, [SelectedProducts, branchid]);

  const filteredServices = useMemo(() => {
    return selectServies.filter(
      service =>
        service.branch === branchid &&
        (!service.compaigntype ||
          service.compaigntype === '' ||
          service.compaigntype === null),
    );
  }, [selectServies, branchid]);

  const filteredBundles = useMemo(() => {
    return selectBundles.filter(bundle => bundle.branch === branchid);
  }, [selectBundles, branchid]);

  const filteredBogo = useMemo(() => {
    return selectBogo.filter(bogo => bogo.branch === branchid);
  }, [selectBogo, branchid]);

  const filteredProductsForCompaign = useMemo(() => {
    return filteredProducts.filter(
      product => product.branch === branchid && product.compaigntype,
    );
  }, [filteredProducts, branchid]);

  const filteredServicesForCompaign = useMemo(() => {
    return selectServies.filter(
      service => service.branch === branchid && service.compaigntype,
    );
  }, [selectServies, branchid]);

  const bogoServiceIds = useMemo(() => {
    return filteredBogo.flatMap(bogo => [
      ...bogo.services.map(service => service._id),
      ...bogo.freeServices.map(service => service._id),
    ]);
  }, [filteredBogo]);

  const bundleServiceIds = useMemo(() => {
    return filteredBundles.flatMap(bundle =>
      bundle.services.map(service => service._id),
    );
  }, [filteredBundles]);

  const bundleInventoryIds = useMemo(() => {
    return filteredBundles.flatMap(bundle =>
      bundle.inventories.map(inventory => inventory._id),
    );
  }, [filteredBundles]);

  const campaignIds = useMemo(() => {
    return [
      ...filteredBogo.map(bogo => bogo._id),
      ...filteredBundles.map(bundle => bundle._id),
    ];
  }, [filteredBogo, filteredBundles]);

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        await initializePaymentSheet();
      })();
    }, []),
  );

  useEffect(() => {
    if (showPopUp && user?.enable_calendar) {
      requestCalendarPermission();
    }
  }, [showPopUp]);

  const requestCalendarPermission = async () => {
    const calendars = await ReactNativeCalendarEvents.findCalendars();
    const defaultCalendar = pickedCal || calendars[0]; // use `pickedCal` or default to first calendar
    createEvent(defaultCalendar?.id);
  };

  const handleBtnPress = () => {
    setShowPopUp(false);
    navigation.navigate('Home', {screen: 'Booking'});
  };

  const handleNOPress = () => {
    setShowPopUp(false);
    navigation.navigate('Home', {screen: 'Home'});
  };

  const createEvent = async calId => {
    console.log('calid', calId);
    if (!calId) {
      console.error('No valid calendar ID found.');
      return;
    }

    const eventPayload = {
      calendarId: calId,
      title: filteredServices[0]?.title,
      startDate: moment(selectdate?.originalDate).add(1, 'hour').toISOString(),
      endDate: moment(selectdate?.originalDate)
        .add(1, 'hour')
        .add(selectTime?.endTime, 'minutes')
        .toISOString(),
      notes: notes || '',
      description: filteredServices[0]?.description,
      color: colors.primary,
    };
    console.log('payload event', eventPayload);
    try {
      const eventId = await ReactNativeCalendarEvents.saveEvent(
        eventPayload.title,
        eventPayload,
      );
      console.log('Event created successfully:', eventId);
    } catch (error) {
      console.error('Error while saving event:', error);
    }
  };
  const businessSubscriptionType = businessSubscription?.plan?.type;

  console.log('businessSubscriptionType', businessSubscriptionType);
  const handlePayNow = async paymentMethodId => {
    setIsLoading(true);
    try {
      await handleAttachCard(paymentMethodId);
    } catch (error) {
      console.error('Error during payment:', error);
      setErr(true);
      setErrMsg('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const convertToPayload = serviceBasedMembers => {
    const services = [];
    const serviceSet = new Set();

    for (const key in serviceBasedMembers) {
      const member = serviceBasedMembers[key].member;
      const service = serviceBasedMembers[key].service;

      // Create a unique key for each combination of professional and service
      const uniqueKey = `${member._id}-${service._id}`;

      // Check if the uniqueKey is already in the Set, if not, add it
      if (!serviceSet.has(uniqueKey)) {
        serviceSet.add(uniqueKey);

        services.push({
          ...(!isWaiting && {professional: member._id}),
          service: service._id,
        });
      }
    }

    return {services};
  };

  const handleAttachCard = async id => {
    setIsLoading(true);

    const bookingFor =
      activeRadio === 'HomeService' ? 'homeservice' : 'inplace';

    const allServiceIds = [
      ...filteredServices.map(service => service._id),
      ...bogoServiceIds,
      ...bundleServiceIds,
      ...(filteredServicesForCompaign?.flatMap(campaign =>
        campaign.services.map(service => service._id),
      ) || []),
    ];

    const allInventoryIds = [
      ...filteredProducts.map(product => product.inventory),
      ...bundleInventoryIds,
    ];

    const hasOtherCampaigns =
      filteredProductsForCompaign?.length > 0 ||
      filteredServicesForCompaign?.length > 0 ||
      campaignIds.length > 0;

    const shouldIncludeFirstCampaign = firstcomapignid && !hasOtherCampaigns;

    const payload = {
      type: businessSubscriptionType === 'advanced' ? 'subscription' : 'card',
      ...(selectdate?.originalDate && {date: selectdate.originalDate}),
      paymentId:
        businessSubscriptionType === 'advanced'
          ? businessSubscription?.subscriptionId
          : id,

      services:
        teamMembers?.length === 0
          ? convertToPayload(serviceBasedMembers).services
          : teamMembers?.flatMap(item =>
              allServiceIds?.map(serviceId => ({
                ...(!isWaiting && {professional: item._id}),
                service: serviceId,
              })),
            ),

      ...(allInventoryIds?.length > 0 && {
        inventories: [
          ...filteredProducts?.map(data => ({
            inventory: data?.inventory,
            ...(data?.varinat && {variant: data?.varinat}),
            quantity: data?.quantity,
          })),
          ...bundleInventoryIds.map(inventoryId => ({
            inventory: inventoryId,
            quantity: 1,
          })),
        ],
      }),

      ...(bookingFor === 'homeservice' && {fare}),

      ...(shouldIncludeFirstCampaign && {
        compaigns: [firstcomapignid],
      }),

      ...(hasOtherCampaigns && {
        compaigns: [
          ...filteredServicesForCompaign.map(product => product.compaignId),
          ...(filteredProductsForCompaign?.[0]?.compaignId
            ? [filteredProductsForCompaign[0].compaignId]
            : []),
          ...campaignIds,
        ],
      }),

      // Add gift cards and discounts
      ...(giftCards?.length > 0 && {
        giftCards: giftCards.map(card => card._id),
      }),
      ...(discountId && {discount: discountId}),
      ...(giftCardId && {giftCard: giftCardId}),

      bookingFor,
      branch: branchid,
      total: total,
      note: notes?.trim(),
      ...(isWaiting && {isWaiting: isWaiting}),
      ...(!isWaiting && {
        ...(selectTime?.startTime && {startTime: selectTime.startTime}), // Include startTime if it exists
        ...(selectTime?.endTime && {endTime: selectTime.endTime}), // Include endTime if it exists
      }),
    };
    console.log('payload', payload);

    try {
      const result = await postRequest(
        API_ENDPOINTS.booking.createBooking,
        payload,
      );
      console.log('result', result?.success);
      setIsLoading(false);
      if (result.success) {
        setShowPopUp(true);
        dispatch(SetSelectedProductEmpty({branchId: branchid}));
        dispatch(SetSelectedServiceEmpty({branchId: branchid}));
        dispatch(SetServiceBasedMembers([]));
        dispatch(SetWaitng(false));
        dispatch(SetBranchId(''));
        dispatch(SetFareHomeService(0));
        dispatch(SetActiveRadio('Inplace'));
        dispatch(SetTime({}));
        dispatch(SetDate({}));
        dispatch(SetBusiness(''));
        dispatch(SetSelectedBogoEmpty({branchId: branchid}));
        dispatch(SetSelectedBundleEmpty({branchId: branchid}));
      } else {
        setErr(true);
        setErrMsg(result.error);
      }
    } catch (error) {
      console.error('Error during booking:', error);
      setErr(true);
      setErrMsg('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader
        title={
          businessSubscriptionType === 'advanced' ? t('bookNow') : t('payNow')
        }
      />

      <GeneralModal
        modalError={err}
        description={errMsg}
        Set_Modal_Visibilty={setErr}
      />

      {isLoading || paymentloading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}>
          <Text allowFontScaling={false} style={styles.Cardprice}>
            {total}
            <Text allowFontScaling={false} style={styles.Cardcurrency}>
              {' '}
              {currencyCode}{' '}
            </Text>{' '}
          </Text>
          {businessSubscriptionType === 'premium' && (
            <TouchableOpacity
              style={[styles.continueButton, commonStyles.btnContainer]}
              onPress={async () => {
                const paymentId = await openPaymentSheet(); // ✅ Wait for Payment ID
                if (paymentId) {
                  handlePayNow(paymentId); // ✅ Send Payment ID to handlePayNow
                }
              }}
              disabled={isLoading}>
              <Text allowFontScaling={false} style={commonStyles.btnText}>
                {t('payNow')}
              </Text>
            </TouchableOpacity>
          )}

          {businessSubscriptionType === 'advanced' && (
            <TouchableOpacity
              style={[styles.continueButton, commonStyles.btnContainer]}
              onPress={handlePayNow}
              disabled={isLoading}>
              <Text allowFontScaling={false} style={commonStyles.btnText}>
                {t('bookNow')}
              </Text>
            </TouchableOpacity>
          )}

          {showPopUp && (
            <GeneralModal
              modalSuccess={true}
              Set_Modal_Visibilty={false}
              imageSource={<Checkmark width={38} height={38} />}
              title={t('success')}
              description={t('bookingsuccess')}
              yesBtnTitle={t('seeBookings')}
              noBtnTitle={t('dismiss')}
              handleYesPress={handleBtnPress}
              handleNoPress={handleNOPress}
            />
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default PayNow;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  scrollView: {
    flex: 1,
    marginHorizontal: 10,
  },
  cardField: {
    backgroundColor: colors.lightGreen,
    borderRadius: 8,
    color: colors.lightBlack,
    fontFamily: fonts.regular,
  },
  cardContainer: {
    height: 50,
    marginVertical: 30,
  },

  errorLabel: {
    fontFamily: fonts.bold,
    fontSize: 15,
    lineHeight: 19,
    color: colors.errorRed,
    marginBottom: 15,
  },

  loginTouchOpacity: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    height: 50,
    backgroundColor: colors.purple,
    marginTop: 50,
  },
  loginText: {
    ...commonStyles.buttonTouchOpacityText,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    fontFamily: fonts.medium,
    marginTop: 5,
  },
  continueButton: {
    marginTop: 40,
    marginBottom: 20,
  },
  Cardprice: {
    fontSize: fontSizes.large,
    fontFamily: fonts.semiBold,
    color: colors.primary,
    textAlign: 'center',
    marginTop: 20,
  },
  Cardcurrency: {
    fontSize: fontSizes.xMedium,
    fontFamily: fonts.medium,
    color: colors.primary,
  },
});
