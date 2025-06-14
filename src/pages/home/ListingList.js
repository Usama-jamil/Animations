import {
  StyleSheet,
  Text,
  View,
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
import bg_shadow from '../../../assets/images/image_bg_shadow.png';
import WalletIcon from '../../../assets/icons/wallet-alt.svg';
import StartSharpIcon from '../../../assets/icons/star-round.svg';
import ActivityIndicatorModal from '../../components/modal/ActivityIndicatorModal';
import GeneralModal from '../../components/modal/GeneralModal';
const screenWidth = Dimensions.get('window').width;
const isSmallScreen = screenWidth < 400;
import FastImage from 'react-native-fast-image';
import {getRequest} from '../../utils/apiService';
import {useFocusEffect} from '@react-navigation/native';
import ImagePreview from '../../components/imagePreview/ImagePreview';
import {API_ENDPOINTS} from '../../utils/apiService';

const listing_PER_PAGE = 10;

const ListingList = ({navigation}) => {
  const {t} = useTranslation();
  const [listings, setlistings] = useState([]);
  const [listingPage, setlistingPage] = useState(1);
  const [listingTotalPages, setlistingTotalPages] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      initiallyFetchData();
    }, []),
  );

  const initiallyFetchData = async () => {
    setIsLoading(true);
    const result = await getRequest(
      `${API_ENDPOINTS.rental.getAll}?pageno=${1}&limit=${listing_PER_PAGE}`,
    );
    console.log('result', result);
    setIsLoading(false);
    if (result.success) {
      setlistings(result?.data.data);
      setlistingTotalPages(result?.data?.total_pages);
    } else {
      console.log('error');
      setErr(true);
      setErrMsg(result.error);
    }
  };

  const handleLoadMorelistings = async () => {
    if (listingPage < listingTotalPages) {
      const nextPage = listingPage + 1;
      setlistingPage(nextPage);
      const result = await getRequest(
        `${API_ENDPOINTS.rental.getAll}?pageno=${nextPage}&limit=${listing_PER_PAGE}`,
      );
      if (result?.success) {
        const newlistings = result?.data.data;
        setlistings([...listings, ...newlistings]);
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    const result = await getRequest(
      `${API_ENDPOINTS.rental.getAll}?pageno=${1}&limit=${listing_PER_PAGE}`,
    );
    setRefreshing(false);

    if (result.success) {
      setlistings(result?.data.data);
      setlistingTotalPages(result?.data?.total_pages);
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
          styles.listing_card_container,
          {
            backgroundColor: colors.whiteGray,
            borderRadius: 12,
            position: 'relative',
            marginTop: index === 0 ? 10 : 5,
          },
        ]}
        onPress={() =>
          navigation.navigate('ListingDetail', {
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
                }}
                disabled={true}>
                <FastImage
                  style={styles.profile}
                  source={{
                    uri: item?.images[0],
                  }}
                  resizeMode={FastImage.resizeMode.cover}
                />
              </TouchableOpacity>
   {item?.rentPerHour > 0 && (
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
                      color: colors.white,
                      textAlign: 'center',
                    }}>
                     {item?.currency?.code || ''} {item?.rentPerHour || 0} /Hour
                  </Text>
                </View>
              )}
              {item?.rentPerDay > 0  && (
                <View
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: colors.primary,
                    padding: 6,
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 0,
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                  }}>
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontSize: 8,
                      fontFamily: fonts.medium,
                      color: colors.white,
                      textAlign: 'center',
                    }}>
                  {item?.currency?.code || ''} {item?.rentPerDay || 0} /Day
                  </Text>
                </View>
              )}
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
              {item?.name}
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

              <Text
                allowFontScaling={false}
                style={[
                  styles.subtitle,
                  {marginTop: 5, color: colors.primary},
                ]}>
                {item?.totalValue} {item?.currency?.code}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.superContainer}>
      <CustomHeader title={t('rental')} />
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
        data={listings}
        keyExtractor={item => item._id}
        contentContainerStyle={{
          marginTop: 15,
          overflow: 'visible',
          paddingBottom: 20,
        }}
        onEndReached={handleLoadMorelistings}
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

export default ListingList;

const styles = StyleSheet.create({
  superContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listing_card_container: {
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
  listing: {
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
