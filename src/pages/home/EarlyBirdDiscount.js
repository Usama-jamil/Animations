import React, {useCallback, useEffect, useState} from 'react';
import {
  SafeAreaView,
  Text,
  View,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import GeneralModal from '../../components/modal/GeneralModal';
import {API_ENDPOINTS, getRequest} from '../../utils/apiService';
import {colors, commonStyles, fonts} from '../../utils/styles';
import NoDataIcon from '../../../assets/icons/no_data.svg';
import CustomHeader from '../../components/header/CustomHeader';
import FastImage from 'react-native-fast-image';
import moment from 'moment';
import {useSharedValue} from 'react-native-reanimated';
import Carousel, {Pagination} from 'react-native-reanimated-carousel';
import ClockIcon from '../../../assets/icons/clock.svg';

const screenWidth = Dimensions.get('window').width;
const isSmallScreen = screenWidth < 400;
const earlyBird_PER_PAGE = 10;

const EarlyBirdDiscount = ({navigation}) => {
  const {t} = useTranslation();
  // API data
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  //  earlyBird Data
  const [earlyBird, setearlyBird] = useState([]);
  const [earlyBirdPage, setearlyBirdPage] = useState(1);
  const [earlyBirdTotalPages, setearlyBirdTotalPages] = useState(1);
  const [earlyBirdLoading, setearlyBirdLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const width = Dimensions.get('window').width;
  const progress = useSharedValue(0);
  const carouselRef = React.useRef(null);

  console.log('earlyBird', earlyBird);

  useEffect(() => {
    initiallyFetchData();
  }, []);

  const initiallyFetchData = async () => {
    setearlyBirdLoading(true);
    const result = await getRequest(
      `${
        API_ENDPOINTS.compaigns.getAll
      }?pageno=${1}&limit=${earlyBird_PER_PAGE}&type=earlyBirdDiscount`,
    );
    console.log('result', result);
    setearlyBirdLoading(false);
    if (result.success) {
      setearlyBird(result?.data.data);
      setearlyBirdTotalPages(result?.data?.total_pages);
    } else {
      setErr(true);
      setErrMsg(result.error);
    }
  };

  const handleLoadMoreearlyBird = async () => {
    if (earlyBirdPage < earlyBirdTotalPages) {
      const nextPage = earlyBirdPage + 1;
      setearlyBirdPage(nextPage);
      const result = await getRequest(
        `${API_ENDPOINTS.compaigns.getAll}?pageno=${nextPage}&limit=${listing_PER_PAGE}&type=earlyBirdDiscount`,
      );
      if (result?.success) {
        const newlistings = result?.data.data;
        setearlyBird([...listings, ...newlistings]);
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    const result = await getRequest(
      `${
        API_ENDPOINTS.compaigns.getAll
      }?pageno=${1}&limit=${earlyBird_PER_PAGE}`,
    );
    setRefreshing(false);
    if (result.success) {
      setearlyBird(result?.data.data);
      setearlyBirdTotalPages(result?.data?.total_pages);
    } else {
      console.log('error');
      setErr(true);
      setErrMsg(result.error);
    }
  };

  const calculateBundleTotal = (
    services = [],
    discountType = 'percentage',
    discount,
  ) => {
    // Calculate total price of services
    const servicesTotal = services.reduce(
      (sum, service) => sum + (service.price || 0),
      0,
    );

    // Subtotal before discount
    const subtotal = servicesTotal;

    let discountAmount = 0;

    if (discountType === 'percentage') {
      discountAmount = (servicesTotal * (discount || 0)) / 100;
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

  const renderItem = ({item}) => {
    const {subtotal, discountAmount, totalAfterDiscount} = calculateBundleTotal(
      item?.services,
      (discountType = 'percentage'),
      item?.discount,
    );

    const onPressPagination = index => {
      carouselRef.current?.scrollTo({index, animated: true});
    };

    const renderCarouselItem = ({item: crouselItem}) => (
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: '#F6f6f6',
            borderRadius: 12,
            width: width - 40,
          },
        ]}
          onPress={() => navigation.navigate('HomeDetails', {id: item?.branch})}
        >
        {/* Show the first image if available */}
        <FastImage
          source={{uri: crouselItem?.images[0]}}
          style={styles.image}
          resizeMode={FastImage.resizeMode.cover}
        />

        <View
          style={[styles.row, {justifyContent: 'space-between', marginTop: 5}]}>
          <Text style={styles.dealTitle}>{crouselItem?.title}</Text>
          {item?.validTill && (
            <View style={styles.dateContainer}>
              <Image
                source={require('../../../assets/icons/calender.png')}
                style={styles.calendarIcon}
              />
              <Text style={styles.dateText}>
                {moment(item?.validTill).format('DD-MM-YYYY')}
              </Text>
            </View>
          )}
        </View>

        <View
          style={[styles.row, {justifyContent: 'space-between', marginTop: 5}]}>
          <View style={styles.row}>
            <Text style={styles.discountedPrice}>
              {totalAfterDiscount} {item?.currency?.code}
            </Text>
            <Text style={styles.originalPrice}>
              {subtotal} {item?.currency?.code}
            </Text>
          </View>

          <View style={styles.row}>
            <ClockIcon width={18} height={18} />
            <Text
              style={[styles.dateText, {color: colors.black, marginLeft: 8}]}>
              {item?.discount}%
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );

    return (
      <>
        <Carousel
          ref={carouselRef}
          loop={false}
          snapEnabled={true}
          pagingEnabled={true}
          autoPlay={false}
          width={width - 40}
          height={200} // Adjust this based on your card height
          data={item?.services}
          onProgressChange={(_, absoluteProgress) => {
            progress.value = absoluteProgress;
          }}
          renderItem={renderCarouselItem}
        />

        {/* Custom Pagination - optional since we only have one item */}
        {item?.services?.length > 1 && (
          <Pagination.Basic
            progress={progress}
            data={item.services}
            containerStyle={styles.indicatorContainer}
            dotStyle={styles.InActiveindicator}
            activeDotStyle={styles.Activeindicator}
            onPress={onPressPagination}
          />
        )}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title={t('earlyBird')} />

      {err && (
        <GeneralModal
          modalError={true}
          description={errMsg}
          Set_Modal_Visibilty={setErr}
        />
      )}
      {earlyBirdLoading ? (
        <View style={{paddingVertical: 20}}>
          <ActivityIndicator animating size="large" color={colors.primary} />
        </View>
      ) : earlyBird?.length > 0 ? (
        <>
          <FlatList
            data={earlyBird}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={{marginHorizontal: 20}}
            onEndReached={handleLoadMoreearlyBird}
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
    marginTop: screenWidth < 400 ? 10 : 10,
    borderRadius: 12,
    flex: 1,
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
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: -5,
    left: '40%',
    right: '40%',
    marginVertical: 10,
    marginTop: 10,
  },
  Activeindicator: {
    width: 18,
    height: 5,
    borderRadius: 5,
    marginHorizontal: 2,
    backgroundColor: colors.primary,
  },
  InActiveindicator: {
    width: 8,
    height: 5,
    borderRadius: 5,
    marginHorizontal: 2,
    backgroundColor: '#E9E9E9',
  },
});

export default EarlyBirdDiscount;
