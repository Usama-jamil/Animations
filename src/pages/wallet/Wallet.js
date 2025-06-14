import React, { useState } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  Text,
  View,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from 'react-native';

// Components

// Styles
import { colors, fontSizes, fonts } from '../../utils/styles';

import WalletCard from '../../components/Wallet/walletCard';
import CustomHeader from '../../components/header/CustomHeader';
import { useTranslation } from 'react-i18next';

import { useFocusEffect } from '@react-navigation/native';
import { API_ENDPOINTS, getRequest } from '../../utils/apiService';
import GeneralModal from '../../components/modal/GeneralModal';

const Wallet = () => {
  const { t } = useTranslation();

  const [Wallet, setWallet] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, []),
  );

  const fetchData = async () => {
    setIsLoading(true);
    const result = await getRequest(API_ENDPOINTS.wallet.getAll);
    setIsLoading(false);
    console.log('result balance', result);
    if (result.success) {
      setWallet(result.data);
    } else {
      console.log('error');
      setErr(true);
      setErrMsg(result.error);
    }
  };

  const renderItem = ({ item, index }) => (
    <WalletCard item={item} index={index} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title={t('wallet')} />
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
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.main}>
            <Text allowFontScaling={false} style={styles.balance}>
              {t('balance')}
            </Text>
            <View style={styles.num_aed}>
              <Text allowFontScaling={false} style={styles.num}>
                {Wallet?.balance || 0}
              </Text>
              <Text
                allowFontScaling={false}
                style={[styles.num, { fontSize: 22, fontFamily: fonts.regular }]}>
                AED
              </Text>
            </View>
          </View>

          <View style={{ marginHorizontal: 10 }}>
            <Text allowFontScaling={false} style={styles.history}>
              {t('history')}
            </Text>


            {Wallet?.data?.length > 0 ? (
              <FlatList
                data={Wallet?.data}
                renderItem={renderItem}
                keyExtractor={item => item._id.toString()}
                contentContainerStyle={{ marginBottom: 10 }}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <Text allowFontScaling={false} style={styles.noDataText}>
                {t('noDataFound')}
              </Text>
            )}

          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default Wallet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    alignItems: 'center',
    marginHorizontal: 10,
    marginVertical: 25,
    flexDirection: 'row',
    gap: 33,
  },
  headingText: {
    color: colors.black,
    fontFamily: fonts.bold,
    fontSize: fontSizes.large,
    lineHeight: 24,
  },
  main: {
    backgroundColor: '#F5F5F5',
    marginTop: 30,
    paddingVertical: 45,
  },
  balance: {
    fontSize: 17,
    color: colors.black,
    fontFamily: fonts.medium,
    alignSelf: 'center',
  },
  num: {
    fontSize: 34,
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  num_aed: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 20,
  },
  history: {
    fontSize: 18,
    color: colors.black,
    fontFamily: fonts.semiBold,
    marginVertical: 15,
  },
  noDataText: {
    fontSize: fontSizes.xSmall,
    color: colors.black,
    fontFamily: fonts.medium,
    textAlign: 'center',
    marginTop: 20,
  },
});
