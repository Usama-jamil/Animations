import React, {useRef, useState} from 'react';
import {
  StyleSheet,
  ImageBackground,
  Dimensions,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Platform,
} from 'react-native';

// Components
import {useTranslation} from 'react-i18next';

// Data
import {getOnBoardingData} from '../../data/onBoardingData';

// Assets
import NextIcon from '../../../assets/icons/arrow_forward_white.svg';
import onBoarding1 from '../../../assets/images/onBoarding/onBoarding_bg_1.png';
import onBoarding2 from '../../../assets/images/onBoarding/onBoarding_bg_2.png';
import onBoarding3 from '../../../assets/images/onBoarding/onBoarding_bg_3.png';

// Styles
import {colors, commonStyles, fontSizes, fonts} from '../../utils/styles';
import { useDispatch } from 'react-redux';
import { setUserOnboarding } from '../../store/slices/user';

const windowWidth = Dimensions.get('window').width;

const OnBoarding = ({navigation}) => {
  const {t} = useTranslation();
  const scrollViewRef = useRef();
  const [currentPage, setCurrentPage] = useState(0);
  const onBoardingData = getOnBoardingData(t);
const dispatch = useDispatch()
  const handleScroll = event => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / windowWidth);
    setCurrentPage(page);
  };

  const handleNext = () => {
    if (currentPage < onBoardingData.length - 1) {
      scrollViewRef.current.scrollTo({
        x: (currentPage + 1) * windowWidth - 40,
        animated: true,
      });
    } else {
      navigation.navigate('Login');
      dispatch(setUserOnboarding(true))
    }
  };

  const renderPageControl = () => (
    <View style={styles.pageControl}>
      {onBoardingData.map((_, index) => (
        <View
          key={index}
          style={[
            styles.pageIndicator,
            index === currentPage ? styles.currentPage : styles.otherPage,
          ]}
        />
      ))}
    </View>
  );

  return (
    <ScrollView
      contentContainerStyle={{flexGrow: 1}}
      showsVerticalScrollIndicator={false}>
      <ImageBackground
        style={styles.container}
        source={
          currentPage === 0
            ? onBoarding1
            : currentPage === 1
            ? onBoarding2
            : onBoarding3
        }>
        <ScrollView
          horizontal
          pagingEnabled
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          onMomentumScrollEnd={handleScroll}
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollViewContent}>
          {onBoardingData?.map((item, index) => (
            <View style={styles.itemContainer} key={index}>
              <View style={styles.imgContainer}>
                {item?.image}
                <Text allowFontScaling={false} style={styles.titleText}>
                  {item?.title}
                </Text>
              </View>
              <Text allowFontScaling={false} style={styles.headingText}>
                {item?.heading}
              </Text>
              <Text allowFontScaling={false} style={styles.detailText}>
                {item?.detail}
              </Text>
            </View>
          ))}
        </ScrollView>
        <View style={styles.bottomContainer}>
          {currentPage === 2 ? (
            <TouchableOpacity
              style={commonStyles.btnContainer}
              onPress={() => handleNext()}>
              <Text allowFontScaling={false} style={commonStyles.btnText}>
                {t('start')}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.nextSkipContainer}>
              {renderPageControl()}
              <TouchableOpacity
                style={styles.nextOpacity}
                onPress={() => handleNext()}>
                <NextIcon width={25} height={25} style={styles.nextIcon} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ImageBackground>
    </ScrollView>
  );
};

export default OnBoarding;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    padding: 20,
  },
  safeArea: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  pageControl: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageIndicator: {
    borderRadius: 1,
    marginHorizontal: 5,
  },
  currentPage: {
    backgroundColor: colors.primary,
    height: 10,
    width: 28,
    borderRadius: 5,
  },
  otherPage: {
    backgroundColor: colors.grey,
    height: 11,
    width: 11,
    borderRadius: 11 / 2,
  },
  itemContainer: {
    alignItems: 'center',
    width: windowWidth - 40,
    marginTop: 20,
  },
  imgContainer: {
    alignItems: 'center',
    paddingBottom: 5,
  },
  titleText: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.xlarge,
    color: colors.primary,
  },
  headingText: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.xlarge,
    color: colors.black,
    textAlign: 'center',
    marginHorizontal: 30,
  
  },
  purpleText: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: fontSizes.xlarge,
  },
  detailText: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.medium,
    color: colors.darkGrey,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  nextSkipContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  nextOpacity: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextIcon: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
  },
  bottomContainer: {
    justifyContent: 'flex-end',
    marginBottom: Platform.OS === 'ios' ? 20 : 0,
  },
});
