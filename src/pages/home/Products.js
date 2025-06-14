import React, { useState, useEffect } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
  Image,
  SafeAreaView,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';

// Styles import
import { colors, commonStyles, fontSizes, fonts } from '../../utils/styles';
import bg_shadow from '../../../assets/images/image_bg_shadow.png';
import { useFocusEffect } from '@react-navigation/native';
// Data import
import ImagePreview from '../../components/imagePreview/ImagePreview';

// Assets
import WalletIcon from '../../../assets/icons/wallet-alt.svg';
import StartSharpIcon from '../../../assets/icons/star-round.svg';
import CustomHeader from '../../components/header/CustomHeader';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import ActivityIndicatorModal from '../../components/modal/ActivityIndicatorModal';
import FastImage from 'react-native-fast-image';
import { API_ENDPOINTS } from '../../utils/apiService';

import GeneralModal from '../../components/modal/GeneralModal';
import { getRequest } from '../../utils/apiService';
import { color } from '@rneui/base';

const product_PER_PAGE = 10;

const AllProducts = ({ navigation }) => {
  const { t } = useTranslation();
  // const {isLoading} = useSelector(state => state.product)

  const [Product, setProduct] = useState([]);
  const [ProductPage, setProductPage] = useState(1);
  const [ProductTotalPages, setProductTotalPages] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(false);
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);
    const [images, setImages] = useState([]);
  const [errMsg, setErrMsg] = useState('');
  const dispatch = useDispatch();

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, []),
  );

  const fetchData = async () => {
    setIsLoading(true);
    const result = await getRequest(
      `${API_ENDPOINTS.product.getAll}?pageno=${1}&limit=${product_PER_PAGE}`,
    );
    setIsLoading(false);
    if (result.success) {
      setProduct(result?.data.data);
      setProductTotalPages(result?.data?.total_pages);
    } else {
      setErr(true);
      setErrMsg(result.error);
    }
  };

  const handleLoadMoreServices = async () => {
    if (ProductPage < ProductTotalPages) {
      const nextPage = ProductPage + 1;
      setProductPage(nextPage);
      const result = await getRequest(
        `${API_ENDPOINTS.product.getAll}?pageno=${nextPage}&limit=${product_PER_PAGE}`,
      );
      if (result?.success) {
        const newproducts = result?.data.data;
        setProduct([...Product, ...newproducts]);
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    const result = await getRequest(
      `${API_ENDPOINTS.product.getAll}?pageno=${1}&limit=${product_PER_PAGE}`,
    );
    setRefreshing(false);
    if (result.success) {
      setProduct(result?.data.data);
      setProductTotalPages(result?.data?.total_pages);
    } else {
      console.log('error');
      setErr(true);
      setErrMsg(result.error);
    }
  };

  const Item = ({ item, index }) => {
    const colorsArray = [colors.lightBlue, colors.lightPink, colors.paleGrey];

    return (
      <TouchableOpacity
        style={[
          styles.itemContainer,
          {
            backgroundColor: colors.whiteGray,
          },
        ]}
        onPress={() => navigation.navigate('ProductDetails', { id: item?._id })}>
        <View style={styles.imageContainer}>
          <View style={{ position: 'relative' }}>
          <TouchableOpacity
            onPress={() => {
              setImages(item?.images.map(image => ({uri: image})));
              setIsPreviewVisible(true);
            }}
            disabled={true}
          >
          <FastImage
              style={styles.image}
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

        <View style={{ flex: 1, paddingVertical: 10 }}>
          <Text allowFontScaling={false} style={styles.title}>
            {item?.title}
          </Text>

          <View style={[styles.rowContainer, { paddingVertical: 4 }]}>
            <StartSharpIcon width={18} height={18} style={styles.starIcon} />
            <Text allowFontScaling={false} style={styles.raitingText}>
              {item?.averageRating?.toFixed(1)}
            </Text>
          </View>
          <View style={styles.rowContainer}>
            <WalletIcon width={18} height={18} style={styles.starIcon} />
            <Text allowFontScaling={false} style={styles.price}>
              {item?.price?.toFixed(2) || item?.variants?.[0]?.price?.toFixed(2)}
            </Text>

            <Text allowFontScaling={false} style={styles.text}>
              {' '}
              {item?.currency?.code}{' '}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {isLoading && <ActivityIndicatorModal loaderIndicator={isLoading} />}
      {err && (
        <GeneralModal
          modalError={true}
          description={errMsg}
          Set_Modal_Visibilty={setErr}
        />
      )}
      <CustomHeader title={t('products')} />
      <View style={commonStyles.container}>
       
        <FlatList
          data={Product}
          renderItem={({ item, index }) => <Item item={item} index={index} />}
          contentContainerStyle={{ marginVertical: 10, paddingBottom: 110 }}
          keyExtractor={item => item._id}
          onEndReached={handleLoadMoreServices}
          onEndReachedThreshold={0.6}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
        />
      </View>
      <ImagePreview
        images={images}
        isVisible={isPreviewVisible}
        onClose={() => setIsPreviewVisible(false)}
      />
    </SafeAreaView>
  );
};

export default AllProducts;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  itemContainer: {
    padding: 10,
    borderRadius: 12,
    marginRight: 10,
    marginBottom: 10,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  imageContainer: {
    width: 100,
    height: 100,
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    marginBottom: 5,
    flex: 1,

    color: colors.black,
  },
  rowContainerBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginRight: 7,
  },
  raitingText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.black,
  },
  price: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.black,
  },
  text: {
    fontSize: fontSizes.mSmall,
    color: colors.black,
    fontFamily: fonts.regular,
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
