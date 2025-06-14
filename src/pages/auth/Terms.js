import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import CustomHeader from '../../components/header/CustomHeader';
import { colors } from '../../utils/styles';
import ActivityIndicatorModal from '../../components/modal/ActivityIndicatorModal';
import GeneralModal from '../../components/modal/GeneralModal';
import RenderHtml from 'react-native-render-html';
import { API_ENDPOINTS, getRequest } from '../../utils/apiService';

const Terms = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [data, setData] = useState('');
  const { width } = useWindowDimensions();

  const source = {
    html: `${data}`,
  };

  useEffect(() => {
    setIsLoading(true);
    fetchInfo();
  }, []);

  const fetchInfo = async () => {
    try {
      const response = await getRequest(
        `${API_ENDPOINTS.auth.terms}`,
      );
      setData(response?.data?.tac);
      setIsLoading(false);
    } catch (error) {
      console.log('error', error);
      setErr(true);
      setErrMsg(
        error?.response?.data?.message || t('AnUnexpectedErrorOccurred'),
      );
      setIsLoading(false);
    }
  };
  console.log('data', data);
  return (
    <View style={styles.container}>
      {isLoading && <ActivityIndicatorModal loaderIndicator={isLoading} />}
      {err && (
        <GeneralModal
          modalError={true}
          message={errMsg}
          Set_Modal_Visibilty={setErr}
        />
      )}
      <CustomHeader title={'Terms'} />

      <ScrollView style={{ marginHorizontal: 20 }} showsVerticalScrollIndicator={false}>
        <RenderHtml contentWidth={width} source={source} />
      </ScrollView>
    </View>
  );
};

export default Terms;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
