import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {colors, commonStyles, fontSizes, fonts} from '../../utils/styles';
import {useTranslation} from 'react-i18next';
import OverViewCard from './OverViewCard';
import Bundles from '../home-details/Bundles';
import BogoCard from '../booking-setup/BogoCard';
import HappyHourCard from '../booking-setup/HappyHourCard';
import {useNavigation} from '@react-navigation/native';

const OverView = ({data, currencyCode, hasItems}) => {
  const {t} = useTranslation();
  const navigation = useNavigation();

  const hasFirstPurchaseCampaign =
    data?.receipt?.compaigns?.length === 1 &&
    data?.receipt?.compaigns[0]?.type === 'firstPurchase';

  const hasSamplePackCampaign =
    data?.receipt?.compaigns?.length === 1 &&
    data?.receipt?.compaigns[0]?.type === 'samplePack';

  const hasNoCampaigns = data?.receipt?.compaigns?.length === 0;
  const hasServices = data?.booking?.services?.length > 0;

  // Show services card if:
  // 1. Has first purchase campaign OR
  // 2. No campaigns and has services
  const shouldShowServices =
    hasFirstPurchaseCampaign || (hasNoCampaigns && hasServices);

  console.log('data', data?.booking?.inventories?.length);

  return (
    <View style={{marginHorizontal: 10}}>
      {(shouldShowServices || hasSamplePackCampaign) && (
        <>
          <Text allowFontScaling={false} style={styles.title}>
            {t('services')}
          </Text>
          <OverViewCard
            selecteddata={data?.booking?.services}
            activeButton={'services'}
            currencyCode={currencyCode}
          />
        </>
      )}

      {data?.booking?.inventories?.length > 0 &&
        (hasFirstPurchaseCampaign || hasSamplePackCampaign || hasNoCampaigns) && (
          <>
            <Text allowFontScaling={false} style={styles.title}>
              {t('products')}
            </Text>
            <OverViewCard
              selecteddata={data?.booking?.inventories}
              activeButton={'products'}
              currencyCode={currencyCode}
            />
          </>
        )}

      {data?.receipt?.compaigns?.[0]?.type === 'bundleDeal' && (
        <>
          <Text allowFontScaling={false} style={styles.title}>
            {t('bundle')}
          </Text>
          <Bundles data={data?.booking?.compaigns} />
        </>
      )}

      {data?.receipt?.compaigns?.[0]?.type === 'buyOneGetOne' && (
        <>
          <Text
            allowFontScaling={false}
            style={[styles.title, {marginBottom: 10}]}>
            {t('BuyOneGetOne')}
          </Text>
          <BogoCard data={data?.booking?.compaigns} />
        </>
      )}

      {data?.receipt?.compaigns?.[0]?.type === 'happyHour' && (
        <>
          <Text
            allowFontScaling={false}
            style={[styles.title, {marginTop: 15}]}>
            {t('happyHour')}
          </Text>
          <HappyHourCard data={data?.booking?.compaigns} />
        </>
      )}

      {data?.receipt?.compaigns?.[0]?.type === 'earlyBirdDiscount' && (
        <>
          <Text
            allowFontScaling={false}
            style={[styles.title, {marginTop: 15}]}>
            {t('earlyBird')}
          </Text>
          <HappyHourCard data={data?.booking?.compaigns} type={'earlyBird'} />
        </>
      )}

      <View style={styles.amount}>
        {data?.fare > 0 && (
          <View style={styles.rowContainer}>
            <Text allowFontScaling={false} style={styles.totaltext}>
              {t('fare')}
            </Text>
            <Text allowFontScaling={false} style={styles.price}>
              {fare}{' '}
              <Text allowFontScaling={false} style={styles.currency}>
                {currencyCode}
              </Text>
            </Text>
          </View>
        )}

        {data?.receipt?.subTotal > 0 && (
          <>
            <View style={[styles.rowContainer, {marginTop: 15}]}>
              <Text allowFontScaling={false} style={styles.totaltext}>
                {t('subtotal')}
              </Text>
              <Text allowFontScaling={false} style={styles.price}>
                {data?.receipt?.subTotal}{' '}
                <Text allowFontScaling={false} style={styles.currency}>
                  {currencyCode}
                </Text>
              </Text>
            </View>
            {data?.receipt?.discounts > 0 && (
              <View
                style={[
                  styles.rowContainer,
                  {
                    marginTop: 15,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.borderColor,
                    paddingBottom: 10,
                  },
                ]}>
                <Text allowFontScaling={false} style={styles.totaltext}>
                  {data?.receipt?.compaigns?.[0]?.type === 'firstPurchase'
                    ? t('firstPurchaseDiscount')
                    : t('discounts')}
                </Text>
                <Text allowFontScaling={false} style={styles.price}>
                  {data?.receipt?.discounts}{' '}
                  <Text allowFontScaling={false} style={styles.currency}>
                    {currencyCode}
                  </Text>
                </Text>
              </View>
            )}
          </>
        )}

        <View style={[styles.rowContainer, {marginTop: 15}]}>
          <Text allowFontScaling={false} style={styles.totaltext}>
            {t('total')}
          </Text>
          <Text allowFontScaling={false} style={styles.price}>
            {data?.receipt?.total}{' '}
            <Text allowFontScaling={false} style={styles.currency}>
              {currencyCode}
            </Text>
          </Text>
        </View>
      </View>
      {hasItems && (
        <TouchableOpacity
          style={[commonStyles.btnContainer, {marginVertical: 30}]}
          onPress={() => navigation.navigate('Profession')}>
          <Text allowFontScaling={false} style={commonStyles.btnText}>
            {t('continue')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default OverView;

const styles = StyleSheet.create({
  title: {
    fontSize: fontSizes.small,
    fontFamily: fonts.semiBold,
    color: colors.black,
  },
  banner: {
    marginTop: 40,
    backgroundColor: colors.lightbeige,
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 20,
  },
  totaltext: {
    fontSize: fontSizes.xMedium,
    fontFamily: fonts.medium,
    color: colors.black,
  },
  price: {
    fontSize: fontSizes.xMedium,
    fontFamily: fonts.semiBold,
    color: colors.black,
  },
  currency: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.black,
  },
  amount: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderGrey,
    padding: 13,
    marginTop: 20,
  },
});
