import React, {useEffect, useState, useRef} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';

// Third Party
import {useTranslation} from 'react-i18next';

// Styles
import {colors, fontSizes, fonts} from '../../utils/styles';

// Assets
import NoDataIcon from '../../../assets/icons/no_data.svg';
import CustomHeader from '../../components/header/CustomHeader';
import SubscriptionsCard from '../../components/subscriptions/SubscriptionsCard';
import {API_ENDPOINTS, getRequest} from '../../utils/apiService';
import {useFocusEffect} from '@react-navigation/native';
import GeneralModal from '../../components/modal/GeneralModal';
import PagerView from 'react-native-pager-view';

const Subscriptions = () => {
  const {t} = useTranslation();

  const [Subscription, setSubscription] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [selectedTab, setSelectedTab] = useState(0); // Tab index for PagerView
  const scrollViewRef = useRef(null);
  const [itemPositions, setItemPositions] = useState([]);
  const pagerRef = useRef(null);

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [selectedTab]),
  );

  const subscriptionsStatus = [
    {label: t('ongoing'), value: 'ongoing'},
    {label: t('completed'), value: 'completed'},
    {label: t('cancelled'), value: 'cancelled'},
  ];

  const fetchData = async () => {
    setIsLoading(true);
    const tabValue = subscriptionsStatus[selectedTab].value;
    const endpoint = `${API_ENDPOINTS.subscription.getUserSubscription}?filter=${tabValue}`;
    const result = await getRequest(endpoint);
    console.log('result', result);
    setIsLoading(false);
    if (result.success) {
      setSubscription(result.data.data);
    } else {
      console.log('error');
      setErr(true);
      setErrMsg(result.error);
    }
  };

  const noSubscriptionsText =
    selectedTab === 'onging'
      ? t('noDataFound')
      : selectedTab === 'completed'
      ? t('noDataFound')
      : t('noDataFound');

  const renderSubscriptionItem = ({item, index}) => (
    <SubscriptionsCard item={item} index={index} />
  );

  const handleTabPress = (tab, index) => {
    pagerRef.current?.setPage(index);
    setSelectedTab(index);

    if (itemPositions[index]) {
      const {x, width} = itemPositions[index];
      const screenWidth = Dimensions.get('window').width;

      // Calculate the offset to center the selected tab
      let offset = x + width / 2 - screenWidth / 2;

      // Prevent scrolling to negative positions
      offset = Math.max(0, offset);

      // Check if the tab is off-screen to the right
      const rightEdge = x + width;
      if (rightEdge > screenWidth) {
        // Ensure the entire tab is visible on the right side
        offset = x - (screenWidth - width);
      }

      scrollViewRef.current?.scrollTo({
        x: offset,
        animated: true,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title={t('mySubscriptions')} />

      {err && (
        <GeneralModal
          modalError={true}
          description={errMsg}
          Set_Modal_Visibilty={setErr}
        />
      )}

      <View>
        <ScrollView
          ref={scrollViewRef}
          horizontal={true}
          showsHorizontalScrollIndicator={false}>
          <View style={styles.subscriptionsOpacitiesContainer}>
            {subscriptionsStatus.map((tab, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  selectedTab === index
                    ? styles.selectedBooking
                    : styles.nonSelectedBooking,
                ]}
                onPress={() => handleTabPress(tab, index)}
                onLayout={event => {
                  const {x, width} = event.nativeEvent.layout;
                  setItemPositions(prev => {
                    const newPositions = [...prev];
                    newPositions[index] = {x, width};
                    return newPositions;
                  });
                }}>
                <Text
                  allowFontScaling={false}
                  style={
                    selectedTab === index
                      ? styles.selectedBookingText
                      : styles.nonSelectedBookingText
                  }>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <PagerView
        style={styles.pagerView}
        initialPage={0}
        ref={pagerRef}
        onPageSelected={e => {
          const newIndex = e.nativeEvent.position;
          setSelectedTab(newIndex);

          if (itemPositions[newIndex]) {
            const {x, width} = itemPositions[newIndex];
            const screenWidth = Dimensions.get('window').width;

            // Ensure the item is fully visible on the left side as well
            let offset = x + width / 2 - screenWidth / 2;
            offset = Math.max(0, offset); // Prevent scrolling to negative positions

            // If the item is partially off-screen to the left, ensure it's fully visible
            if (x < 0) {
              offset = x;
            }

            scrollViewRef.current?.scrollTo({
              x: offset,
              animated: true,
            });
          }
        }}>
        {subscriptionsStatus.map((_, index) => (
          <View key={index} style={styles.page}>
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
              <>
                {Subscription.length > 0 ? (
                  <FlatList
                    data={Subscription}
                    renderItem={renderSubscriptionItem}
                    keyExtractor={item => item.id}
                    showsVerticalScrollIndicator={false}
                    style={styles.subscriptionsList}
                  />
                ) : (
                  <View style={styles.noSubscriptionsContainer}>
                    <View style={{top: -100}}>
                      <NoDataIcon width={300} height={250} />
                      <Text allowFontScaling={false} style={styles.noDataText}>
                        {noSubscriptionsText}
                      </Text>
                    </View>
                  </View>
                )}
              </>
            )}
          </View>
        ))}
      </PagerView>
    </SafeAreaView>
  );
};

export default Subscriptions;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  subscriptionsOpacitiesContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  selectedBooking: {
    borderBottomWidth: 3,
    borderBottomColor: colors.primary,
    paddingHorizontal: 40,
  },
  nonSelectedBooking: {
    borderBottomWidth: 1,
    borderBottomColor: colors.grey,
    paddingHorizontal: 40,
  },
  selectedBookingText: {
    fontFamily: fonts.bold,
    color: colors.primary,
    fontSize: fontSizes.medium,
    paddingBottom: 5,
  },
  nonSelectedBookingText: {
    fontFamily: fonts.regular,
    color: colors.darkGrey,
    fontSize: fontSizes.small,
    paddingBottom: 5,
  },
  subscriptionsList: {
    marginBottom: 60,
    marginHorizontal: 10,
    paddingTop: 10,
  },
  noSubscriptionsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  noDataText: {
    fontFamily: fonts.regular,
    color: colors.black,
    fontSize: 14,
    lineHeight: 24,
    textAlign: 'center',
  },
  pagerView: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
});
