import { StyleSheet } from 'react-native';

// Define primary colors
export const colors = {
  primary: '#7955CF',
  secondary: '#EEF8FF',
  secondary1: '#EEFFF8',
  warning: 'rgba(163, 29, 0, 1)',
  primarylight: 'rgba(187, 166, 255, 1)',
  background: '#FFFFFF',
  black: '#000',
  red: '#ea0014',
  grey: '#D8D8D8',
  gray: '#E9E9E9',
  darkGrey: '#A6A6A6',
  lightGrey: '#F7F7F7',
  uploadImgBg: '#F9F6FF',
  borderGrey: '#f2f2f2',
  borderColor: '#0000001a',
  placeholderGrey: '#A7A7A7',
  btnDissmiss: '#909090',
  msgGreyBg: '#F2F4F5',
  green: '#00A524',
  lightSky: '#d9fbff',
  lightBlack: '#00000080',
  lightbeige: '#ffeec7',
  lightPink: '#FFEAE6',
  lightBlue: '#eef8ff',
  lightGreen: '#E7FFDD',
  lightYellow: '#ffefe6',
  extralightblue: '#f4faff',
  cancel: '#cf5555',
lightPrimary: '#f4efff',
  darkBlue: '#2b78e4',
  yellow: '#ffc403',

  closedTime: '#eb9481',
white:'#FFFFFF',
  paleGrey: '#fffcf4',
  popBg: '#c5c5c5',
 lightPurple: "#E0D3FF",
  whiteGray:"#FAFAFA"

};

// Define common font sizes
export const fontSizes = {
  mSmall: 10,
  small: 12,
  xSmall: 14,
  medium: 16,
  xMedium: 18,
  large: 20,
  xlarge: 24,
};

// Define common font families
export const fonts = {
  black: 'Poppins-Black',
  blackItalic: 'Poppins-BlackItalic',
  bold: 'Poppins-Bold',
  boldItalic: 'Poppins-BoldItalic',
  extraBold: 'Poppins-ExtraBold',
  extraBoldItalic: 'Poppins-ExtraBoldItalic',
  extraLight: 'Poppins-ExtraLight',
  extraLightItalic: 'Poppins-ExtraLightItalic',
  iItalic: 'Poppins-Italic',
  light: 'Poppins-Light',
  lightItalic: 'Poppins-LightItalic',
  medium: 'Poppins-Medium',
  mediumItalic: 'Poppins-MediumItalic',
  regular: 'Poppins-Regular',
  semiBold: 'Poppins-SemiBold',
  semiBoldItalic: 'Poppins-SemiBoldItalic',
  thin: 'Poppins-Thin',
  thinItalic: 'Poppins-ThinItalic',
};

export const commonStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  heading: {
    fontSize: fontSizes.large,
    color: colors.black,
    fontFamily: fonts.semiBold,
  },
  linkSmallText: {
    fontSize: fontSizes.small,
    color: colors.primary,
    fontFamily: fonts.medium,
  },
  text: {
    color: colors.text,
    fontFamily: fonts.regular,
  },
  header: {
    fontSize: fontSizes.xlarge,
    fontFamily: fonts.bold,
    color: colors.primary,
    marginBottom: 16,
  },
  btnDelContainer: {
    height: 50,
    borderRadius: 10,
    backgroundColor: colors.red,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnContainer: {
    height: 50,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 13,
    marginTop:10
  },
  btnText: {
    color: colors.background,
    fontFamily: fonts.regular,
  },
  btnDismissContainer: {
    alignSelf: 'center',
  },
  btnDismissText: {
    color: colors.background,
    fontFamily: fonts.regular,
  },

  btnDismissBlack: {
    color: colors.black,
    fontFamily: fonts.regular,
  },

  btnOutlineContainer: {
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: "center",
  },
  btnOutlineText: {
    color: colors.primary,
    fontFamily: fonts.regular,
  },
  btnContainerDisable: {
    height: 50,
    borderRadius: 10,
    backgroundColor: colors.grey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnTextDisable: {
    color: colors.black,
    fontFamily: fonts.regular,
  },
});

export default {
  colors,
  fontSizes,
  fonts,
  commonStyles,
};
