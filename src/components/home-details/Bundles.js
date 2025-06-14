import {
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import React from 'react';
import {colors, fonts} from '../../utils/styles';
import {useTranslation} from 'react-i18next';
import {commonStyles} from '../../utils/styles';
import {RemoveSelectedBundle, SetSelectedBundle} from '../../store/slices/cart';
import Toast from 'react-native-toast-message';
import {useDispatch, useSelector} from 'react-redux';
import {useRoute} from '@react-navigation/native';
const screenWidth = Dimensions.get('window').width;
const isSmallScreen = screenWidth < 400;
import NoDataIcon from '../../../assets/icons/no_data.svg';

const Bundles = ({data, fetchMoreData = () => {}}) => {
  const {t} = useTranslation();
  const {selectBundles} = useSelector(state => state.cart);
  const {user} = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const route = useRoute();

  const PriceWithCurrency = ({price, currency, primary}) => (
    <View style={styles.priceContainer}>
      <Text style={[styles.priceValue, primary && {color: colors.primary}]}>
        {price}
      </Text>
      <Text style={[styles.priceCurrency, primary && {color: colors.primary}]}>
        {' '}
        {currency}
      </Text>
    </View>
  );

  const calculateBundleTotal = (
    services = [],
    inventories = [],
    discountType,
    discount,
  ) => {
    // Calculate total price of services
    const servicesTotal = services.reduce(
      (sum, service) => sum + (service.price || 0),
      0,
    );

    // Calculate total price of inventories
    const inventoriesTotal = inventories.reduce(
      (sum, inventory) => sum + (inventory.price || 0),
      0,
    );

    // Subtotal before discount
    const subtotal = servicesTotal + inventoriesTotal;

    let discountAmount = 0;

    if (discountType === 'percentage') {
      discountAmount = (subtotal * (discount || 0)) / 100;
    } else if (discountType === 'amount') {
      discountAmount = discount || 0;
    }

    const totalAfterDiscount = subtotal - discountAmount;

    return {
      subtotal,
      discountAmount,
      totalAfterDiscount,
    };
  };

  const renderBundleDeal = ({item}) => {
    const {subtotal, totalAfterDiscount} = calculateBundleTotal(
      item.services,
      item.inventories,
      item?.discountType,
      item?.discount,
    );
    const isSpecialIndex = selectBundles?.some(
      selectedItem => selectedItem?._id === item?._id,
    );
    return (
      <View style={styles.bundleDealContainer}>
        {/* Discount percentage header */}
        <View style={styles.discountHeader}>
          <Image
            source={require('../../../assets/icons/bundledeals.png')}
            style={styles.icon}
          />
          <Text style={styles.discountPercentage}>
            {item?.discountType === 'percentage'
              ? `${item?.discount}%`
              : item?.discount}
          </Text>
        </View>

        <View style={styles.discountHeaderlabel}>
          <Image
            source={require('../../../assets/icons/bundledeals.png')}
            style={styles.icon}
          />
          <Text style={styles.discountPercentage}>Bundle Deal</Text>
        </View>

        {/* Items list */}
        <Text style={[styles.itemName, {marginTop: 20}]}>{t('Service')}</Text>

        <View style={styles.itemsList}>
          {item?.services?.map((product, index) => (
            <View key={index} style={styles.itemContainer}>
              <Text
                style={[
                  styles.itemName,
                  {
                    color: colors.graycolor,
                    fontFamily: fonts.regular,
                  },
                ]}>
                {product?.title}
              </Text>
              <PriceWithCurrency
                price={product?.price}
                currency={data?.[0]?.currency?.code}
              />
            </View>
          ))}
        </View>
        <Text style={styles.itemName}>{t('Inventory')}</Text>

        <View style={[styles.itemsList, {marginTop: 5}]}>
          {item?.inventories?.map((product, index) => (
            <View key={index} style={styles.itemContainer}>
              <Text
                style={[
                  styles.itemName,
                  {
                    color: colors.graycolor,
                    fontFamily: fonts.regular,
                  },
                ]}>
                {product?.title}
              </Text>
              <PriceWithCurrency
                price={product?.price}
                currency={data?.[0]?.currency?.code}
              />
            </View>
          ))}
        </View>
        <View style={styles.dotted}></View>
        {/* Total row */}
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <View style={styles.totalPriceContainer}>
            <Text
              style={{
                textDecorationLine: 'line-through',
                textDecorationColor: colors.redColor,
                fontSize: 10,
                fontFamily: fonts.regular,
              }}>
              {subtotal}

              <Text
                style={{
                  textDecorationLine: 'line-through',
                  textDecorationColor: colors.redColor,
                  fontSize: 10,
                  fontFamily: fonts.regular,
                }}>
                {' '}
                {data?.[0]?.currency?.code}
              </Text>
            </Text>
            <PriceWithCurrency
              price={totalAfterDiscount}
              currency={data?.[0]?.currency?.code}
              primary={true}
            />
          </View>
        </View>
        {route.name !== 'ReviewConfirm' && (
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
              !user?.isGuest
                ? isSpecialIndex
                  ? removeToBooking(item)
                  : addToBooking(item)
                : setGuestPopUp(true)
            }>
            <Text
              allowFontScaling={false}
              style={[commonStyles.btnText, {color: colors.background}]}>
              {isSpecialIndex ? t('remove') : t('buy')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const addToBooking = data => {
    dispatch(SetSelectedBundle(data));
    Toast.show({
      type: 'success',
      position: 'top',
      bottomOffset: 20,
      text1: t('success'),
      text2: t('bundleAddSuccessfully'),
      visibilityTime: 3000,
    });
  };

  const removeToBooking = data => {
    dispatch(RemoveSelectedBundle(data?._id));
    Toast.show({
      type: 'success',
      position: 'top',
      bottomOffset: 20,
      text1: t('success'),
      text2: t('bundleremoveSuccessfully'),
      visibilityTime: 3000,
    });
  };

  return (
    <>
      {data?.length > 0 ? (
        <FlatList
          data={data}
          renderItem={renderBundleDeal}
          keyExtractor={item => item.id}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          onEndReached={fetchMoreData}
          onEndReachedThreshold={0.6}
          contentContainerStyle={{
            marginTop: 10,
            paddingBottom:
              route.name === 'OverView' || route.name === 'ReviewConfirm'
                ? 10
                : 100,
          }}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        />
      ) : (
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
            marginTop: 20,
          }}>
          <NoDataIcon width={200} height={100} />
          <Text allowFontScaling={false} style={styles.noDataText}>
            {t('noDataFound')}
          </Text>
        </View>
      )}
    </>
  );
};

export default Bundles;

const styles = StyleSheet.create({
  bundleDealContainer: {
    backgroundColor: colors.white,
    borderRadius: 8,
    marginVertical: 8,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  discountHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderTopLeftRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: colors.primary,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  discountHeaderlabel: {
    position: 'absolute',
    top: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    backgroundColor: colors.primary,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  discountPercentage: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.white,
  },
  itemsList: {
    marginTop: 5,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  itemName: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.black,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceValue: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.black,
  },
  priceCurrency: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.black,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  totalLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.black,
  },
  totalPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-end',
  },
  totalPrice: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.primary,
  },
  separator: {
    height: 16,
  },
  addButton: {
    ...commonStyles.btnContainer,
    margin: 20,
  },
  addButtonText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.white,
  },
  icon: {
    width: isSmallScreen ? 14 : 16,
    height: isSmallScreen ? 14 : 16,
    resizeMode: 'contain',
  },
  dotted: {
    borderStyle: 'dashed',
    borderColor: colors.borderColor,
    borderWidth: 1,
  },
  noDataImg: {
    height: 150,
    width: 200,
    resizeMode: 'contain',
  },
  noDataText: {
    fontFamily: fonts.regular,
    color: colors.black,
    fontSize: 14,
    lineHeight: 24,
  },
  bookButton: {
    ...commonStyles.btnContainer,
  },
});
