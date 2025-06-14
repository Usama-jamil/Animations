import React, {useState, useEffect, useRef} from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Components
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';
import {setUserLang} from '../../store/slices/user';

// Styles
import {colors, commonStyles, fontSizes, fonts} from '../../utils/styles';
import CheckBoxFill from '../../../assets/icons/circle_check_fill.svg';
import CheckBoxUnFill from '../../../assets/icons/circle_check_unfill.svg';

// Assets
import Logo from '../../../assets/images/logo/logo.svg';

// Data
import {API_ENDPOINTS, getRequest} from '../../utils/apiService';
import GeneralModal from '../../components/modal/GeneralModal';
import ActivityIndicatorModal from '../../components/modal/ActivityIndicatorModal';
import FastImage from 'react-native-fast-image';
import CustomHeader from '../../components/header/CustomHeader';
import moment from 'moment';
import 'moment/locale/ar'; // Arabic
import 'moment/locale/bn'; // Bengali
import 'moment/locale/da'; // Danish
import 'moment/locale/de'; // German
import 'moment/locale/es'; // Spanish
import 'moment/locale/fi'; // Finnish
import 'moment/locale/fr'; // French
import 'moment/locale/ga'; // Irish
import 'moment/locale/hi'; // Hindi
import 'moment/locale/ku'; // Kurdish
import 'moment/locale/ms'; // Malay
import 'moment/locale/nl'; // Dutch
import 'moment/locale/pl'; // Polish
import 'moment/locale/pt'; // Portuguese
import 'moment/locale/ru'; // Russian
import 'moment/locale/sv'; // Swedish
import 'moment/locale/ur'; // Urdu
import 'moment/locale/ta'; // Tamil
import 'moment/locale/tr'; // Turkish
import 'moment/locale/th'; // Thai
import 'moment/locale/zh-cn'; // Simplified Chinese
import 'moment/locale/zh-tw'; // Simplified Chinese
import 'moment/locale/hy-am'; // Armenian
import 'moment/locale/pa-in'; // Panjabi
import 'moment/locale/nb';

const ChooseLanguage = ({navigation, route}) => {
  const {t} = useTranslation();
  const [selectedLang, setSelectedLang] = useState('');
  const dispatch = useDispatch();
  const [selectedtranslatery, setselectedtranslatery] = useState('');
  const [languageData, setlanguageData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const home = route?.params?.home;
  const scrollViewRef = useRef(null);
  const [scrollToEnglish, setScrollToEnglish] = useState(false);
  const {user, isUserOnboarded} = useSelector(state => state.auth);

  const handleLangSelection = langItem => {
    setSelectedLang(langItem._id);
    dispatch(setUserLang(langItem.code));
    setselectedtranslatery(langItem.translatory);

    let localeCode;
    switch (langItem.code) {
      case 'hy':
        localeCode = 'hy-am'; // Armenian
        break;
      case 'pa':
        localeCode = 'pa-in'; // Punjabi
        break;
      case 'zh':
        localeCode = 'zh-tw'; // Traditional Chinese
        break;
      case 'no':
        localeCode = 'nb'; // Norwegian Bokmål
        break;
      default:
        localeCode = langItem.code; // Default case
    }

    // Check if the locale is supported
    const supportedLocale = moment.locales().includes(localeCode)
      ? localeCode
      : 'en'; // Fallback to English
    moment.locale(supportedLocale);
  };

  const handlePress = () => {
    isUserOnboarded
      ? navigation.navigate('Login')
      : navigation.navigate('OnBoarding');
  };

  useEffect(() => {
    fetchLanguage();
  }, []);

  const fetchLanguage = async () => {
    setIsLoading(true);
    const response = await getRequest(`${API_ENDPOINTS.language.get}`);
    if (response?.success) {
      setIsLoading(false);
      let languages = response?.data || [];

      // Sort languages alphabetically by title
      languages.sort((a, b) => a.title.localeCompare(b.title));
      setlanguageData(languages);

      if (languages.length > 0) {
        const firstLang = languages[0];
        setSelectedLang(firstLang?._id);
        setselectedtranslatery(firstLang?.translatory);
        moment.locale(firstLang.code);
        dispatch(setUserLang(firstLang?.code));
      }
    } else {
      console.log('error', response?.error);
      setIsLoading(false);
      setErr(true);
      setErrMsg(result.error || t('AnUnexpectedErrorOccurred'));
    }
  };

  const handleScrollViewLayout = () => {
    if (scrollToEnglish && scrollViewRef.current) {
      const englishLanguage = languageData.find(
        language => language?.title === 'English',
      );
      if (englishLanguage) {
        const englishIndex = languageData.findIndex(
          lang => lang._id === englishLanguage._id,
        );
        const itemHeight = 60; // Height of each language item (adjust as needed)
        const offset = englishIndex * itemHeight;

        // Scroll to the English language
        scrollViewRef.current.scrollTo({y: offset, animated: true});
        setScrollToEnglish(false); // Reset the flag
      }
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      {err && (
        <GeneralModal
          modalError={true}
          message={errMsg}
          Set_Modal_Visibilty={setErr}
        />
      )}
      {isLoading && <ActivityIndicatorModal loaderIndicator={isLoading} />}
      {home && <CustomHeader title={t('language')} />}

      {!home && (
        <>
          <Logo width={150} height={60} style={styles.logo} />
          <Text allowFontScaling={false} style={styles.chooseText}>
            {selectedtranslatery}
          </Text>
        </>
      )}

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 15, marginHorizontal: 10}}
        onLayout={handleScrollViewLayout}>
        {languageData?.map((langItem, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.langOpacity,
              selectedLang === langItem._id
                ? styles.selectedLang
                : styles.unSelectedLang,
            ]}
            onPress={() => handleLangSelection(langItem)}>
            <View style={styles.flagNameContainer}>
              <FastImage
                source={{uri: langItem?.flag}}
                style={styles.flagIcon}
              />

              <Text allowFontScaling={false} style={styles.langNameText}>
                {langItem.title}
              </Text>
            </View>

            {selectedLang === langItem._id ? (
              <CheckBoxFill width={22} height={22} />
            ) : (
              <CheckBoxUnFill width={22} height={22} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {!home && !isLoading && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={
              selectedLang
                ? commonStyles.btnContainer
                : commonStyles.btnContainerDisable
            }
            disabled={!selectedLang}
            onPress={handlePress}>
            <Text
              allowFontScaling={false}
              style={
                selectedLang
                  ? commonStyles.btnText
                  : commonStyles.btnTextDisable
              }>
              {t('continue')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default ChooseLanguage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  logo: {
    alignSelf: 'center',
    marginTop: 10,
  },
  chooseText: {
    fontFamily: fonts.bold,
    alignSelf: 'center',
    fontSize: fontSizes.large,
    color: colors.black,
    marginVertical: 10,
  },
  innerContainer: {
    padding: 20,
    flex: 1,
  },
  langOpacity: {
    backgroundColor: colors.lightGrey,
    height: 50,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingHorizontal: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  selectedLang: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  unSelectedLang: {
    borderWidth: 1,
    borderColor: colors.lightGrey,
  },
  flagNameContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'row',
  },
  flagIcon: {
    width: 25,
    height: 25,
    borderRadius: 6,
    marginRight: 15,
  },
  langNameText: {
    color: colors.black,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 17,
    marginRight: 5,
  },
  flagContainer: {
    marginRight: 10,
  },
  rowContainer: {
    flexDirection: 'row',
    alignContent: 'center',
  },
  bottomContainer: {
    margin: 10,
    marginVertical: 15,
  },
  flagIcon: {
    width: 25,
    height: 25,
    borderRadius: 6,
    marginRight: 15,
  },
});
