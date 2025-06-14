import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  Image,
  FlatList,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import PagerView from 'react-native-pager-view';

// Components
import BookingCard from '../../components/booking/BookingCard';
import {useTranslation} from 'react-i18next';
import {colors, fontSizes, fonts} from '../../utils/styles';
import NoDataIcon from '../../../assets/icons/no_data.svg';
import GeneralModal from '../../components/modal/GeneralModal';
import CustomHeader from '../../components/header/CustomHeader';
import {API_ENDPOINTS, getRequest} from '../../utils/apiService';
import BookingListingCard from '../../components/listing-booking/BookingListingCard';

const booking_PER_PAGE = 10;

const Booking = ({navigation}) => {
  const {t} = useTranslation();

  const [bookings, setBookings] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0); // Tab index for PagerView
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const pagerRef = useRef(null);
  const scrollViewRef = useRef(null);
  const [itemPositions, setItemPositions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [total_pages, setTotal_pages] = useState(1);
  const [bookingType, setBookingType] = useState('main'); // 'main' | 'rental'

  const mainBooking = bookingType === 'main';

  console.log('bookingtype', mainBooking);

  useEffect(() => {
    setPage(1);
    setTotal_pages(1);
    fetchData();
  }, [selectedTab, bookingType]);

 const fetchData = async (currentPage = 1) => {
  setIsLoading(true);

  // Determine the endpoint based on the current bookingType and selectedTab
  const tabValue = mainBooking
    ? bookingsStatus[selectedTab].value
    : listingStatus[selectedTab].value;
  
  const endpoint = mainBooking
    ? `${API_ENDPOINTS.booking.getWithStatus}?status=${tabValue}&pageno=${currentPage}&limit=${booking_PER_PAGE}`
    : `${API_ENDPOINTS.rentalBooking.getAll}?status=${tabValue}&pageno=${currentPage}&limit=${booking_PER_PAGE}`;
  
  // Make the request to fetch data
  const result = await getRequest(endpoint);
  setIsLoading(false);

  if (result.success) {
    setBookings(result?.data?.data); // Set the new data
    setTotal_pages(result?.data?.total_pages); // Set the total number of pages
    setPage(currentPage); // Update the page number after fetching
  } else {
    setErr(true);
    setErrMsg(result.error);
  }
};


  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1); // ✅ Ensure we start from Page 1
    setTotal_pages(1);
    await fetchData(1); // ✅ Explicitly fetch Page 1 data
    setRefreshing(false);
  };

  const bookingsStatus = [
    {label: t('today'), value: 'today'},
    {label: t('upcoming'), value: 'upcoming'},
    {label: t('completed'), value: 'completed'},
    {label: t('cancelled'), value: 'cancelled'},
  ];

  const listingStatus = [
    {label: t('pendingPickup'), value: 'pendingConfirm'},
    {label: t('picked'), value: 'picked'},
    {label: t('rejected'), value: 'rejected'},
    {label: t('cancelled'), value: 'cancelled'},
    {label: t('returned'), value: 'returned'},
  ];

  const finalStatus = mainBooking ? bookingsStatus : listingStatus;

  const noBookingsText =
    selectedTab === 0
      ? t('noToday')
      : selectedTab === 1
      ? t('noUpcoming')
      : selectedTab === 2
      ? t('noCompleted')
      : t('noCancelled');

  const noListingBookingsText =
    selectedTab === 0
      ? t('noPendingPickup')
      : selectedTab === 1
      ? t('noPicked')
      : selectedTab === 2
      ? t('noRejected') 
      : selectedTab === 3
      ? t('noCancelled')
      : t('noReturned');

const renderAppointmentItem = useCallback(
  ({ item, index }) => {
    return mainBooking ? (
      <BookingCard navigation={navigation} item={item} index={index} />
    ) : (
      <BookingListingCard navigation={navigation} item={item} index={index} />
    );
  },
  [navigation,bookingType,selectedTab] // Add dependencies here
);

  const handleLoadMoreBookings = async () => {
    if (page < total_pages) {
      const nextPage = page + 1;
      const tabValue = mainBooking
        ? bookingsStatus[selectedTab].value
        : listingStatus[selectedTab].value;
      const endpoint = `${API_ENDPOINTS.booking.getWithStatus}?status=${tabValue}&pageno=${nextPage}&limit=${booking_PER_PAGE}`;
      const listingendpoint = `${API_ENDPOINTS.rentalBooking.getAll}?status=${tabValue}&pageno=${nextPage}&limit=${booking_PER_PAGE}`;

      const result = await getRequest(mainBooking ? endpoint : listingendpoint);

      if (result?.success) {
        const newBookings = result?.data?.data || [];
        setBookings(prevBookings => [...prevBookings, ...newBookings]); // ✅ Append new bookings
        setPage(nextPage); // ✅ Update page AFTER setting new data
      } else {
        console.error('Error fetching more bookings:', result?.error);
      }
    }
  };

  const handleTabPress = (tab, index) => {
    pagerRef.current?.setPage(index);
    setSelectedTab(index);

    if (itemPositions[index]) {
      const {x, width} = itemPositions[index];
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
  };

const handleBookingTypeChange = (selectedItem) => {
  setBookingType(selectedItem.value);
  setPage(1); // Reset to first page when changing booking type
  setTotal_pages(1); // Reset total pages when changing booking type
  setSelectedTab(0); // Reset to the first tab
  setBookings([]); // Reset bookings before fetching new data
  fetchData(1); // Trigger data fetch with the first page of the new type
};


  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title={t('bookings')} handleBookingTypeChange={handleBookingTypeChange} />

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
          <View style={styles.bookingsOpacitiesContainer}>
            {finalStatus.map((tab, index) => (
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
        {finalStatus.map((_, index) => (
          <View key={index} style={styles.page}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size={'large'} color={colors.primary} />
              </View>
            ) : (
              <View style={{flexGrow: 1, marginBottom: 80}}>
                {bookings.length > 0 ? (
                  <FlatList
                    renderItem={renderAppointmentItem}
                    data={bookings}
                    keyExtractor={item => item._id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.bookingsList}
                    onEndReached={handleLoadMoreBookings}
                    onEndReachedThreshold={0.6}
                    nestedScrollEnabled={true}
                    onRefresh={onRefresh}
                    refreshing={refreshing}
                  />
                ) : (
                  <View style={styles.noSubscriptionsContainer}>
                    <View style={{marginTop: 100}}>
                      <NoDataIcon width={300} height={250} />
                      <Text allowFontScaling={false} style={styles.noDataText}>
                        {mainBooking ? noBookingsText : noListingBookingsText}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        ))}
      </PagerView>
    </SafeAreaView>
  );
};

export default Booking;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  bookingsOpacitiesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  selectedBooking: {
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: colors.primary,
    paddingHorizontal: 28,
  },
  nonSelectedBooking: {
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.grey,
    paddingHorizontal: 28,
  },
  selectedBookingText: {
    fontFamily: fonts.semiBold,
    color: colors.primary,
    fontSize: fontSizes.xSmall,
    paddingBottom: 6,
  },
  nonSelectedBookingText: {
    fontFamily: fonts.regular,
    color: colors.darkGrey,
    fontSize: fontSizes.small,
    paddingBottom: 10,
  },
  pagerView: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  bookingsList: {
    paddingBottom: 80,
    marginHorizontal: 10,
    paddingTop: 10,
  },
  noSubscriptionsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontFamily: fonts.regular,
    color: colors.black,
    fontSize: 14,
    lineHeight: 24,
    textAlign: 'center',
  },
  loadingContainer: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    flex: 1,
    marginTop: 40,
  },
});
