import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import React, {useState} from 'react';
import {colors, fonts} from '../../utils/styles';
import Tag from '../../../assets/icons/tags.svg';
import FirstPurchase from '../../../assets/icons/first_purchase.svg';
const screenWidth = Dimensions.get('window').width;
const isSmallScreen = screenWidth < 400;
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';

const Compaign = ({data, branchId}) => {
  const navigation = useNavigation();
  const {selectServies, branchid, selectBundles, selectBogo, SelectedProducts} =
    useSelector(state => state.cart);

  const filterServices = selectServies.filter(service => service.branch === branchId && service.compaigntype)
      .map(service => service.compaigntype)

  console.log('filterServices', filterServices);

  const selectedCampaignTypes = [
    ...SelectedProducts.filter(
      product => product.branch === branchId && product.compaigntype,
    ).map(product => product.compaigntype),
    ...selectServies
      .filter(service => service.branch === branchId && service.compaigntype)
      .map(service => service.compaigntype),

    ...selectBundles
      .filter(bundle => bundle.branch === branchId )
      .map(bundle => bundle.type),

    ...selectBogo
      .filter(bogo => bogo.branch === branchId)
      .map(bogo => bogo.type),
  ];

  console.log('selectedCampaignTypes', selectedCampaignTypes);
  const navigateToDetails = item => {
    navigation.navigate('CompaignService', {item, branchId});
  };

  const filteredData = data?.filter(item => item.type !== 'bundleDeal');


  const CardItem = ({item, index}) => {
    const isSelected = selectedCampaignTypes.includes(item.type);
    // Count how many items are selected for this specific campaign type
    const countForThisType = selectedCampaignTypes.filter(
      type => type === item.type,
    ).length;

    return (
      <TouchableOpacity
        style={[
          styles.container,
          {
            backgroundColor:
              item.type === 'firstPurchase'
                ? colors.whiteGray
                : colors.whiteGray,
          },
          {
            backgroundColor: isSelected ? colors.lightPurple : colors.whiteGray,
            borderWidth: isSelected ? 1 : 0,
            borderColor: isSelected ? colors.lightPurple : 'transparent',
          },
          isSelected && {paddingBottom: 20},
        ]}
        activeOpacity={0.9}
        onPress={() => navigateToDetails(item)}
        disabled={item?.type === 'firstPurchase'}>
        <Text
          allowFontScaling={false}
          style={[
            styles.title,
            {color: colors.black},
            isSelected && {marginTop: 20},
          ]}>
          {item?.title}
        </Text>
        <Text
          allowFontScaling={false}
          style={[styles.description, {color: colors.black}]}>
          {item?.description}
        </Text>
        {item?.type === 'firstPurchase' && (
          <Text
            allowFontScaling={false}
            style={[styles.description, {color: colors.black}]}>
            {item?.discount}%
          </Text>
        )}
        {item?.type ? (
          <View
            style={[
              styles.icon_background,
              {
                backgroundColor:
                  item?.type === 'firstPurchase'
                    ? colors.whiteGray
                    : isSelected
                    ? colors.whiteGray
                    : colors.whiteGray,
                position: 'absolute',
                top: -10,
                right: 0,
              },
            ]}>
            {item?.type === 'firstPurchase' ? (
              <FirstPurchase width={20} height={20} />
            ) : (
              <Tag width={20} height={20} />
            )}
          </View>
        ) : null}

        {isSelected ? (
          <View
            style={[
              styles.icon_background,
              {
                backgroundColor:
                  item?.type === 'firstPurchase'
                    ? colors.whiteGray
                    : colors.whiteGray,
                position: 'absolute',
                top: -10,
                left: 0,
              },
            ]}>
            <Text style={[styles.description, {color: colors.primary}]}>
              {countForThisType}
            </Text>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };
  const renderItem = ({item, index}) => {
    // Check if type is 'samplepack' and services length is less than 0
    if (item?.type === 'samplePack' && item?.inventories?.length <= 0) {
      return null; // Don't render the card
    }
    return <CardItem item={item} index={index} />;
  };

  return (
    <View>
      <FlatList
        renderItem={renderItem}
        data={filteredData}
        keyExtractor={item => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{marginVertical: 10}}
      />
    </View>
  );
};

export default Compaign;

const styles = StyleSheet.create({
  container: {
    minHeight: 76,
    borderRadius: 10,
    width: '100%',
    paddingHorizontal: 13,
    paddingVertical: 8,
    marginVertical: 5,
    position: 'relative',
  },
  title: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
  },
  description: {
    fontSize: 13, // Adjust as needed
    fontFamily: fonts.regular,
  },
  icon_background: {
    width: isSmallScreen ? 34 : 38,
    height: isSmallScreen ? 34 : 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 19,
    zIndex: 10,
  },
});
