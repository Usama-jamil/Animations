import React, {useState} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';

// Styles
import {colors, fontSizes, fonts} from '../../../utils/styles';

// Component import
import CustomHeader from '../../../components/header/CustomHeader';

// Third Party
import {useTranslation} from 'react-i18next';

import RenderHtml from 'react-native-render-html';
import {useFocusEffect} from '@react-navigation/native';
import {API_ENDPOINTS, getRequest} from '../../../utils/apiService';
import GeneralModal from '../../../components/modal/GeneralModal';

const PrivacyPolicy = () => {
  const {t} = useTranslation();
  const [Privacy, setPrivacy] = useState({});

  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  console.log('privacy', Privacy);

  const {width} = useWindowDimensions();

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, []),
  );

  const fetchData = async () => {
    setIsLoading(true);
    const result = await getRequest(API_ENDPOINTS.auth.privacy);

    setIsLoading(false);
    if (result.success) {
      setPrivacy(result?.data?.privacy);
    } else {
      console.log('error');
      setErr(true);
      setErrMsg(result.error);
    }
  };

  const source = {
    html: Privacy,
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title={t('privacyPolicy')} />
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
        <ScrollView
          style={styles.privacyContainer}
          showsVerticalScrollIndicator={false}>
          <RenderHtml contentWidth={width} source={source} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default PrivacyPolicy;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  privacyContainer: {
    marginHorizontal: 10,
  },
  descriptionText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.black,
    marginTop: 10,
    lineHeight: 24,
  },
});
