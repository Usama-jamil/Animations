import React, { useState, useEffect } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { API_ENDPOINTS, postRequest } from '../../utils/apiService';
import { SetSelectedProducts } from '../../store/slices/cart';
import CustomHeader from '../../components/header/CustomHeader';
import GeneralModal from '../../components/modal/GeneralModal';
import Minus from '../../../assets/icons/minus.svg';
import Plus from '../../../assets/icons/plus.svg';
import { colors, fontSizes, fonts } from '../../utils/styles';
import FastImage from 'react-native-fast-image';
import Toast from 'react-native-toast-message';

const product_PER_PAGE = 10;

const SuggestedProducts = ({ route }) => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const services = route?.params?.services;
  const filteredProducts = route?.params?.filteredProducts;
  const [products, setProducts] = useState([]);
  const [productPage, setProductPage] = useState(1);
  const [productTotalPages, setProductTotalPages] = useState(1);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [suggestedProducts, setsuggestedProducts] = useState([]); // Changed to an array for compatibility with array methods
  const { SelectedProducts, branchid } = useSelector(state => state.cart);
  useEffect(() => {
    initiallyFetchData();
  }, []);

  const initiallyFetchData = async () => {
    setIsLoading(true);
    const data = {
      services:
        services?.length > 0
          ? services?.map(data => data?._id)
          : [],
      branch: branchid,
      inventories: filteredProducts?.length > 0
        ? filteredProducts?.map(data => data?._id)
        : []
    };

    const result = await postRequest(
      `${API_ENDPOINTS.product.suggested}?pageno=${productPage}&limit=${product_PER_PAGE}`,
      data,
    );

    setIsLoading(false);
    if (result.success) {
      // Handle the products and include variants
      console.log('formdata', result?.data.data);
      const formattedProducts = formatProductData(result?.data.data);
      setProducts(formattedProducts);
      setProductTotalPages(result?.data?.total_pages);
    } else {
      setErr(true);
      setErrMsg(result.error);
    }
  };

  // Function to format product data and include variants
  // Function to format product data and exclude variants
  const formatProductData = products => {
    let formattedProducts = [];

    products.forEach(product => {
      // Include only the base product
      formattedProducts.push({
        ...product,
        isVariant: false, // Custom property to indicate it's a base product
      });
    });

    return formattedProducts;
  };


  const handleLoadMoreProducts = async () => {
    if (productPage < productTotalPages) {
      const nextPage = productPage + 1;
      setProductPage(nextPage);
      const data = {
        services: selectServies?.map(data => data?._id),
        branch: branchid,
      };
      const result = await postRequest(
        `${API_ENDPOINTS.product.suggested}?pageno=${nextPage}&limit=${product_PER_PAGE}`,
        data,
      );
      if (result?.success) {
        const newProducts = result?.data.data;
        setProducts([...products, ...newProducts]);
      }
    }
  };

  const increment = item => {
    const identifier = item._id; // Use _id for all products

    const existingProduct = suggestedProducts.find(prod => prod.inventory === identifier);

    if (existingProduct) {
      // Increment only if the existing product is found and stock is available
      if (existingProduct.quantity < item.totalStock) {
        const updatedProducts = suggestedProducts.map(prod =>
          prod.inventory === identifier
            ? {
              ...prod,
              quantity: prod.quantity + 1,
              total: item.price * (prod.quantity + 1), // Update total correctly
            }
            : prod
        );
        setsuggestedProducts(updatedProducts);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Stock Limit Exceeded',
          text2: `Cannot exceed available stock of ${item.totalStock} units for ${item.title}`,
          position: 'top',
        });
      }
    } else {
      // Add new product
      const newProduct = {
        inventory: item._id,
        _id: item._id,
        quantity: 1,
        total: item.price, // Set total based on the price of the item
        price: item.price,
        branch: branchid,
      };
      setsuggestedProducts([...suggestedProducts, newProduct]);
    }
  };

  const decrement = item => {
    const identifier = item._id; // Use _id for all products

    const existingProduct = suggestedProducts.find(prod => prod.inventory === identifier);

    if (existingProduct) {
      if (existingProduct.quantity > 1) {
        const updatedProducts = suggestedProducts.map(prod =>
          prod.inventory === identifier
            ? {
              ...prod,
              quantity: prod.quantity - 1,
              total: item.price * (prod.quantity - 1),
            }
            : prod
        );
        setsuggestedProducts(updatedProducts);
      } else {
        // Remove product if quantity is 1 and decrement is called
        const filteredProducts = suggestedProducts.filter(prod => prod.inventory !== identifier);
        setsuggestedProducts(filteredProducts);
      }
    }
  };




  const handleContinue = () => {
    const productsWithQuantity = Object.values(suggestedProducts).filter(
      prod => prod.quantity > 0,
    );

    console.log('product quantity', productsWithQuantity)

    productsWithQuantity.forEach(prod => {
      dispatch(SetSelectedProducts(prod));
    });

    navigation.navigate('OverView');
  };

  const Item = ({ item, index }) => {
    const productQuantity = suggestedProducts.find(prod =>
      item.isVariant
        ? prod.variantId === item.variantid
        : prod.inventory === item._id,
    );

    return (
      <View
        style={[
          styles.itemContainer,
          { backgroundColor: colors.whiteGray },
        ]}
      >
        <TouchableOpacity style={[styles.imageContainer, { position: 'relative' }]} onPress={() =>
          navigation.navigate('ProductDetails', {
            id: item.isVariant ? item?.inventory : item?._id,
            show: true,
          })
        }>
          <FastImage
            style={styles.image}
            source={{ uri: item?.images[0] }}
            resizeMode={FastImage.resizeMode.cover}
          />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { flex: 1 }]}>{item.title || item?.variantTitle}  </Text>

          <View style={[styles.rowContainer, { marginVertical: -10 }]}>
            <TouchableOpacity
              style={[styles.countCircle, { backgroundColor: colors.warning }]}
              onPress={() => decrement(item)}>
              <Minus width={24} height={24} />
            </TouchableOpacity>
            <Text allowFontScaling={false} style={styles.number}>
              {productQuantity?.quantity || 0}
            </Text>
            <TouchableOpacity
              style={[styles.countCircle, { backgroundColor: colors.primary }]}
              onPress={() => increment(item)}>
              <Plus width={24} height={24} />
            </TouchableOpacity>
          </View>

          <View style={[styles.rowContainerstart, { paddingVertical: 4 }]}>
            <Text style={styles.priceText}>{item?.price?.toFixed(2)}</Text>
            <Text style={styles.currencyText}> {item?.currency?.code}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader title={t('suggestedProducts')} />
      {err && (
        <GeneralModal
          modalError={true}
          description={errMsg}
          Set_Modal_Visibilty={setErr}
        />
      )}
      {isLoading ? (
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 20,
          }}>
          <ActivityIndicator size={'large'} color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={products.filter(item => item.totalStock > 0)}
          renderItem={({ item, index }) => <Item item={item} index={index} />}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ margin: 10 }}
          onEndReached={handleLoadMoreProducts}
          onEndReachedThreshold={0.6}
        />
      )}
      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueButtonText}>{t('continue')}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default SuggestedProducts;
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
    alignItems: 'flex-start',
    gap: 10,
  },
  imageContainer: {
    width: 61,
    height: 54,
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
    color: colors.black,
  },
  rowContainerstart: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 15,
  },
  countCircle: {
    width: 21,
    height: 21,
    borderRadius: 21 / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  number: {
    fontSize: fontSizes.mSmall,
    textAlign: 'center',
    fontFamily: fonts.medium,
    marginTop: 10,
    color: colors.black,
    alignSelf: 'center',
  },
  continueButton: {
    backgroundColor: colors.primary,
    padding: 15,
    margin: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonText: {
    color: colors.background,
    fontSize: fontSizes.small,
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
  priceText: {
    fontSize: fontSizes.xSmall,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
  currencyText: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.black,
  },
});
