import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  FlatList,
  LayoutAnimation,
  UIManager,
  View,
} from 'react-native';

// Styles
import {colors} from '../../../utils/styles';

// Component import
import FaqCard from '../../../components/faqs/FaqCard';
import CustomHeader from '../../../components/header/CustomHeader';

// Data

// Third Party
import {useTranslation} from 'react-i18next';
import {API_ENDPOINTS} from '../../../utils/apiService';
import {useFocusEffect} from '@react-navigation/native';
import {getRequest} from '../../../utils/apiService';
import {ActivityIndicator} from 'react-native-paper';
import GeneralModal from '../../../components/modal/GeneralModal';
UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true);

const Faqs = ({navigation}) => {
  const {t} = useTranslation();
  const [Faq, setFaq] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  console.log('faq', Faq);

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, []),
  );

  const fetchData = async () => {
    setIsLoading(true);
    const result = await getRequest(API_ENDPOINTS.auth.faq);
    console.log('result', result);
    setIsLoading(false);
    if (result.success) {
      setFaq(result?.data);
    } else {
      console.log('error');
      setErr(true);
      setErrMsg(result.error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title={t('faqs')} />
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
          <ActivityIndicator size={'small'} color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={Faq}
          renderItem={({item, index}) => <FaqCard index={index} item={item} />}
          keyExtractor={item => item._id}
          showsVerticalScrollIndicator={false}
          style={styles.faqsListContainer}
        />
      )}
    </SafeAreaView>
  );
};

export default Faqs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  faqsListContainer: {
    marginBottom: 10,
    marginTop: -15,
  },
});
