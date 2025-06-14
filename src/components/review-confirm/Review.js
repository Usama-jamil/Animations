import {StyleSheet, Text, View, Dimensions} from 'react-native';
import React from 'react';
import {colors, fontSizes, fonts} from '../../utils/styles';
import {useTranslation} from 'react-i18next';
const screenWidth = Dimensions.get('window').width;
const isSmallScreen = screenWidth < 400;
import {useSelector} from 'react-redux';
import HappyHourCard from '../booking-setup/HappyHourCard';
import BogoCard from '../booking-setup/BogoCard';
import Bundles from '../home-details/Bundles';

const Review = ({data, currencyCode}) => {
  const {t} = useTranslation();
  console.log('data', data);

  const hasFirstPurchaseCampaign =
    data?.receipt?.compaigns?.length === 1 &&
    data?.receipt?.compaigns[0]?.type === 'firstPurchase';

    const hasSamplePackCampaign =
    data?.receipt?.compaigns?.length === 1 &&
    data?.receipt?.compaigns[0]?.type === 'samplePack';

  const hasNoCampaigns = data?.receipt?.compaigns?.length === 0;
  const hasServices = data?.booking?.services?.length > 0;

  const shouldShowServices =
    hasFirstPurchaseCampaign || (hasNoCampaigns && hasServices);
  return (
    <View style={{marginTop: 20}}>
      {(shouldShowServices || hasSamplePackCampaign) && (
        <>
          <Text
            allowFontScaling={false}
            style={[styles.heading, {marginBottom: 10}]}>
            {t('services')}
          </Text>

          <View style={styles.card}>
            {data?.booking?.services?.map(data => (
              <View style={styles.rowContainer}>
                <View style={{flex: 1}}>
                  <Text allowFontScaling={false} style={styles.title}>
                    {data?.service?.title}
                  </Text>

                  <Text allowFontScaling={false} style={styles.subtitle}>
                    {data?.service?.time}
                  </Text>
                </View>
                <Text
                  allowFontScaling={false}
                  style={[styles.price, {alignSelf: 'flex-start'}]}>
                  {data?.service?.price}{' '}
                  <Text allowFontScaling={false} style={styles.currency}>
                    {' '}
                    {currencyCode}{' '}
                  </Text>
                </Text>
              </View>
            ))}
          </View>
        </>
      )}

    {(data?.booking?.inventories?.length > 0 && (hasFirstPurchaseCampaign || hasSamplePackCampaign || hasNoCampaigns)) && (
        <>
          <Text
            allowFontScaling={false}
            style={[styles.heading, {marginVertical: 10}]}>
            {t('products')}
          </Text>
          <View style={styles.card}>
            {data?.booking?.inventories?.map(data => {
              return (
                <View key={data.id} style={styles.rowContainer}>
                  <View style={{flex: 1}}>
                    <Text allowFontScaling={false} style={styles.title}>
                      {data?.inventory?.title}{' '}
                      <Text style={[styles.subtitle, {color: colors.primary}]}>
                        {' '}
                        x{data?.quantity}{' '}
                      </Text>
                    </Text>
                    <Text allowFontScaling={false} style={styles.subtitle}>
                      {data?.inventory?.category?.name}
                    </Text>
                  </View>
                  <Text
                    allowFontScaling={false}
                    style={[styles.price, {alignSelf: 'flex-start'}]}>
                    {data?.inventory?.price}{' '}
                    <Text allowFontScaling={false} style={styles.currency}>
                      {currencyCode}
                    </Text>
                  </Text>
                </View>
              );
            })}
          </View>
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
            style={[styles.title, {marginTop: 10}]}>
            {t('earlyBird')}
          </Text>
          <HappyHourCard data={data?.booking?.compaigns} type={'earlyBird'}  />
        </>
      )}
    </View>
  );
};

export default Review;

const styles = StyleSheet.create({
  heading: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.semiBold,
    color: colors.black,
  },
  card: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderGrey,
    padding: 13,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: isSmallScreen ? fontSizes.mSmall : fontSizes.small,
    fontFamily: fonts.medium,
    color: colors.black,
  },
  subtitle: {
    fontSize: fontSizes.mSmall,
    fontFamily: fonts.regular,
    color: colors.black,
  },
  price: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.semiBold,
    color: colors.black,
  },
  currency: {
    fontSize: fontSizes.xSmall,
    fontFamily: fonts.medium,
    color: colors.black,
  },
});
