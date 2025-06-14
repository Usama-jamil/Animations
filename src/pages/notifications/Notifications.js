import React, {useState, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';

// Styles
import {colors, fonts} from '../../utils/styles';

// Import Components
import CustomHeader from '../../components/header/CustomHeader';
import NotificationCard from '../../components/notifications/NotificationCard';

// Third Party
import {useTranslation} from 'react-i18next';
import {API_ENDPOINTS, getRequest} from '../../utils/apiService';
import {useFocusEffect} from '@react-navigation/native';
import GeneralModal from '../../components/modal/GeneralModal';
import NoDataIcon from '../../../assets/icons/no_data.svg';

const item_PER_PAGE = 10;

const Notifications = () => {
  const {t} = useTranslation();

  const [notification, setnotification] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [Page, setPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []),
  );

  const fetchData = async () => {
    setIsLoading(true);
    const result = await getRequest(
      `${API_ENDPOINTS.notification.getAll}?pageno=${1}&limit=${item_PER_PAGE}`,
    );
    console.log('result', result?.data);
    setIsLoading(false);
    if (result.success) {
      setnotification(result?.data?.data);
      setTotalPages(result?.data?.total_pages);
    } else {
      console.log('error');
      setErr(true);
      setErrMsg(result.error);
    }
  };

  const handleLoadMoreNotification = async () => {
    if (Page < TotalPages) {
      const nextPage = Page + 1;
      setPage(nextPage);
      const result = await getRequest(
        `${API_ENDPOINTS.notification.getAll}?pageno=${nextPage}&limit=${item_PER_PAGE}`,
      );
      if (result?.success) {
        const newnotifications = result?.data.data;
        setnotification([...notification, ...newnotifications]);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title={t('notifications')} />

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
      ) : notification?.length > 0 ? (
        <FlatList
          data={notification}
          renderItem={({item, index}) => (
            <NotificationCard index={index} item={item} />
          )}
          keyExtractor={item => item._id}
          showsVerticalScrollIndicator={false}
          style={styles.aboutUsListContainer}
          onEndReached={handleLoadMoreNotification}
          onEndReachedThreshold={0.6}
        />
      ) : (
        <View style={styles.noDataContainer}>
          <View style={{top: -100}}>
            <NoDataIcon width={300} height={250} />
            <Text style={styles.noDataText}>{t('noNotifications')}</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  noDataImg: {
    height: 150,
    width: 200,
    resizeMode: 'contain',
  },
  noDataText: {
    fontFamily: fonts.regular,
    color: colors.black,
    fontSize: 14,
    lineHeight: 24,
    textAlign: 'center',
  },
});
