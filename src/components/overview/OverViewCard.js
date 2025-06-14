import {StyleSheet, Text, View, TouchableOpacity, FlatList} from 'react-native';
import React from 'react';
import {fontSizes, fonts, colors} from '../../utils/styles';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {useDispatch} from 'react-redux';
import {
  RemoveSelectedService,
  RemoveSelectedProduct,
} from '../../store/slices/cart';
import Toast from 'react-native-toast-message';
import Clock from '../../../assets/icons/clock.svg';

const OverViewCard = ({selecteddata, activeButton, currencyCode}) => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const route = useRoute();
  const dispatch = useDispatch();
  const removeItem = id => {
    if (activeButton === 'products') {
      dispatch(RemoveSelectedProduct(id));
      Toast.show({
        type: 'success',
        position: 'top',
        bottomOffset: 20,
        text1: t('success'),
        text2: t('productremoveSuccessfully'),
        visibilityTime: 3000,
      });
    } else {
      dispatch(RemoveSelectedService(id));
      Toast.show({
        type: 'success',
        position: 'top',
        bottomOffset: 20,
        text1: t('success'),
        text2: t('serviceremoveSuccessfully'),
        visibilityTime: 3000,
      });
    }
  };

  const CardItem = ({item}) => {
    return (
      <View
        style={[
          styles.container,
          {backgroundColor: colors.whiteGray, position: 'relative'},
        ]}
        activeOpacity={0.9}>
        <Text
          allowFontScaling={false}
          style={[styles.title, {color: colors.black}]}>
          {activeButton === 'products'
            ? item?.inventory?.title
            : item?.service?.title}
        </Text>

        <View style={styles.rowContainerEnd}>
          <TouchableOpacity style={[styles.rowContainer, {flex: 1}]}>
            <Text
              allowFontScaling={false}
              style={[styles.priceText, {color: colors.primary}]}>
              {activeButton === 'products'
                ? item?.inventory?.variants &&
                  item?.inventory?.price?.toFixed(2)
                : item?.service?.price?.toFixed(2)}
              <Text allowFontScaling={false} style={styles.currencyText}>
                {''} {currencyCode}
              </Text>
            </Text>

            {item?.service?.time && (
              <View style={[styles.rowContainer, {gap: 8}]}>
                <Clock width={20} height={20} color="#707070" />
                <Text allowFontScaling={false} style={styles.timeText}>
                  {item?.service?.time}
                </Text>
              </View>
            )}
            {item?.service?.category && (
              <Text
                allowFontScaling={false}
                style={[styles.timeText, {flex: 1}]}
                numberOfLines={2}>
                {item?.service?.category?.name}
              </Text>
            )}
          </TouchableOpacity>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
            {activeButton === 'products' && (
              <Text allowFontScaling={false} style={styles.itemCount}>
                {' '}
                x{item?.quantity}{' '}
              </Text>
            )}

            <TouchableOpacity
              style={[
                styles.bookButton,
                {
                  backgroundColor: colors.warning,
                },
              ]}
              onPress={() => {
                const id =
                  activeButton === 'services'
                    ? item?.service?._id
                    : item?.inventory?._id;
                removeItem(id);
              }}>
              <Text
                allowFontScaling={false}
                style={[styles.buttonText, {color: colors.background}]}>
                {t('Remove')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderItem = ({item, index}) => (
    <CardItem navigation={navigation} item={item} index={index} />
  );

  return (
    <View>
      <FlatList
        renderItem={renderItem}
        data={selecteddata}
        keyExtractor={item => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.WaitingList,
          {
            marginTop:
              activeButton !== 'Services' && route.name !== 'OverView' && 20,
          },
        ]}
      />
    </View>
  );
};

export default OverViewCard;

const styles = StyleSheet.create({
  container: {
    minHeight: 76,
    borderRadius: 10,
    width: '100%',
    paddingHorizontal: 13,
    paddingVertical: 8,
    marginVertical: 10,
  },
  title: {
    fontSize: fontSizes.xSmall,
    fontFamily: fonts.semiBold,
    flex: 1,
  },
  bookButton: {
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    width: 67,
    alignSelf: 'flex-end',
    elevation: 1,
  },
  timeText: {
    color: colors.black,
    fontSize: fontSizes.xSmall,
    fontFamily: fonts.regular,
  },
  priceText: {
    fontSize: fontSizes.xMedium,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
  currencyText: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.black,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  rowContainerEnd: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 5,
  },
  itemCount: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.green,
    marginTop: 20,
  },
  buttonText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
  },
});
