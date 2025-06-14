import React, {useState, useRef, useEffect, useCallback} from 'react';
import {
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Alert,
  Linking,
  ActivityIndicator,
  Keyboard,
} from 'react-native';

// Stylehseet
import {
  addAddress,
  addLocation,
  editAddress,
  setCompleteAddress,
  setSelectAddress,
} from '../../store/slices/location';

// Components

import {useTranslation} from 'react-i18next';

import {colors, fontSizes, fonts, commonStyles} from '../../utils/styles';
import CustomHeader from '../../components/header/CustomHeader';
import Geolocation from 'react-native-geolocation-service';

import Cross from '../../../assets/icons/more/cancel.svg';
import Search from '../../../assets/icons/more/search.svg';
import MapView, {Marker, Polyline, PROVIDER_GOOGLE} from 'react-native-maps';
import {useDispatch, useSelector} from 'react-redux';
import CustumIcon from '../../../assets/icons/marker.svg';
import CurrentLocationIcon from '../../../assets/icons/current_location.svg';
import {API_ENDPOINTS, putRequest} from '../../utils/apiService';
import GeneralModal from '../../components/modal/GeneralModal';
import {setUser} from '../../store/slices/user';
import {useFocusEffect} from '@react-navigation/native';
const apiKey = 'AIzaSyACtjs9iRvE4-kgaiMf5K1PhVWXj0YMCZE';

const requestLocationPermission = async () => {
  if (Platform.OS === 'ios') {
    try {
      const granted = await Geolocation.requestAuthorization('whenInUse');
      if (granted === 'granted') {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  } else {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Geolocation Permission',
          message:
            'Can we access your location? It is necessary to show nearby Studio Labs.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === 'granted') {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      return false;
    }
  }
};

const Map = ({navigation, route}) => {
  const {state} = route.params;
  const locationname = route?.params?.locationname;
  const index = route?.params?.index;
  const places = route?.params?.places;
  const {t} = useTranslation();
  const [searchText, setSearchText] = useState(locationname || '');
  const dispatch = useDispatch();

  const {location, completeAddress} = useSelector(state => state.location);
  const [completeLocation, setCompleteLocation] = useState(completeAddress);
  const [addLoc, setAddLoc] = useState(location);
  const [searchTrue, setSearchTrue] = useState(true);
  const [selectlocation, setselectlocation] = useState(false);

  const [searchResults, setSearchResults] = useState([]);
  const {addresses} = useSelector(state => state.location);
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const mapRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      setSearchText('');
      setSearchResults([]);
      setSearchTrue(true); // Reset searchTrue to true
      setselectlocation(false);
    }, []),
  );

  useEffect(() => {
    if (searchTrue === true) {
      handleSearch();
    }
  }, [searchText]);

  useEffect(() => {
    if (locationname) {
      setSearchText(locationname);
    }
  }, [locationname]);

  useEffect(() => {
    if (mapRef.current && addLoc.latitude && addLoc.longitude) {
      mapRef.current.animateToRegion({
        latitude: addLoc.latitude,
        longitude: addLoc.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  }, [addLoc]);

  const handleSearch = () => {
    if (!searchTrue) return;
    fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${searchText}&key=${apiKey}`,
    )
      .then(response => response.json())
      .then(data => {
        console.log('data', data);
        if (data && data.predictions) {
          setSearchResults(data.predictions);
        } else {
          console.error(
            'Autocomplete API response does not contain predictions:',
            data,
          );
        }
      })
      .catch(error => {
        console.error('Error fetching autocomplete data:', error);
      });
  };

  const handleSelectLocation = (placeId, resultAddress) => {
    fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}`,
    )
      .then(response => response.json())
      .then(data => {
        if (
          data.result &&
          data.result.geometry &&
          data.result.geometry.location
        ) {
          const location = data.result.geometry.location;
          const components = data.result.address_components;
          let country = null;
          let state = null;
          let city = null;
          let zipcode = null;
          let line1 = null;

          line1 = data.result.formatted_address;

          for (let i = 0; i < components.length; i++) {
            const component = components[i];
            if (component.types.includes('country')) {
              country = component.long_name;
            } else if (
              component.types.includes('administrative_area_level_1')
            ) {
              state = component.long_name;
            } else if (component.types.includes('locality')) {
              city = component.long_name;
            } else if (component.types.includes('postal_code')) {
              zipcode = component.long_name;
            }
          }

          setselectlocation(true);

          setCompleteLocation({
            city,
            country,
            line1: resultAddress,
            line2: '',
            location: {
              coordinates: [location.lng, location.lat],
              type: 'Point',
            },
            state,
            type: '',
            zipcode,
          });

          setAddLoc({
            latitude: location.lat,
            longitude: location.lng,
          });
        }
      })
      .catch(error => {
        console.error('Error fetching place details:', error);
      });
  };

  const getAddressFromCoordinates = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`,
      );

      const data = await response.json();
      console.log('data.results', data);
      if (data.results.length > 0) {
        console.log('result', data.results[0]);
        const result = data.results[0];

        const components = result.address_components;
        let country = null;
        let state = null;
        let city = null;
        let zipcode = null;
        let line1 = null;
        line1 = result.formatted_address;

        for (let i = 0; i < components.length; i++) {
          const component = components[i];
          if (component.types.includes('country')) {
            country = component.long_name;
          } else if (component.types.includes('administrative_area_level_1')) {
            state = component.long_name;
          } else if (component.types.includes('locality')) {
            city = component.long_name;
          } else if (component.types.includes('postal_code')) {
            zipcode = component.long_name;
          }
        }
        console.log('  city,country,', city, country);
        setCompleteLocation({
          city,
          country,
          line1,
          line2: '',
          location: {
            coordinates: [lng, lat],
            type: 'Point',
          },
          state,
          type: '',
          zipcode,
        });
        setselectlocation(true);
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  const getCurrentLocation = () => {
    const result = requestLocationPermission();
    result.then(res => {
      if (res) {
        setSearchText('');

        Geolocation.getCurrentPosition(
          position => {
            console.log('postinn', position.coords.latitude);
            setAddLoc({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
            getAddressFromCoordinates(
              position.coords.latitude,
              position.coords.longitude,
            );
          },
          error => {},
          {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
        );
      } else {
        Alert.alert(
          'Location Permission Required',
          'This app needs location permission to function correctly.',
          [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Open Settings', onPress: () => Linking.openSettings()},
          ],
          {cancelable: false},
        );
      }
    });
  };

  const handleSubmitProfileUpdate = async payload => {
    const profileData = payload; // Accepts the payload as-is, whether it's `address` or `locations`

    setIsLoading(true);
    console.log('profileData', profileData);

    // Update profile
    const updateResult = await putRequest(
      API_ENDPOINTS.auth.profileUpdate,
      profileData,
    );

    setIsLoading(false);
    console.log('update result', updateResult);
    if (updateResult.success) {
      dispatch(setUser(updateResult.data));
      navigation.goBack();
    } else {
      setErr(true);
      setErrMsg(updateResult.error);
    }
  };

  const handleChoose = async () => {
    if (location) {
      await getAddressFromCoordinates(location.latitude, location.longitude);
      dispatch(addLocation(addLoc));
      dispatch(setCompleteAddress(completeLocation));

      const addressPayload = {
        address: {
          city: completeLocation.city || '',
          country: completeLocation.country || '',
          line1: completeLocation.line1 || '',
          line2: completeLocation.line2 || '',
          location: {
            coordinates: [
              completeLocation.location?.coordinates[0] || 0,
              completeLocation.location?.coordinates[1] || 0,
            ],
            type: 'Point',
          },
          state: completeLocation.state || '',
          type: completeLocation.type || '',
          zipcode: completeLocation.zipcode || '',
        },
      };

      if (state) {
        navigation.navigate('search', {
          lng: completeLocation.location?.coordinates[0],
          lat: completeLocation.location?.coordinates[1],
          placeName: completeLocation.line1,
        });
      } else {
        console.log('Complete Address:', completeLocation);
        handleSubmitProfileUpdate(addressPayload); // Passes the full address
      }
    } else {
      dispatch(addLocation(addLoc));
      dispatch(setCompleteAddress(completeLocation));
      console.error('Location coordinates are not available.');
    }
    setSearchText('');
  };

  const adduserLocation = async () => {
    console.log('index', index);

    const data = {
      longitude: completeLocation?.location?.coordinates[0],
      latitude: completeLocation?.location?.coordinates[1],
      line1: completeLocation?.line1,
      line2: completeLocation?.country,
    };

    let updatedAddresses = [...addresses];

    if (locationname) {
      // Edit an existing address
      updatedAddresses[index] = data;
      dispatch(editAddress(index, data)); // Redux update
      dispatch(setSelectAddress(data));
    } else {
      // Add a new address
      updatedAddresses = [...addresses, data];
      dispatch(addAddress(data)); // Redux update
      dispatch(setSelectAddress(data));
    }

    console.log('Updated Addresses:', updatedAddresses);

    // Pass the updated addresses to the API
    await handleSubmitProfileUpdate({locations: updatedAddresses});
  };

  return (
    <SafeAreaView style={styles.superContainer}>
      <CustomHeader
        navigation={navigation}
        title={state ? t('location') : t('homeAddress')}
      />

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
        <>
          <View style={styles.textInputContainer}>
            <View style={styles.searchInputIconContainer}>
              <TouchableOpacity>
                <Search width={24} height={24} />
              </TouchableOpacity>
              <TextInput
                allowFontScaling={false}
                style={styles.textInput}
                placeholder={state ? t('location') : t('search')}
                placeholderTextColor={colors.placeholderGrey}
                autoCapitalize="none"
                keyboardType="default"
                value={searchText}
                onChangeText={newSearch => {
                  setSearchText(newSearch);
                }}
              />
            </View>
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Cross width={17} height={17} />
              </TouchableOpacity>
            )}
          </View>
          {searchResults.length > 0 && (
            <View style={styles.suggestionsContainer}>
              {searchResults.map((result, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestion}
                  onPress={() => {
                    setSearchTrue(false);
                    setSearchText(result.description);
                    handleSelectLocation(result.place_id, result.description);
                    setSearchResults([]);
                    Keyboard.dismiss();
                  }}>
                  <Text allowFontScaling={false} style={{color: '#000'}}>
                    {result.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <View></View>

          <MapView
            ref={mapRef}
            style={styles.map}
            provider="google"
            initialRegion={{
              latitude: addLoc?.latitude || 37.78825,
              longitude: addLoc?.longitude || -122.4324,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}>
            <Marker
              coordinate={{
                latitude: addLoc?.latitude || 37.78825,
                longitude: addLoc?.longitude || -122.4324,
              }}>
              <CustumIcon width={45} height={45} />
            </Marker>
          </MapView>

          <TouchableOpacity
            style={styles.currentLocationContainer}
            onPress={getCurrentLocation}>
            {/* <Image
            source={require('../../../assets/icons/current_location.png')}
            style={styles.currentIcon}
          /> */}
            <CurrentLocationIcon width={28} height={28} />
          </TouchableOpacity>

          {selectlocation && (
            <TouchableOpacity
              style={styles.selectTouchOpacity}
              onPress={places ? adduserLocation : handleChoose}>
              <Text allowFontScaling={false} style={styles.selectText}>
                {t('select')}
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </SafeAreaView>
  );
};

export default Map;

const styles = StyleSheet.create({
  superContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    marginBottom: 15,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderGrey,
    marginHorizontal: 16,
    justifyContent: 'space-between',
    gap: 10,
  },
  searchInputIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconStyle: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
  },
  textInput: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.xSmall,
    height: 50,
    color: colors.black,
    flex: 1,
  },
  map: {
    flex: 1,
    position: 'relative',
    zIndex: -1,
  },
  selectTouchOpacity: {
    ...commonStyles.btnContainer,
    marginVertical: 10,
    position: 'absolute',
    width: '90%',
    bottom: 20,
    right: 20,
  },
  selectText: {
    ...commonStyles.btnText,
    fontFamily: fonts.regular,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 175 : 115,
    right: 20,
    left: 20,
    backgroundColor: '#FFFFFF',
    color: '#000000',
    borderRadius: 5,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  suggestion: {
    paddingVertical: 5,
    color: '#000',
  },
  currentLocationContainer: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    padding: 7,
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    bottom: 200,
    right: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 2.0,
    elevation: 8,
  },
  currentIcon: {
    width: '100%',
    height: '100%',
  },
});
