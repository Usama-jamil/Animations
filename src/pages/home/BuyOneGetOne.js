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
import FastImage from 'react-native-fast-image';

const screenWidth = Dimensions.get('window').width;
const isSmallScreen = screenWidth < 400;
const bogo_PER_PAGE = 10;

const BuyOneGetOne = ({navigation}) => {
  const {t} = useTranslation();
  // API data
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  //  bogo Data
  const [bogo, setbogo] = useState([]);
  const [bogoPage, setbogoPage] = useState(1);
  const [bogoTotalPages, setbogoTotalPages] = useState(1);
  const [bogoLoading, setbogoLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initiallyFetchData();
  }, []);

  const initiallyFetchData = async () => {
    setbogoLoading(true);
    const result = await getRequest(
      `${
        API_ENDPOINTS.compaigns.getAll
      }?pageno=${1}&limit=${bogo_PER_PAGE}&type=buyOneGetOne`,
    );
    console.log('result', result);
    setbogoLoading(false);
    if (result.success) {
      setbogo(result?.data.data);
      setbogoTotalPages(result?.data?.total_pages);
    } else {
      setErr(true);
      setErrMsg(result.error);
    }
  };

  const handleLoadMorebogo = async () => {
    if (bogoPage < bogoTotalPages) {
      const nextPage = bogoPage + 1;
      setbogoPage(nextPage);
      const result = await getRequest(
        `${API_ENDPOINTS.compaigns.getAll}?pageno=${nextPage}&limit=${listing_PER_PAGE}&type=buyOneGetOne`,
      );
      if (result?.success) {
        const newlistings = result?.data.data;
        setbogo([...listings, ...newlistings]);
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    const result = await getRequest(
      `${API_ENDPOINTS.compaigns.getAll}?pageno=${1}&limit=${bogo_PER_PAGE}`,
    );
    setRefreshing(false);
    if (result.success) {
      setbogo(result?.data.data);
      setbogoTotalPages(result?.data?.total_pages);
    } else {
      console.log('error');
      setErr(true);
      setErrMsg(result.error);
    }
  };

  const renderBundleDeal = ({item}) => (
      <TouchableOpacity
        onPress={() =>
        navigation.navigate('HomeDetails', {
            id: item?.branch,
          })
        }
        style={[
          styles.card,
          {
            backgroundColor: '#FAFAFA',
            borderRadius: 12,
            padding: 10,
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 10,
          },
        ]}>
        {/* Paid Services Section */}
        <View style={{flex: 1}}>
          {item.services?.map((service, index) => (
            <View
              key={`service-${index}`}
              style={[styles.inner_card, {marginBottom: 10}]}>
              <FastImage
                source={{uri: service.images?.[0]}}
                style={styles.serviceIcon}
                resizeMode="cover"
              />
              <Text style={styles.serviceTitle}>Paid Service</Text>
              <Text style={styles.servicePrice}>
                {service.price} {item?.currency?.code}
              </Text>
            </View>
          ))}
        </View>

        {/* Free Services Section */}
        <View style={{flex: 1}}>
          {item.freeServices?.map((freeService, index) => (
            <View
              key={`freeService-${index}`}
              style={[styles.inner_card, {marginBottom: 10}]}>
              <FastImage
                source={{uri: freeService.images?.[0]}}
                style={styles.serviceIcon}
                resizeMode="cover"
              />
              <Text style={styles.serviceTitle}>Free Service</Text>
              <Text style={[styles.servicePrice,{textDecorationLine:"line-through",textDecorationColor:colors.warning}]}>
                {freeService.price} {item?.currency?.code}
              </Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title={t('BuyOneGetOne')} />

      {err && (
        <GeneralModal
          modalError={true}
          description={errMsg}
          Set_Modal_Visibilty={setErr}
        />
      )}
      {bogoLoading ? (
        <View style={{paddingVertical: 20}}>
          <ActivityIndicator animating size="large" color={colors.primary} />
        </View>
      ) : bogo?.length > 0 ? (
        <>
          <FlatList
            data={bogo}
            renderItem={renderBundleDeal}
            keyExtractor={item => item.id}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={{marginHorizontal: 20}}
            onEndReached={handleLoadMorebogo}
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
  card: {
    padding: 8,
    marginTop: 5,
    paddingBottom: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inner_card: {
    padding: 8,
    borderWidth: 1,
    borderColor: colors.borderColor,
    borderRadius: 12,
  },
  image: {
    height: 124,
    width: '100%',
    borderRadius: 10,
    resizeMode: 'cover',
    position: 'relative',
  },

  dealTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.black,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  discountedPrice: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.black,
    marginRight: 8,
  },
  originalPrice: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.warning,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: colors.whiteGray,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  discountText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.purple,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clockIcon: {
    width: 16,
    height: 16,
    tintColor: colors.gray,
    marginRight: 8,
  },
  calendarIcon: {
    width: 16,
    height: 16,
    tintColor: colors.graycolor,
    marginRight: 8,
  },
  timeText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.purple,
  },
  dateText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.warning,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    ...commonStyles.btnContainer,
    marginHorizontal: 20,
  },
  addButtonText: {
    ...commonStyles.btnText,
    color: colors.white,
  },
  discountHeader: {
    position: 'absolute',
    top: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    backgroundColor: colors.purple,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  icon: {
    width: isSmallScreen ? 14 : 16,
    height: isSmallScreen ? 14 : 16,
    resizeMode: 'contain',
  },

  serviceIcon: {
    width: '100%',
    height: 84,
    marginRight: 10,
    tintColor: colors.purple, // or whatever color you prefer
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  serviceTitle: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: colors.black,
    marginTop: 10,
  },
  servicePrice: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.black,
  },
});

export default BuyOneGetOne;
