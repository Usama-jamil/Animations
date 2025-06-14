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
import React, {useState} from 'react';
import {TouchableOpacity} from 'react-native';
import {useTranslation} from 'react-i18next';
import {colors, commonStyles, fontSizes, fonts} from '../../utils/styles';
import {widthPercentageToDP as WP} from 'react-native-responsive-screen';
import Circle_check from '../../../assets/icons/circle_check_fill.svg';
import Circle_Uncheck from '../../../assets/icons/circle_check_unfill.svg';
import bg_shadow from '../../../assets/images/image_bg_shadow.png';
import FastImage from 'react-native-fast-image';
import {
  RemoveSelectedProduct,
  SetSelectedProducts,
} from '../../store/slices/cart';
import {useDispatch, useSelector} from 'react-redux';
import Toast from 'react-native-toast-message';

const screenWidth = Dimensions.get('window').width;
const isSmallScreen = screenWidth < 400;

const FreeSamplePack = ({navigation, route, campaign}) => {
  const {t} = useTranslation();
  const {SelectedProducts} = useSelector(state => state.cart);
  const dispatch = useDispatch();

  console.log('selectedCompaign', campaign?.type);

  const filteredProducts = SelectedProducts.filter(
    product => product.branch === campaign?.branch,
  );

  const renderItem = ({item, index}) => {
    const isSelected = checkAlreadySelected(item._id);
    console.log('isSelected,', isSelected);
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
          navigation.navigate('ProductDetails', {
            id: item?._id,
            freeSample:true
          })
        }
        >
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
          <View
            style={{
              position: 'relative',
              borderColor: colors.borderColor,
              borderWidth: 1,
              borderRadius: 8,
            }}>
            <FastImage
              style={styles.profile}
              source={{
                uri: item?.images?.[0],
              }}
              resizeMode={FastImage.resizeMode.cover}
            />

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

            <TouchableOpacity
              style={{alignSelf: 'flex-end'}}
              onPress={() => handleAddRemove(item)}>
              {isSelected ? (
                <Circle_check width={24} height={24} />
              ) : (
                <Circle_Uncheck width={24} height={24} />
              )}
            </TouchableOpacity>
            <Text
              allowFontScaling={false}
              style={[styles.subtitle, {marginTop: 5, color: colors.primary}]}>
              {item?.category?.name}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const handleAddRemove = item => {
    const isAlreadySelected = checkAlreadySelected(item._id);

    if (isAlreadySelected) {
      // Remove from Redux
      dispatch(RemoveSelectedProduct(item._id));
      Toast.show({
        type: 'success',
        position: 'top',
        bottomOffset: 20,
        text1: t('Success'),
        text2: t('productRemovedSuccessfully'),
        visibilityTime: 3000,
      });
    } else {
      // Add to Redux
      const updatedItem = {
        ...item,
        compaigntype: campaign.type,
        compaignId: campaign?._id,
        price: 0,
        quantity: 1,
        branch: campaign?.branch,
        inventory: item._id,
        _id: item._id,
        total: 0,
      };

      dispatch(SetSelectedProducts(updatedItem));
      Toast.show({
        type: 'success',
        position: 'top',
        bottomOffset: 20,
        text1: t('Success'),
        text2: t('Product added successfully'),
        visibilityTime: 3000,
      });
    }
  };

  const checkAlreadySelected = itemId => {
    return filteredProducts.some(product => product?._id === itemId);
  };

  return (
    <SafeAreaView style={styles.superContainer}>
      <Text allowFontScaling={false} style={styles.service}>
        {campaign?.description}
      </Text>

      <FlatList
        renderItem={renderItem}
        data={campaign?.inventories}
        keyExtractor={item => item._id}
        contentContainerStyle={{
          marginTop: 15,
          overflow: 'visible',
          paddingBottom: 20,
        }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default FreeSamplePack;

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
  },
  service: {
    fontSize: 15,
    color: colors.black,
    fontFamily: fonts.medium,
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
  continueButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  noDataText: {
    fontSize: fontSizes.xSmall,
    color: colors.black,
    fontFamily: fonts.medium,
    textAlign: 'center',
    marginTop: 20,
  },
});
