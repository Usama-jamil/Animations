import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from 'react-native';

// Components
import GiftCard from '../../components/Gift/GiftCard';
import CustomHeader from '../../components/header/CustomHeader';

// Third Party
import {useTranslation} from 'react-i18next';

// Styles
import {colors, fontSizes, fonts} from '../../utils/styles';

import NoDataIcon from '../../../assets/icons/no_data.svg';
import {API_ENDPOINTS, getRequest} from '../../utils/apiService';
import {useFocusEffect} from '@react-navigation/native';
import GeneralModal from '../../components/modal/GeneralModal';
import PagerView from 'react-native-pager-view';
const Gift = ({navigation}) => {
  const {t} = useTranslation();

  const [Gift, setGift] = useState([]);

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

  const GiftStatus = [
    {label: t('byStores'), value: 'store'},
    {label: t('fromTrimmezze'), value: 'admin'},
    {label: t('bought'), value: 'bought'},
  ];

  const fetchData = async () => {
    setIsLoading(true);

    const tabValue = GiftStatus[selectedTab].value;
    const endpoint =  `${API_ENDPOINTS.giftCards.giftWithStatus}?status=${tabValue}`;
    const result = await getRequest(
     endpoint
    );
    setIsLoading(false);
    console.log('result', result);
    if (result.success) {
      setGift(result?.data.data);
    } else {
      setErr(true);
      setErrMsg(result.error);
    }
  };

 

  const noGiftText =
    selectedTab === 0
      ? t('noByStores')
      : selectedTab === 1
      ? t('noFromTrimmezze')
      : t('noBrought');

  const renderGiftItem = ({item, index}) => (
    <GiftCard navigation={navigation} item={item} index={index} />
  );

  const handleTabPress = (index) => {
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

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title={t('giftCards')} />

      {err && (
        <GeneralModal
          modalError={true}
          description={errMsg}
          Set_Modal_Visibilty={setErr}
        />
      )}

      <View>
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          ref={scrollViewRef}>
          <View style={styles.GiftOpacitiesContainer}>
            {GiftStatus.map((tab, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  selectedTab === index
                    ? styles.selectedGift
                    : styles.nonSelectedGift,
                ]}
                onPress={() => handleTabPress(index)}
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
                      ? styles.selectedGiftText
                      : styles.nonSelectedGiftText
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
        onPageSelected={(e) => {
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
        }}
      >
         {GiftStatus.map((_, index) => (
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
          {Gift.length > 0 ? (
            <FlatList
              renderItem={renderGiftItem}
              data={Gift}
              keyExtractor={item => item._id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{marginTop: 20, marginHorizontal: 10}}
            />
          ) : (
            <View style={styles.noGiftContainer}>
              <View style={{top: -100}}>
                <NoDataIcon width={300} height={250} />
                <Text allowFontScaling={false} style={styles.noDataText}>
                  {noGiftText}
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

export default Gift;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  GiftOpacitiesContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  selectedGift: {
    borderBottomWidth: 3,
    borderBottomColor: colors.primary,
    paddingHorizontal: 40,
  },
  nonSelectedGift: {
    borderBottomWidth: 1,
    borderBottomColor: colors.grey,
    paddingHorizontal: 40,
  },
  selectedGiftText: {
    fontFamily: fonts.semiBold,
    color: colors.primary,
    fontSize: fontSizes.xSmall,
    paddingBottom: 6,
  },
  nonSelectedGiftText: {
    fontFamily: fonts.regular,
    color: colors.darkGrey,
    fontSize: fontSizes.small,
    paddingBottom: 10,
  },

  noGiftContainer: {
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
