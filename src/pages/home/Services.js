import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  SafeAreaView,
  Dimensions,
  ImageBackground,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import CustomHeader from '../../components/header/CustomHeader';
import {TouchableOpacity} from 'react-native';
import {useTranslation} from 'react-i18next';
import {colors, fontSizes, fonts} from '../../utils/styles';
import {widthPercentageToDP as WP} from 'react-native-responsive-screen';
import BeltIcon from '../../../assets/icons/bolt.svg';
import Tag from '../../../assets/icons/tags.svg';
import bg_shadow from '../../../assets/images/image_bg_shadow.png';

import WalletIcon from '../../../assets/icons/wallet-alt.svg';
import StartSharpIcon from '../../../assets/icons/star-round.svg';
import {useDispatch, useSelector} from 'react-redux';
import {GetAllServices} from '../../store/slices/service';
import ActivityIndicatorModal from '../../components/modal/ActivityIndicatorModal';
import GeneralModal from '../../components/modal/GeneralModal';
const screenWidth = Dimensions.get('window').width;
const isSmallScreen = screenWidth < 400;
import FastImage from 'react-native-fast-image';
import {API_ENDPOINTS} from '../../utils/apiService';

import {getRequest} from '../../utils/apiService';
import {useFocusEffect} from '@react-navigation/native';
import moment from 'moment';
import ImagePreview from '../../components/imagePreview/ImagePreview';
const service_PER_PAGE = 10;
const AllServices = ({navigation}) => {
  const {t} = useTranslation();
  const [services, setServices] = useState([]);
  const [servicePage, setServicePage] = useState(1);
  const [serviceTotalPages, setServiceTotalPages] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [images, setImages] = useState([]);
  // const {isLoading} = useSelector(state => state.service)
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      initiallyFetchData();
    }, []),
  );

  const formatPrice = price => {
    if (price > Number.MAX_SAFE_INTEGER) {
      // For extremely large numbers, format using exponential notation
      return price.toExponential(1);
    } else {
      // Use toFixed for numbers within a safe range
      return price.toFixed(2);
    }
  };

  const initiallyFetchData = async () => {
    setIsLoading(true);
    const result = await getRequest(
      `${API_ENDPOINTS.service.getAll}?pageno=${1}&limit=${service_PER_PAGE}`,
    );
    console.log('result', result);
    setIsLoading(false);
    if (result.success) {
      setServices(result?.data.data);
      setServiceTotalPages(result?.data?.total_pages);
    } else {
      console.log('error');
      setErr(true);
      setErrMsg(result.error);
    }
  };

  const handleLoadMoreServices = async () => {
    if (servicePage < serviceTotalPages) {
      const nextPage = servicePage + 1;
      setServicePage(nextPage);
      const result = await getRequest(
        `${API_ENDPOINTS.service.getAll}?pageno=${nextPage}&limit=${service_PER_PAGE}`,
      );
      if (result?.success) {
        const newservices = result?.data.data;
        setServices([...services, ...newservices]);
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);

    const result = await getRequest(
      `${API_ENDPOINTS.service.getAll}?pageno=${1}&limit=${service_PER_PAGE}`,
    );

    setRefreshing(false);

    if (result.success) {
      setServices(result?.data.data);
      setServiceTotalPages(result?.data?.total_pages);
    } else {
      console.log('error');
      setErr(true);
      setErrMsg(result.error);
    }
  };

  const renderItem = ({item, index}) => {
    return (
      <TouchableOpacity
        style={[
          styles.service_card_container,
          {
            backgroundColor: colors.whiteGray,
            borderRadius: 12,
            position: 'relative',
            marginTop: index === 0 ? 10 : 5,
          },
        ]}
        onPress={() =>
          navigation.navigate('ServiceDetails', {
            id: item?._id,
            complete: false,
          })
        }>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
          <View style={{position: 'relative'}}>
            <View style={{position: 'relative'}}>
              <TouchableOpacity
                onPress={() => {
                  setImages(item?.images.map(image => ({uri: image})));
                  setIsPreviewVisible(true);
                }} disabled={true}>
                <FastImage
                  style={styles.profile}
                  source={{
                    uri: item?.images[0],
                  }}
                  resizeMode={FastImage.resizeMode.cover}
                />
              </TouchableOpacity>

              {item?.images?.length > 1 && (
                <ImageBackground
                  style={styles.usernameContainer}
                  source={bg_shadow}>
                  <Text allowFontScaling={false} style={styles.imagelengthText}>
                    {' '}
                    + {item?.images?.length - 1}
                  </Text>
                </ImageBackground>
              )}

              {item?.offer?.isActive && (
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    backgroundColor: colors.primary,
                    padding: 6,
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 0,
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 8,
                  }}>
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontSize: 8,
                      fontFamily: fonts.medium,
                      color: colors.background,
                      textAlign: 'center',
                    }}>
                    {item.offer.type === 'flashHours'
                      ? `${moment(item?.offer?.start, 'HH:mm').format(
                          'hh:mm A',
                        )} - ${moment(item?.offer?.end, 'HH:mm').format(
                          'hh:mm A',
                        )}`
                      : `${item.offer.discount} ${item?.currency?.code} ${t(
                          'off',
                        )}`}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={{marginTop: 5, flex: 1}}>
            <Text allowFontScaling={false} style={styles.title}>
              {item?.title}
            </Text>

            <View style={{flexDirection: 'row', alignItems: 'center', gap: 1}}>
              <StartSharpIcon width={18} height={18} style={styles.starIcon} />

              <Text
                allowFontScaling={false}
                style={[styles.date, {marginTop: 4, marginLeft: 3}]}>
                {item?.averageRating?.toFixed(1)}
              </Text>
            </View>

            <View style={styles.card_inner_row}>
              <WalletIcon width={18} height={18} style={styles.starIcon} />
              {item?.offer?.isActive && (
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.subtitle,
                    {
                      marginTop: 4,
                      textDecorationLine: 'line-through',
                      textDecorationColor: colors.graycolor,
                    },
                  ]}>
                  {formatPrice(item?.price)}
                  <Text allowFontScaling={false} style={styles.subtitle}>
                    {' '}
                    {item?.currency?.code}
                  </Text>
                </Text>
              )}
              {item?.offer?.isActive ? (
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.subtitle,
                    {marginTop: 5, color: colors.primary},
                  ]}>
                  {formatPrice(item?.price - item?.offer?.discount)}{' '}
                  {item?.currency?.code}
                </Text>
              ) : (
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.subtitle,
                    {marginTop: 5, color: colors.primary},
                  ]}>
                  {formatPrice(item?.price)} {item?.currency?.code}
                </Text>
              )}
            </View>
          </View>
        </View>

        {item?.offer?.isActive ? (
          <View
            style={[
              styles.icon_background,
              {
                backgroundColor: colors.whiteGray,
                position: 'absolute',
                top: -10,
                right: 0,
              },
            ]}>
            {item?.offer?.type === 'flashHours' ? (
              <BeltIcon width={20} height={20} />
            ) : (
              <Tag width={20} height={20} />
            )}
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.superContainer}>
      <CustomHeader title={t('services')} />
      {isLoading && <ActivityIndicatorModal loaderIndicator={isLoading} />}

      {err && (
        <GeneralModal
          modalError={true}
          description={errMsg}
          Set_Modal_Visibilty={setErr}
        />
      )}
      <FlatList
        renderItem={renderItem}
        data={services}
        keyExtractor={item => item._id}
        contentContainerStyle={{
          marginTop: 15,
          overflow: 'visible',
          paddingBottom: 20,
        }}
        onEndReached={handleLoadMoreServices}
        onEndReachedThreshold={0.6}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
      />
      <ImagePreview
        images={images}
        isVisible={isPreviewVisible}
        onClose={() => setIsPreviewVisible(false)}
      />
    </SafeAreaView>
  );
};

export default AllServices;

const styles = StyleSheet.create({
  superContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  service_card_container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
    marginHorizontal: 16,
    overflow: 'visible',
  },
  see: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.primary,
  },
  booking: {
    width: 61,
    height: 61,
  },
  title: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.black,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.black,
  },
  date: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.black,
  },
  haircolor: {
    color: colors.primary,
    fontSize: 12,
    fontFamily: fonts.black,
  },
  icon: {
    width: 11,
    height: 10,
    tintColor: 'rgba(167, 167, 167, 1)',
  },
  profile: {
    width: 105,
    height: 102,
    borderRadius: 8,
  },
  card_inner_row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 5,
  },
  service: {
    fontSize: 20,
    color: colors.black,
    fontFamily: fonts.semiBold,
    marginTop: 10,
    marginHorizontal: 16,
  },
  icon2: {
    width: 14,
    height: 14,
    resizeMode: 'contain',
  },
  icon_background: {
    width: isSmallScreen ? 34 : 38,
    height: isSmallScreen ? 34 : 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 19,
    zIndex: 10,
  },
  icon_background2: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    zIndex: 10,
  },
  Card_body: {
    paddingVertical: isSmallScreen ? 10 : 14,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  plus: {
    width: 25,
    height: 25,
  },
  titleText: {
    fontSize: screenWidth < 400 ? 16 : 18,
    width: WP('60'),
    textAlign: 'center',
    fontFamily: fonts.bold,
    color: colors.black,
    marginBottom: screenWidth < 400 ? 5 : 10,
  },
  usernameContainer: {
    position: 'absolute',
    bottom: 0,
    width: 40,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'contain',
    height: 53,
  },
  imagelengthText: {
    color: colors.background,
    fontSize: fontSizes.small,
    fontFamily: fonts.semiBold,
    marginTop: 10,
  },
});
