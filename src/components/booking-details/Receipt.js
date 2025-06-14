import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {colors, fontSizes, fonts} from '../../utils/styles';
import {useTranslation} from 'react-i18next';

const Receipt = ({data}) => {
  const {t} = useTranslation();

  console.log('receipt', data?.receipt);

  if (!data?.receipt) return null;

  const campaignDiscount =
    Array.isArray(data?.receipt?.compaigns) &&
    data?.receipt?.compaigns?.length > 0
      ? data?.receipt?.compaigns?.reduce(
          (acc, campaign) => acc + (campaign?.discount || 0),
          0,
        ) // Sum all campaign discounts
      : data?.receipt?.compaigns?.[0]?.discount || 0; // If there's only one campaign, use its discount

  const generalDiscount = data?.receipt?.discount || 0;
  const giftDiscount = data?.receipt?.giftcard || 0;
  const totalDiscount = data?.receipt?.discounts || 0;

  return (
    <View style={[styles.card, {marginTop: 20}]}>
      {/* Heading */}
      <Text allowFontScaling={false} style={styles.heading}>
        {t('Receipt')}
      </Text>

      {data?.receipt?.freeSamplePack > 0 && (
        <View
          style={[
            styles.rowContainer,
            {justifyContent: 'space-between', marginTop: 10},
          ]}>
          <Text allowFontScaling={false} style={styles.cardtitle}>
            {t('freeSamplepack')}
          </Text>
          <Text allowFontScaling={false} style={styles.Cardprice}>
            {data?.receipt?.freeSamplePack?.toFixed(2)} {data?.currency?.code}
          </Text>
        </View>
      )}

      {/* Subtotal */}

      {/* Services */}
      {data?.receipt?.services > 0 && (
        <View
          style={[
            styles.rowContainer,
            {justifyContent: 'space-between', marginTop: 10},
          ]}>
          <Text allowFontScaling={false} style={styles.cardtitle}>
            {t('services')}
          </Text>
          <Text allowFontScaling={false} style={styles.Cardprice}>
            {data?.receipt?.services?.toFixed(2) || 0}{' '}
            {data?.currency?.code || 'PKR'}
          </Text>
        </View>
      )}

      {/* Inventories */}
      {data?.receipt?.inventories > 0 && (
        <View
          style={[
            styles.rowContainer,
            {justifyContent: 'space-between', marginTop: 10},
          ]}>
          <Text allowFontScaling={false} style={styles.cardtitle}>
            {t('products')}
          </Text>
          <Text allowFontScaling={false} style={styles.Cardprice}>
            {data?.receipt?.inventories?.toFixed(2) || 0}{' '}
            {data?.currency?.code || 'PKR'}
          </Text>
        </View>
      )}

      {/* gift cards */}

      {data?.receipt?.giftcards > 0 && (
        <View
          style={[
            styles.rowContainer,
            {justifyContent: 'space-between', marginTop: 10},
          ]}>
          <Text allowFontScaling={false} style={styles.cardtitle}>
            {t('giftCards')}
          </Text>
          <Text allowFontScaling={false} style={styles.Cardprice}>
            {data?.receipt?.giftcards?.toFixed(2) || 0}{' '}
            {data?.currency?.code || 'PKR'}
          </Text>
        </View>
      )}

      {/* subtotal */}
      <View
        style={[
          styles.rowContainer,
          {justifyContent: 'space-between', marginTop: 10},
        ]}>
        <Text allowFontScaling={false} style={styles.cardtitle}>
          {t('subtotal')}
        </Text>
        <Text allowFontScaling={false} style={styles.Cardprice}>
          {data?.receipt?.subTotal?.toFixed(2) || 0}{' '}
          {data?.currency?.code || 'PKR'}
        </Text>
      </View>

      {/* firstPurchaseDiscount */}
      {data?.receipt?.compaigns &&
        data?.receipt?.compaigns?.length > 0 && (
          <View
            style={[
              styles.rowContainer,
              {justifyContent: 'space-between', marginTop: 10},
            ]}>
            <Text allowFontScaling={false} style={styles.cardtitle}>
              {data?.receipt?.compaigns[0]?.title}
            </Text>
            <Text allowFontScaling={false} style={styles.Cardprice}>
              {`-${campaignDiscount} ${data?.currency?.code}`}
            </Text>
          </View>
        )}

      {generalDiscount > 0 && (
        <View
          style={[
            styles.rowContainer,
            {justifyContent: 'space-between', marginTop: 10},
          ]}>
          <Text allowFontScaling={false} style={styles.cardtitle}>
            {t('discount')}
          </Text>
          <Text allowFontScaling={false} style={styles.Cardprice}>
            {`-${generalDiscount} ${data?.currency?.code}`}
          </Text>
        </View>
      )}

      {giftDiscount > 0 && (
        <View
          style={[
            styles.rowContainer,
            {justifyContent: 'space-between', marginTop: 10},
          ]}>
          <Text allowFontScaling={false} style={styles.cardtitle}>
            {t('giftCard')}
          </Text>
          <Text allowFontScaling={false} style={styles.Cardprice}>
             {`-${giftDiscount} ${data?.currency?.code}`}
          </Text>
        </View>
      )}

      {(generalDiscount > 0 || giftDiscount > 0) && totalDiscount > 0 && (
        <View
          style={[
            styles.rowContainer,
            {justifyContent: 'space-between', marginTop: 10},
          ]}>
          <Text allowFontScaling={false} style={styles.cardtitle}>
            {t('totalDiscount')}
          </Text>
          <Text allowFontScaling={false} style={styles.Cardprice}>
            - {totalDiscount} {data?.currency?.code}
          </Text>
        </View>
      )}

      {/* Total */}
      <View
        style={[
          styles.rowContainer,
          {justifyContent: 'space-between', marginTop: 10},
        ]}>
        <Text
          allowFontScaling={false}
          style={[styles.cardtitle, {color: colors.black}]}>
          {t('Total')}
        </Text>
        <Text
          allowFontScaling={false}
          style={[styles.Cardprice, {color: colors.primary}]}>
          {data?.receipt?.total?.toFixed(2) || 0}{' '}
          {data?.currency?.code || 'PKR'}
        </Text>
      </View>
    </View>
  );
};

export default Receipt;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.whiteGray,
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
  },
  heading: {
    fontSize: fontSizes.large,
    fontFamily: fonts.bold,
    color: colors.black,
    marginBottom: 10,
    textAlign: 'center',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardtitle: {
    fontSize: fontSizes.small,
    fontFamily: fonts.semiBold,
    color: colors.darkGrey,
  },
  Cardprice: {
    fontSize: fontSizes.small,
    fontFamily: fonts.semiBold,
    color: colors.black,
  },
  Cardcurrency: {
    fontSize: fontSizes.small,
    fontFamily: fonts.medium,
    color: colors.black,
  },
});
