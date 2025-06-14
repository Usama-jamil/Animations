import React from 'react';
import {
  widthPercentageToDP as WP,
  heightPercentageToDP as HP,
} from 'react-native-responsive-screen';

import OnBoarding1 from '../../assets/icons/onBoarding/onBoarding_1.svg';
import OnBoarding2 from '../../assets/icons/onBoarding/onBoarding_2.svg';
import OnBoarding3 from '../../assets/icons/onBoarding/onBoarding_3.svg';

export const getOnBoardingData = t => [
  {
    image: <OnBoarding1 width={WP(100)} height={HP(40)} />,
    title: t('onBoardingOneTitle'),
    heading: t('onBoardingOneHeading'),
    detail: t('onBoardingOneDetail'),
  },
  {
    image: <OnBoarding2 width={WP(100)} height={HP(40)} />,
    title: t('onBoardingTwoTitle'),
    heading: t('onBoardingTwoHeading'),
    detail: t('onBoardingTwoDetail'),
  },
  {
    image: <OnBoarding3 width={WP(100)} height={HP(40)} />,
    title: t('onBoardingThreeTitle'),
    heading: t('onBoardingThreeHeading'),
    detail: t('onBoardingThreeDetail'),
  },
];
