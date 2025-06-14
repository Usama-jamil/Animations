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
import bg_shadow from '../../../assets/images/image_bg_shadow.png';
import ClockIcon from '../../../assets/icons/clock.svg';

const screenWidth = Dimensions.get('window').width;
const isSmallScreen = screenWidth < 400;
const freeSample_PER_PAGE = 10;

const FirstPurchaseList = ({navigation}) => {
  const {t} = useTranslation();
  // API data
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  //  freeSample Data
  const [freeSample, setfreeSample] = useState([]);
  const [freeSamplePage, setfreeSamplePage] = useState(1);
  const [freeSampleTotalPages, setfreeSampleTotalPages] = useState(1);
  const [freeSampleLoading, setfreeSampleLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  console.log('free sample', freeSample);

  useEffect(() => {
    initiallyFetchData();
  }, []);

  const initiallyFetchData = async () => {
    setfreeSampleLoading(true);
    const result = await getRequest(
      `${
        API_ENDPOINTS.compaigns.getAll
      }?pageno=${1}&limit=${freeSample_PER_PAGE}&type=firstPurchase`,
    );
    setfreeSampleLoading(false);
    if (result.success) {
      setfreeSample(result?.data.data);
      setfreeSampleTotalPages(result?.data?.total_pages);
    } else {
      setErr(true);
      setErrMsg(result.error);
    }
  };

  const handleLoadMorefreeSample = async () => {
    if (freeSamplePage < freeSampleTotalPages) {
      const nextPage = freeSamplePage + 1;
      setfreeSamplePage(nextPage);
      const result = await getRequest(
        `${API_ENDPOINTS.compaigns.getAll}?pageno=${nextPage}&limit=${listing_PER_PAGE}&type=firstPurchase`,
      );
      if (result?.success) {
        const newlistings = result?.data.data;
        setfreeSample([...listings, ...newlistings]);
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    const result = await getRequest(
      `${
        API_ENDPOINTS.compaigns.getAll
      }?pageno=${1}&limit=${freeSample_PER_PAGE}&type=firstPurchase`,
    );
    setRefreshing(false);
    if (result.success) {
      setfreeSample(result?.data.data);
      setfreeSampleTotalPages(result?.data?.total_pages);
    } else {
      console.log('error');
      setErr(true);
      setErrMsg(result.error);
    }
  };

  const renderItem = ({item, index}) => {
    return (
      <TouchableOpacity
        style={{
          backgroundColor: '#FAFAFA',
          borderRadius: 12,
          position: 'relative',
          marginTop: index === 0 ? 10 : 5,
          padding: 10,
        }}
        onPress={() =>
          navigation.navigate('HomeDetails', {
            id: item?._id,
          })
        }>
        <View style={{position: 'relative'}}>
          <TouchableOpacity
            onPress={() => {
              setImages(item?.images?.map(image => ({uri: image})));
              setIsPreviewVisible(true);
            }}
            disabled={true}>
            <FastImage
              style={styles.profile}
              source={{
                uri: item?.images?.[0],
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

        <View style={{marginTop: 5, flex: 1}}>
          <Text allowFontScaling={false} style={styles.title}>
            {item?.title}
          </Text>
          <View
            style={[
              styles.row,
              {justifyContent: 'space-between', marginTop: 5},
            ]}>
            <Text style={[styles.discountedPrice, {flex: 1}]} numberOfLines={2}>
              {item?.description}
            </Text>
            <View style={[styles.row, {alignItems: 'center'}]}>
              <Image
                source={require('../../../assets/icons/percentage.png')}
                style={{width: 18, height: 18, resizeMode: 'contain'}}
              />
              <Text
                style={[styles.dateText, {color: colors.black, marginLeft: 8}]}>
                {item?.discount}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title={t('firstPurchase')} />

      {err && (
        <GeneralModal
          modalError={true}
          description={errMsg}
          Set_Modal_Visibilty={setErr}
        />
      )}
      {freeSampleLoading ? (
        <View style={{paddingVertical: 20}}>
          <ActivityIndicator animating size="large" color={colors.primary} />
        </View>
      ) : freeSample?.length > 0 ? (
        <>
          <FlatList
            data={freeSample}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={{marginHorizontal: 20}}
            onEndReached={handleLoadMorefreeSample}
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
  profile: {
    width: '100%',
    height: 102,
    borderRadius: 8,
    resizeMode: 'cover',
    backgroundColor: colors.gray,
  },
  dateText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.warning,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  discountedPrice: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.black,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.black,
  },
});

export default FirstPurchaseList;
