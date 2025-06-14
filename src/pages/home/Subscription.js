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
import {useFocusEffect} from '@react-navigation/native';

import {useTranslation} from 'react-i18next';
import {colors, fontSizes, fonts} from '../../utils/styles';
import {widthPercentageToDP as WP} from 'react-native-responsive-screen';
import bg_shadow from '../../../assets/images/image_bg_shadow.png';
import WalletIcon from '../../../assets/icons/wallet-alt.svg';
import StartSharpIcon from '../../../assets/icons/star-round.svg';

import {useDispatch} from 'react-redux';
import ActivityIndicatorModal from '../../components/modal/ActivityIndicatorModal';
import {useSelector} from 'react-redux';
const screenWidth = Dimensions.get('window').width;
const isSmallScreen = screenWidth < 400;
import FastImage from 'react-native-fast-image';
import {API_ENDPOINTS} from '../../utils/apiService';
import GeneralModal from '../../components/modal/GeneralModal';
import {getRequest} from '../../utils/apiService';
import ImagePreview from '../../components/imagePreview/ImagePreview';
const service_PER_PAGE = 10;

const AllSubscriptions = ({navigation}) => {
  const {t} = useTranslation();

  const [Subscription, setSubscription] = useState([]);
  const [subscriptionPage, setsubscriptionPage] = useState(1);
  const [subscriptionTotalPages, setsubscriptionTotalPages] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [images, setImages] = useState([]);
  // const {isLoading} = useSelector(state => state.subscription);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, []),
  );

  const fetchData = async () => {
    setIsLoading(true);
    const result = await getRequest(API_ENDPOINTS.subscription.getAll);
    console.log('result', result?.data?.data);
    setIsLoading(false);
    if (result.success) {
      setSubscription(result?.data?.data);
      setsubscriptionTotalPages(result?.data?.total_pages);
    } else {
      console.log('error');
      setErr(true);
      setErrMsg(result.error);
    }
  };

  const handleLoadMoreServices = async () => {
    if (subscriptionPage < subscriptionTotalPages) {
      const nextPage = subscriptionPage + 1;
      setsubscriptionPage(nextPage);
      const result = await getRequest(API_ENDPOINTS.subscription.getAll);

      if (result?.success) {
        const newservices = result?.data?.data;
        setSubscription([...services, ...newservices]);
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    const result = await getRequest(API_ENDPOINTS.subscription.getAll);

    setRefreshing(false);
    if (result.success) {
      setSubscription(result?.data.data);
      setsubscriptionTotalPages(result?.data?.total_pages);
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
          styles.Subscription_card_container,
          {
            backgroundColor: colors.whiteGray,
            borderRadius: 12,
            position: 'relative',
            marginTop: index === 0 ? 10 : 5,
          },
        ]}
        onPress={() =>
          navigation.navigate('SubscriptionDetail', {
            state: true,
            id: item?._id,
            bookingId: '',
            subscriptionId: '',
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
                style={[
                  styles.date,
                  {marginTop: 4, marginLeft: 3, fontFamily: fonts.medium},
                ]}>
                {item?.averageRating?.toFixed(1)}
              </Text>
            </View>

            <View style={styles.card_inner_row}>
              <WalletIcon width={18} height={18} style={styles.starIcon} />
              <Text
                allowFontScaling={false}
                style={[
                  styles.subtitle,
                  {
                    marginTop: 4,
                    fontSize: 13,
                    fontFamily: fonts.semiBold,
                  },
                ]}>
                {item?.rentPerHour?.toFixed(2)}
              </Text>

              <Text
                allowFontScaling={false}
                style={[styles.subtitle, {marginTop: 5}]}>
                {item?.currency?.code} / t('Hour')
              </Text>
            </View>

              <View style={styles.card_inner_row}>
              <WalletIcon width={18} height={18} style={styles.starIcon} />
              <Text
                allowFontScaling={false}
                style={[
                  styles.subtitle,
                  {
                    marginTop: 4,
                    fontSize: 13,
                    fontFamily: fonts.semiBold,
                  },
                ]}>
                {item?.rentPerHour?.toFixed(2)}
              </Text>

              <Text
                allowFontScaling={false}
                style={[styles.subtitle, {marginTop: 5}]}>
                {item?.currency?.code} / t('Day')
              </Text>
            </View>
          </View>
        </View>

       
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.superContainer}>
      {isLoading && <ActivityIndicatorModal loaderIndicator={isLoading} />}
      {err && (
        <GeneralModal
          modalError={true}
          description={errMsg}
          Set_Modal_Visibilty={setErr}
        />
      )}
      <CustomHeader title={t('mySubscriptions')} />
      {Subscription?.length > 0 ? (
        <FlatList
          data={Subscription}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{marginTop: 15, overflow: 'visible'}}
          onEndReached={handleLoadMoreServices}
          onEndReachedThreshold={0.6}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <Text allowFontScaling={false} style={styles.noDataText}>
          {t('noDataFound')}
        </Text>
      )}
      <ImagePreview
        images={images}
        isVisible={isPreviewVisible}
        onClose={() => setIsPreviewVisible(false)}
      />
    </SafeAreaView>
  );
};

export default AllSubscriptions;

const styles = StyleSheet.create({
  superContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  Subscription_card_container: {
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
    fontSize: 10,
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
  Subscription: {
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
  noDataText: {
    fontSize: fontSizes.xSmall,
    color: colors.black,
    fontFamily: fonts.medium,
    textAlign: 'center',
    marginTop: 20,
  },
});
