import React, {useState} from 'react';
import {
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  FlatList,
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';

// Components
import CustomHeader from '../../components/header/CustomHeader';
import {useTranslation} from 'react-i18next';
import {colors, commonStyles, fonts} from '../../utils/styles';
import {useDispatch} from 'react-redux';
import {setUser} from '../../store/slices/user';
import {useFocusEffect} from '@react-navigation/native';
import {API_ENDPOINTS, getRequest, putRequest} from '../../utils/apiService';
import {ActivityIndicator} from 'react-native';
import FastImage from 'react-native-fast-image';

const screenWidth = Dimensions.get('window').width;
const isSmallScreen = screenWidth < 400;

const IntrestedCategory = ({navigation, route}) => {
  const {t} = useTranslation();
  const user = route?.params?.user;

  const [selectedBusinesses, setSelectedBusinesses] = useState([]);
  const [businessError, setBusinessError] = useState(null);
  const dispatch = useDispatch();
  const [categorey, setcategorey] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true); // State for tracking loading status

  function onLoadStart() {
    setLoading(true);
    setError(false);
  }

  function onLoadEnd() {
    setLoading(false);
  }
  function onError(error) {
    console.log('error',error)
    setLoading(false);
    setError(true);
  }


  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, []),
  );

  const fetchData = async () => {
    setIsLoading(true);

    const result = await getRequest(API_ENDPOINTS.categorey.getAll);
    setIsLoading(false);
    if (result.success) {
      setcategorey(result?.data);
    } else {
      setErr(true);
      setErrMsg(result.error);
    }
  };

  const handleSelectBusiness = id => {
    setSelectedBusinesses(prevState => {
      if (prevState.includes(id)) {
        return prevState.filter(item => item !== id);
      } else {
        return [...prevState, id];
      }
    });
    setBusinessError(null);
  };

  const renderBusinessItem = ({item, index}) => {
    const isSelected = selectedBusinesses.includes(item._id);
    return (
      <TouchableOpacity
        key={item._id}
        style={styles.categoryContainer}
        onPress={() => handleSelectBusiness(item._id)}>
        {loading && (
          <View style={styles.imageLoader}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}
        {error ? (
          <Image
            source={require('../../../assets/images/image-placeholder.jpg')}
            style={styles.businessImg}
          />
        ) : (
          <>   
          <FastImage
            source={{uri: item?.customerBanner}}
            style={[
              styles.businessImg,
            ]}
            onLoadEnd={onLoadEnd}
            onLoadStart={onLoadStart}
            onError={onError}
          />

           {isSelected && (
                      <Image
                        source={require('../../../assets/icons/circle-check-fill.png')}
                        style={styles.selectedImageContainer}
                        resizeMode="cover"
                      />
                    )}

</>
        )}
      </TouchableOpacity>
    );
  };

  const handleAddBusiness = async () => {
    if (selectedBusinesses.length === 0) {
      setBusinessError(t('pleaseSelectBusiness'));
      return;
    }

    const profileData = {
      interests: selectedBusinesses,
    };

    setIsLoading(true);

    // Update profile
    const updateResult = await putRequest(
      API_ENDPOINTS.auth.profileUpdate,
      profileData,
    );

    console.log('result', updateResult);

    setIsLoading(false);

    if (updateResult.success) {
      dispatch(setUser(user));
    } else {
      setErr(true);
      setErrMsg(updateResult.error);
    }
  };

  return (
    <SafeAreaView style={styles.superContainer}>
      <CustomHeader title={t('interestsCategory')} />

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
          <View style={styles.categoriesContainer}>
            <FlatList
              data={categorey}
              keyExtractor={item => item._id}
              renderItem={renderBusinessItem}
              ItemSeparatorComponent={() => <View style={{height: 20}} />}
              showsVerticalScrollIndicator={false}
            />

            {businessError && (
              <Text allowFontScaling={false} style={styles.errorLabel}>
                {businessError}
              </Text>
            )}
            <TouchableOpacity
              style={styles.nextTouchOpacity}
              onPress={handleAddBusiness}>
              <Text allowFontScaling={false} style={styles.nextText}>
                {t('next')}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

export default IntrestedCategory;

const styles = StyleSheet.create({
  superContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  categoriesContainer: {
    flex: 1,
  },
  selectedCategory: {
    borderWidth: 2, // Increased border width for better visibility
    borderColor: colors.primary,
  },
  categoryContainer: {
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  businessImg: {
    width: '100%',
    height: isSmallScreen ? 155 : 200,
    resizeMode: 'cover',
    marginBottom: 20,
    position:"relative"
  },
  businessText: {
    textAlign: 'center',
    fontFamily: fonts.semiBold,
    color: colors.black,
    fontSize: 18,
    lineHeight: 21,
    marginTop: 15,
  },
  errorLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 19,
    color: colors.red,
    textAlign: 'center',
    marginVertical: 20,
  },
  nextTouchOpacity: {
    ...commonStyles.btnContainer,
    margin: 10,
  },
  nextText: {
    ...commonStyles.btnText,
  },
  imageLoader: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  selectedImageContainer: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 24,
    height: 24,
    tintColor: colors.background,
  },
});
