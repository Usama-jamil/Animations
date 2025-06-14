import React, {useCallback, useEffect, useState} from 'react';
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import GeneralModal from '../../components/modal/GeneralModal';
import {API_ENDPOINTS, getRequest} from '../../utils/apiService';
import {colors, commonStyles, fonts} from '../../utils/styles';
import NoDataIcon from '../../../assets/icons/no_data.svg';
import CustomHeader from '../../components/header/CustomHeader';
const screenWidth = Dimensions.get('window').width;
const isSmallScreen = screenWidth < 400;
const BUNDLE_PER_PAGE = 10;

const BundleList = ({navigation}) => {
  const {t} = useTranslation();
  // API data
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  //  bundle Data
  const [bundle, setbundle] = useState([]);
  const [bundlePage, setbundlePage] = useState(1);
  const [bundleTotalPages, setbundleTotalPages] = useState(1);
  const [bundleLoading, setbundleLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initiallyFetchData();
  }, []);

  const initiallyFetchData = async () => {
    setbundleLoading(true);
    const result = await getRequest(
      `${
        API_ENDPOINTS.compaigns.getAll
      }?pageno=${1}&limit=${BUNDLE_PER_PAGE}&type=bundleDeal`,
    );
    console.log('result', result);
    setbundleLoading(false);
    if (result.success) {
      setbundle(result?.data.data);
      setbundleTotalPages(result?.data?.total_pages);
    } else {
      setErr(true);
      setErrMsg(result.error);
    }
  };

  const handleLoadMoreBundle = async () => {
    if (bundlePage < bundleTotalPages) {
      const nextPage = bundlePage + 1;
      setbundlePage(nextPage);
      const result = await getRequest(
        `${API_ENDPOINTS.compaigns.getAll}?pageno=${nextPage}&limit=${listing_PER_PAGE}&type=bundleDeal`,
      );
      if (result?.success) {
        const newlistings = result?.data.data;
        setbundle([...listings, ...newlistings]);
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    const result = await getRequest(
      `${API_ENDPOINTS.compaigns.getAll}?pageno=${1}&limit=${BUNDLE_PER_PAGE}`,
    );
    setRefreshing(false);
    if (result.success) {
      setbundle(result?.data.data);
      setbundleTotalPages(result?.data?.total_pages);
    } else {
      console.log('error');
      setErr(true);
      setErrMsg(result.error);
    }
  };
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
    return (
      <TouchableOpacity
        style={styles.bundleDealContainer}
        onPress={() => navigation.navigate('HomeDetails', {id: item?.branch})}>
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
                currency={bundle?.[0]?.currency?.code}
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
                currency={bundle?.[0]?.currency?.code}
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
                {bundle?.[0]?.currency?.code}
              </Text>
            </Text>
            <PriceWithCurrency
              price={totalAfterDiscount}
              currency={bundle?.[0]?.currency?.code}
              primary={true}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title={t('bundle')} />

      {err && (
        <GeneralModal
          modalError={true}
          description={errMsg}
          Set_Modal_Visibilty={setErr}
        />
      )}
      {bundleLoading ? (
        <View style={{paddingVertical: 20}}>
          <ActivityIndicator animating size="large" color={colors.primary} />
        </View>
      ) : bundle?.length > 0 ? (
        <>
          <FlatList
            data={bundle}
            renderItem={renderBundleDeal}
            keyExtractor={item => item.id}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={{marginHorizontal: 20}}
            onEndReached={handleLoadMoreBundle}
            onEndReachedThreshold={0.5}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            showsVerticalScrollIndicator={false}
          />
        </>
      ) : (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <NoDataIcon width={300} height={250} />
          <Text style={styles.noDataFound}> {t('noDataFound')}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
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
});

export default BundleList;
