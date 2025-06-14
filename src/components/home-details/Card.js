import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import React, {useState} from 'react';
import {fontSizes, fonts, colors} from '../../utils/styles';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';
import {
  RemoveSelectedListing,
  RemoveSelectedProduct,
  RemoveSelectedService,
  RemoveSelectedSubscription,
  SetSelectedService,
  SetSelectedSubscription,
} from '../../store/slices/cart';
import Toast from 'react-native-toast-message';
import GuestModal from '../guest-modal/GuestModal';
import NoDataIcon from '../../../assets/icons/no_data.svg';
import Clock from '../../../assets/icons/clock.svg';
import BookingModal from '../rental-modal/RentalModal';

var quantity;
const Card = ({
  data,
  activeButton,
  selecteddata,
  fetchMoreData,
  activeRadio,
  currency,
}) => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const route = useRoute();
  const dispatch = useDispatch();
  const [guestPopUp, setGuestPopUp] = useState(false);
  const {user} = useSelector(state => state.auth);
  const [select, setSelect] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const removeItem = id => {
    if (activeButton === 'Products') {
      dispatch(RemoveSelectedProduct(id));
      Toast.show({
        type: 'success',
        position: 'top',
        bottomOffset: 20,
        text1: t('success'),
        text2: t('productremoveSuccessfully'),
        visibilityTime: 3000,
      });
    } else if (activeButton === 'Subscriptions') {
      dispatch(RemoveSelectedSubscription(id));
      Toast.show({
        type: 'success',
        position: 'top',
        bottomOffset: 20,
        text1: t('success'),
        text2: t('subscriptionremoveSuccessfully'),
        visibilityTime: 3000,
      });
    } else if (activeButton === 'rental') {
      dispatch(RemoveSelectedListing(id));
      Toast.show({
        type: 'success',
        position: 'top',
        bottomOffset: 20,
        text1: t('success'),
        text2: t('listingRemoveSuccessfully'),
        visibilityTime: 3000,
      });
    } else {
      dispatch(RemoveSelectedService(id));
      Toast.show({
        type: 'success',
        position: 'top',
        bottomOffset: 20,
        text1: t('success'),
        text2: t('serviceremoveSuccessfully'),
        visibilityTime: 3000,
      });
    }
  };

  const CardItem = ({navigation, item, index}) => {
    const isSpecialIndex = selecteddata?.some(
      selectedItem => selectedItem?._id === item?._id,
    );

    const selectedVariant = selecteddata?.find(
      selectedItem => selectedItem?._id === item?._id,
    );
    if (activeButton === 'Products') {
      quantity = selecteddata?.find(data => data?._id === item?._id);
    }
    let buttonText = '';
    if (activeButton === 'Products') {
      buttonText = t('Buy');
    } else if (activeButton === 'Subscriptions') {
      buttonText = t('Get');
    } else {
      buttonText = t('Book');
    }

    const navigateToDetails = () => {
      if (activeButton === t('products')) {
        navigation.navigate('ProductDetails', {id: item?._id});
      } else if (activeButton === 'rental') {
        navigation.navigate('ListingDetail', {
          id: item?._id,
          state: true,
          bookingId: '',
          subscriptionId: '',
        });
      } else {
        navigation.navigate('ServiceDetails', {
          id: item?._id,
          complete: false,
          activeRadio,
        });
      }
    };

    const addToBooking = selected => {
      if (activeButton === t('products')) {
        navigation.navigate('ProductDetails', {id: item?._id});
      } else if (activeButton === 'Subscriptions') {
        dispatch(SetSelectedSubscription(selected));
        Toast.show({
          type: 'success',
          position: 'top',
          bottomOffset: 20,
          text1: t('success'),
          text2: t('subscriptionAddSuccessfully'),
          visibilityTime: 3000,
        });
      } else {
        dispatch(SetSelectedService(selected));
        Toast.show({
          type: 'success',
          position: 'top',
          bottomOffset: 20,
          text1: t('success'),
          text2: t('serviceAddSuccessfully'),
          visibilityTime: 3000,
        });
      }
    };

    const handleAction = item => {
      if (activeButton === 'rental') {
        if (isSpecialIndex) {
          removeItem(item._id);
        } else {
          setSelectedItem(item);
          setSelect(true);
          return;
        }
      }
      if (isSpecialIndex) {
        removeItem(item._id);
      } else {
        addToBooking(item);
      }
    };

    return (
      <TouchableOpacity
        style={styles.container}
        activeOpacity={0.9}
        onPress={navigateToDetails}>
        <Text
          allowFontScaling={false}
          style={[styles.title, {color: colors.black}]}>
          {activeButton === 'Products' && selectedVariant?.title
            ? quantity?.title
            : activeButton === 'rental'
            ? item?.name
            : item?.title}
        </Text>

        <View style={styles.rowContainerEnd}>
          {activeButton === 'rental' ? (
            <View
              style={[
                styles.card_inner_row,
                {marginTop: 5, justifyContent: 'space-between'},
              ]}>
              <View style={styles.card_inner_row}>
                <Image
                  source={require('../../../assets/icons/clock_fill.png')}
                  style={[styles.iconTwo, {tintColor: colors.primary}]}
                />
                <Text
                  style={{
                    fontFamily: fonts.regular,
                    fontSize: 11,
                    color: colors.black,
                  }}>
                  {item?.currency?.code} {item?.rentPerHour} / Hour
                </Text>
              </View>

              <View style={styles.card_inner_row}>
                <Image
                  source={require('../../../assets/icons/calender_fill.png')}
                  style={[styles.iconTwo, {tintColor: colors.primary}]}
                />
                <Text
                  style={{
                    fontFamily: fonts.regular,
                    fontSize: 11,
                    color: colors.black,
                  }}>
                  {item?.currency?.code} {item?.rentPerDay} / Day
                </Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={[styles.rowContainer, {gap: 8}]}>
              <Image
                source={require('../../../assets/icons/price_icon.png')}
                style={{width: 20, height: 20, resizeMode: 'cover'}}
              />
              <Text
                allowFontScaling={false}
                style={[styles.priceText, {color: colors.primary}]}>
                <Text>
                  {activeButton === 'Products'
                    ? selectedVariant
                      ? selectedVariant?.price?.toFixed(0)
                      : item?.price?.toFixed(0)
                      ? item?.price?.toFixed(0)
                      : item?.variants?.[0]?.price?.toFixed(0)
                    : (item?.offer?.isActive
                        ? (item?.price || 0) - (item?.offer?.discount || 0)
                        : item?.price || 0
                      ).toFixed(0)}
                </Text>

                <Text allowFontScaling={false} style={styles.currencyText}>
                  {' '}
                  {item?.currency?.code}{' '}
                </Text>
              </Text>
              {item?.time && (
                <View style={[styles.rowContainer, {gap: 8}]}>
                  <Clock width={20} height={20} color="#707070" />
                  <Text allowFontScaling={false} style={styles.timeText}>
                    {item?.time}
                  </Text>
                </View>
              )}
              {(activeButton === 'Products' ||
                activeButton === t('subscription')) &&
                item?.category && (
                  <Text allowFontScaling={false} style={styles.timeText}>
                    {item?.category?.name}
                  </Text>
                )}
            </TouchableOpacity>
          )}

          <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
            {(activeButton === 'Products' ||
              (route.name === 'OverView' && activeButton === 'Products')) && (
              <Text allowFontScaling={false} style={styles.itemCount}>
                {' '}
                {isSpecialIndex ? `x${quantity?.quantity}` : ''}
              </Text>
            )}

            <TouchableOpacity
              style={[
                styles.bookButton,
                {
                  backgroundColor: isSpecialIndex
                    ? colors.warning
                    : colors.primary,
                },
              ]}
              onPress={() =>
                !user?.isGuest ? handleAction(item) : setGuestPopUp(true)
              }>
              <Text
                allowFontScaling={false}
                style={[styles.buttonText, {color: colors.background}]}>
                {isSpecialIndex ? t('Remove') : buttonText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderItem = ({item, index}) => (
    <CardItem navigation={navigation} item={item} index={index} />
  );

  return (
    <View >
      {select && (
        <BookingModal
          Set_Modal_Visibilty={setSelect}
          handleYesPress={() => {
            setSelect(false);
          }}
          handleNoPress={() => setSelect(false)}
          data={selectedItem}
          currency={currency}
        />
      )}
      {data?.length > 0 ? (
        <FlatList
          renderItem={renderItem}
          data={data}
          keyExtractor={item => item._id}
          showsVerticalScrollIndicator={false}
          onEndReached={fetchMoreData}
          onEndReachedThreshold={0.6}
          nestedScrollEnabled={true}
          contentContainerStyle={{paddingBottom: 100}}
        />
      ) : (
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 10,
          }}>
          <NoDataIcon width={200} height={100} />
          <Text allowFontScaling={false} style={styles.noDataText}>
            {t('noDataFound')}
          </Text>
        </View>
      )}
      {guestPopUp && (
        <GuestModal showPopUp={guestPopUp} setShowPopUp={setGuestPopUp} />
      )}
    </View>
  );
};

export default Card;

const styles = StyleSheet.create({
  container: {
    minHeight: 76,
    borderRadius: 10,
    width: '100%',
    paddingHorizontal: 13,
    paddingVertical: 8,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: colors.borderColor,
  },
  title: {
    fontSize: fontSizes.xSmall,
    fontFamily: fonts.semiBold,
  },
  bookButton: {
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    width: 67,
    alignSelf: 'flex-end',
    elevation: 1,
  },
  timeText: {
    color: colors.black,
    fontSize: fontSizes.xSmall,
    fontFamily: fonts.regular,
  },
  priceText: {
    fontSize: fontSizes.xMedium,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
  currencyText: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.black,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  rowContainerEnd: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  itemCount: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.green,
    marginTop: 20,
  },
  buttonText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
  },
  noDataText: {
    fontSize: fontSizes.xSmall,
    color: colors.black,
    fontFamily: fonts.medium,
    textAlign: 'center',
  },
  card_inner_row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconTwo: {
    width: 18,
    height: 18,
    resizeMode: 'cover',
  },
});
