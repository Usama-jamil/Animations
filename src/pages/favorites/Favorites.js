import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import React, { useState } from 'react';
import CustomHeader from '../../components/header/CustomHeader';
import FavoritesCard from '../../components/favorite/FavoritesCard';
import { colors, fontSizes, fonts } from '../../utils/styles';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { getRequest, API_ENDPOINTS } from '../../utils/apiService';
import { ActivityIndicator } from 'react-native';
const Favorites = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [Favorites, setfavorites] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, []),
  );

  const fetchData = async () => {
    setIsLoading(true);
    const result = await getRequest(
      `${API_ENDPOINTS.business.getAll}?likes=${true}`,
    );
    console.log('result', result);
    setIsLoading(false);
    if (result.success) {
      setfavorites(result?.data.data);
    } else {
      setErr(true);
      setErrMsg(result.error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader title={t('favorites')} />
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
      ) : Favorites?.length > 0 ? (
        <FavoritesCard data={Favorites} setdata={setfavorites} setloading={setIsLoading} />
      ) : (
        <Text allowFontScaling={false} style={styles.noDataText}>
          {t('noDataFound')}
        </Text>
      )}
    </SafeAreaView>
  );
};

export default Favorites;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  noDataText: {
    fontSize: fontSizes.xSmall,
    color: colors.black,
    fontFamily: fonts.medium,
    textAlign: 'center',
    marginTop: 20,
  },
});
