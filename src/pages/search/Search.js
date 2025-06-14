import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Image,
  TextInput,
  ActivityIndicator,
  Platform,
  SafeAreaView,
} from 'react-native';
import React, {useState, useRef, useCallback, useEffect, useMemo} from 'react';
import CustomHeader from '../../components/header/CustomHeader';
import {colors, commonStyles, fontSizes, fonts} from '../../utils/styles';
import Cross from '../../../assets/icons/more/cancel.svg';
import Seach from '../../../assets/icons/search-2.svg';
import Filter from 'react-native-vector-icons/AntDesign';
import BottomSheet from '@gorhom/bottom-sheet';
import {GestureHandlerRootView, ScrollView} from 'react-native-gesture-handler';
import {useTranslation} from 'react-i18next';
import MultiSlider from '@ptomasroos/react-native-multi-slider';

const screenWidth = Dimensions.get('window').width - 40;
import Recommended from '../../components/home/Recommended';
import BestOffers from '../../components/home/BestOffers';
import Services from '../../components/home/Services';
import Subscriptions from '../../components/home/Listing';
import Products from '../../components/home/Products';
import {useFocusEffect} from '@react-navigation/native';
import {API_ENDPOINTS} from '../../utils/apiService';
import {getRequest} from '../../utils/apiService';

import GeneralModal from '../../components/modal/GeneralModal';
import Listing from '../../components/home/Listing';

const Search = ({route}) => {
  const {lat, lng} = route.params || {};
  const placeName = route?.params?.placeName;
  const [searchText, setSearchText] = useState('');
  const bottomSheetRef = useRef(null);
  const {t} = useTranslation();
  const [data, setData] = useState([]);
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [values, setValues] = useState([0, 0]); // Initial state for multi-slider values
  const [selectedLocation, setSelectedLocation] = useState(placeName || '');
  const [selectedPriceRange, setSelectedPriceRange] = useState([]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [values, selectedLocation]),
  );

  useEffect(() => {
    setValues([0, 0]);
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    // Initialize query parameters
    let queryParams = [];
    // Add searchText if it's not empty
    if (searchText) {
      queryParams.push(`search=${encodeURIComponent(searchText)}`);
    }

    // Add lat and lng if they are not empty
    if (lat && lng) {
      queryParams.push(`lat=${lat}`, `lng=${lng}`);
    }

    // Add price range if it's not empty
    if (values && values[1] > 0) {
      queryParams.push(`price=[${values[0]},${values[1]}]`);
    }

    // Construct the final endpoint URL with query parameters
    const queryString = queryParams.length ? `?${queryParams.join('&')}` : '';
    const endpoint = `${API_ENDPOINTS.home.getAll}${queryString}`;

    try {
      const result = await getRequest(endpoint);

      if (result.success) {
        setData(result.data || []);
      } else if (result.error) {
        setErr(true);
        setErrMsg(result.error);
      }
    } catch (error) {
      setErr(true);
      setErrMsg('An error occurred while fetching data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchTextChange = newSearch => {
    setSearchText(newSearch);
  };

  const onValuesChange = newValues => {
    setValues(newValues);
    setSelectedPriceRange(`${newValues[0]} to ${newValues[1]}`);
  };

  const handleclose = () => {
    bottomSheetRef.current.close();
  };

  const handleReset = () => {
    // Reset all relevant state variables
    setValues([0, 0]);
    setSelectedPriceRange([]);
    setSelectedLocation('');
    setSearchText('');

    // Reset lat and lng
    route.params.lat = null;
    route.params.lng = null;

    // Close the bottom sheet
    handleclose();

    // Fetch updated data after reset
    fetchData();
  };

  const handleClearSearch = () => {
    setSearchText(''); // Clear the search text
    setTimeout(() => {
      fetchData(); // Fetch data after a short delay
    }, 300); // Add a slight delay to ensure the state update is complete
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <GestureHandlerRootView style={{flex: 1}}>
        <CustomHeader title={t('search')} />

        {err && (
          <GeneralModal
            modalError={true}
            description={errMsg}
            Set_Modal_Visibilty={setErr}
          />
        )}

        <View style={styles.textInputContainer}>
          <View style={styles.searchInputIconContainer}>
            <TouchableOpacity>
              <Seach width={24} height={24} />
            </TouchableOpacity>

            <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
              <TextInput
                allowFontScaling={false}
                style={styles.textInput}
                placeholder={t('search')}
                placeholderTextColor={colors.placeholderGrey}
                autoCapitalize="none"
                keyboardType="default"
                value={searchText}
                onChangeText={handleSearchTextChange}
                onSubmitEditing={fetchData}
              />

              {searchText.length > 0 && (
                <TouchableOpacity onPress={handleClearSearch}>
                  <Cross width={17} height={17} />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity onPress={() => bottomSheetRef.current.expand()}>
              <Filter name="filter" size={24} color="#000000" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[styles.raitingText, {marginHorizontal: 10}]}>
          {selectedLocation ? `Result in ${selectedLocation}` : ''}
          {selectedPriceRange ? ` ${selectedPriceRange}` : ''}
        </Text>

        {isLoading ? (
          <ActivityIndicator size={'large'} color={colors.primary} />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <Recommended business={data?.recomended} />
            <BestOffers bestOffers={data?.bestoffers} />
            <Services services={data?.services} Search={true} />
             <Listing data={data?.listings} Search={true} />
            <Products Product={data?.products} Search={true} />
          </ScrollView>
        )}

        <BottomSheet
          ref={bottomSheetRef}
          enablePanDownToClose={true}
          enableOverDrag={true}
          enableHandlePanningGesture
          handleIndicatorStyle={{
            width: 0,
            height: 0,
          }}
          index={-1}
          snapPoints={['100%']}
          backgroundComponent={({style}) => (
            <View style={[style, styles.feedbackOverlay]} />
          )}>
          <View style={styles.feedbackContainer}>
            <TouchableOpacity
              style={styles.btmSheetCloseOpacity}
              onPress={handleclose}>
              <Cross width={17} height={17} />
            </TouchableOpacity>

            <View style={styles.radioButton}>
              <Text allowFontScaling={false} style={styles.radioButtonTitle}>
                {t('Maximumprice')}
              </Text>

              <Text allowFontScaling={false} style={styles.radioButtonTitle}>
                {values[0]} {t('to')} {values[1]}
              </Text>
            </View>
            <MultiSlider
              values={values}
              min={0}
              max={1000}
              step={10}
              sliderLength={screenWidth}
              onValuesChange={onValuesChange} // Callback function to handle slider value changes
              selectedStyle={{
                backgroundColor: colors.primary,
                height: 4,
              }}
              unselectedStyle={{
                backgroundColor: colors.lightGrey,
              }}
              markerStyle={styles.markerStyle}
              trackStyle={{height: 4}}
              containerStyle={{paddingHorizontal: 10}}
              isMarkersSeparated={true}
              allowOverlap={true}
              snapped={true}
            />

            <View style={[styles.radioButton, {gap: 10}]}>
              <TouchableOpacity
                style={[
                  styles.continueButton,
                  commonStyles.btnOutlineContainer,
                ]}
                onPress={handleReset}>
                <Text
                  allowFontScaling={false}
                  style={[commonStyles.btnText, {color: colors.primary}]}>
                  {t('reset')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </BottomSheet>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
};

export default Search;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  itemContainer: {
    padding: 10,
    borderRadius: 12,
  },
  imageContainer: {
    width: '100%',
    height: 100,
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 10,
    fontFamily: fonts.semiBold,
    marginBottom: 5,
    color: colors.black,
  },
  rowContainerBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginRight: 5,
  },
  raitingText: {
    fontSize: fontSizes.small,
    color: colors.black,
    fontFamily: fonts.regular,
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    marginBottom: 15,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderGrey,
    marginHorizontal: 10,
    justifyContent: 'space-between',
  },
  searchInputIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  iconStyle: {
    marginLeft: 5, // Adjust margin as needed
  },
  textInput: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.xSmall,
    marginLeft: 5,
    height: 50,
    color: colors.black,
    width: '90%',
  },
  feedbackOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  feedbackContainer: {
    backgroundColor: colors.background,
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    paddingVertical: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  btmSheetCloseOpacity: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    marginHorizontal: 10,
    marginBottom: 10,
  },
  closeImg: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  button_container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  button: {
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  activeButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    fontSize: 15,
    fontFamily: fonts.medium,
    color: colors.background,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 5,
    marginBottom: 10,
  },
  radioButtonTitle: {
    fontSize: 14,
    fontFamily: fonts.medium,
    marginTop: 2,
  },
  activeRadioButtonTitle: {
    color: colors.primary,
  },
  markerStyle: {
    ...Platform.select({
      ios: {
        height: 20,
        width: 20,
        borderRadius: 15,
        backgroundColor: '#fff',
        borderColor: '#E4E4E4',
        borderWidth: 1,
      },
      android: {
        height: 20,
        width: 20,
        borderRadius: 15,
        backgroundColor: '#fff',
        borderColor: '#E4E4E4',
        borderWidth: 1,
      },
    }),
  },
  continueButton: {
    flex: 1,
  },
});
