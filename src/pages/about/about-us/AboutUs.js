import React, {useState, useEffect} from 'react';
import {StyleSheet, SafeAreaView, ActivityIndicator, View} from 'react-native';

// Styles
import {colors} from '../../../utils/styles';

// Component import
import AboutUsCard from '../../../components/about-us/AboutUsCard';
import CustomHeader from '../../../components/header/CustomHeader';

// Third Party
import {useTranslation} from 'react-i18next';

import {API_ENDPOINTS, getRequest} from '../../../utils/apiService';
import {useFocusEffect} from '@react-navigation/native';
import GeneralModal from '../../../components/modal/GeneralModal';
const AboutUs = () => {
  const {t} = useTranslation();
  const [about, setAbout] = useState(null);
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
    const result = await getRequest(API_ENDPOINTS.auth.about);

    setIsLoading(false);
    if (result.success) {
      setAbout(result?.data?.about);
    } else {
      console.log('error');
      setErr(true);
      setErrMsg(result.error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title={t('aboutUs')} />

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
        <AboutUsCard item={about} />
      )}
    </SafeAreaView>
  );
};

export default AboutUs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  aboutUsListContainer: {
    marginBottom: 10,
    marginTop: -15,
  },
});
