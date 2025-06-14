import React from 'react';
import {StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';

// Third Party
import {Overlay} from '@rneui/themed';
import {
  widthPercentageToDP as WP,
  heightPercentageToDP as HP,
} from 'react-native-responsive-screen';

// Components
import {useTranslation} from 'react-i18next';
import {useNavigation, useRoute} from '@react-navigation/native';

// Styles
import {colors, commonStyles, fontSizes, fonts} from '../../utils/styles';
import {useDispatch} from 'react-redux';
import {removeLocalUser} from '../../store/slices/user';
import {setCompleteAddress} from '../../store/slices/location';

import error_Red from '../../../assets/icons/circle-information-red.png';

const GeneralModal = ({
  modalSuccess,
  modalError,
  Set_Modal_Visibilty,
  imageSource,
  title,
  description,
  yesBtnTitle,
  handleYesPress,
  noBtnTitle,
  handleNoPress,
}) => {
  const {t} = useTranslation();
  const route = useRoute();
  const dispatch = useDispatch();
  const tokenErrorMessage =
    'Your session has expired. Please login again to continue using application.';

  const handleLoginUser = () => {
    Set_Modal_Visibilty(false);
    setTimeout(() => {
      dispatch(removeLocalUser());
      dispatch(setCompleteAddress(null));
    }, 1000);
  };
  return (
    <View style={styles.centeredView}>
      <Overlay
        overlayStyle={{
          padding: 0,
          marginBottom: 0,
          borderRadius: 20,
        }}
        animationType="fade"
        transparent={true}
        isVisible={
          modalSuccess === true
            ? modalSuccess
            : modalError === true
            ? modalError
            : false
        }
        onBackdropPress={() => {
          if (route.name === 'VerifyOTP' || route.name === 'AddNewPassword') {
            null;
          } else {
            Set_Modal_Visibilty(false);
          }
        }}>
        <View style={styles.centeredView}>
          <View
            style={[
              styles.modalContainer,
              {
                marginTop:
                  route.name === 'AccountManagement' ||
                  route.name === 'BookingDetail' ||
                  route.name === 'SubscriptionDetail' ||
                  route.name === 'AttachCards' ||
                  route.name === 'CardManagement' ||
                  route.name === 'VerifyOTP' ||
                  route.name === 'PayNow' ||
                  route.name === 'PayNow' ||
                  route.name === 'SelectTime' ||
                  route.name === 'HomeDetails' ||
                  route.name === 'CompaignService' ||
                  route.name === 'ServiceDetails' ||
                  route.name === 'Home' ||
                  route.name === 'ContactSupport' ||
                  route.name === 'Booking' ||
                  route.name === 'Chat' ||
                  route.name === 'ProductDetails' ||
                  route.name === 'ListingBookingDetail' || route.name === 'ConfirmPickup' || route.name === 'ReturnListing'
                    ? 20
                    : 0,
              },
            ]}>
            <View style={styles.modalView}>
              {modalSuccess === true ? (
                <View
                  style={{
                    alignItems: 'center',
                  }}>
                  {imageSource}
                  <Text
                    allowFontScaling={false}
                    style={[
                      [
                        styles.titleText,
                        {marginTop: route.name === 'AddNewPassword' ? 0 : 20},
                      ],
                      title === 'Delete Account'
                        ? styles.redColor
                        : styles.blackColor,
                    ]}>
                    {title}
                  </Text>
                  <Text allowFontScaling={false} style={styles.descriptionText}>
                    {description}
                  </Text>

                  <TouchableOpacity
                    style={[
                      styles.button,
                      {
                        marginBottom:
                          route.name === 'AddNewPassword' ||
                          route.name === 'VerifyOTP'
                            ? 10
                            : 0,
                      },
                    ]}
                    onPress={() => handleYesPress()}>
                    <Text allowFontScaling={false} style={styles.buttonText}>
                      {yesBtnTitle}
                    </Text>
                  </TouchableOpacity>

                  {route.name !== 'AddNewPassword' &&
                    route.name !== 'VerifyOTP' && (
                      <TouchableOpacity
                        style={[
                          styles.buttonDismiss,
                          {
                            backgroundColor:
                              route.name === 'AccountManagement' &&
                              colors.btnDissmiss,
                            marginTop: route.name === 'AccountManagement' && 15,
                          },
                        ]}
                        onPress={() =>
                          route.name === 'VerifyOTP' ? null : handleNoPress()
                        }>
                        <Text
                          allowFontScaling={false}
                          style={[
                            styles.buttonDismissText,
                            {
                              color:
                                route.name === 'AccountManagement' &&
                                colors.background,
                            },
                          ]}>
                          {noBtnTitle}
                        </Text>
                      </TouchableOpacity>
                    )}
                </View>
              ) : modalError === true ? (
                <View style={styles.modalView}>
                  <Image source={error_Red} style={styles.icon_red_icon} />
                  <Text
                    allowFontScaling={false}
                    style={[
                      styles.titleText,
                      styles.scarletRedColor,
                      {marginTop: 5, color: colors.black},
                    ]}>
                    {t('Error')}
                  </Text>
                  <Text
                    allowFontScaling={false}
                    style={[styles.descriptionText, {marginBottom: 20}]}>
                    {description}
                  </Text>
                  {description === tokenErrorMessage && (
                    <TouchableOpacity
                      style={[
                        styles.button,
                        {
                          backgroundColor: colors.primary,
                          marginTop: -5,
                        },
                      ]}
                      onPress={handleLoginUser}>
                      <Text allowFontScaling={false} style={styles.buttonText}>
                        {t('login')}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </Overlay>
    </View>
  );
};

export default GeneralModal;

const styles = StyleSheet.create({
  centeredView: {
    justifyContent: 'center',
    alignItems: 'center',
    width: WP('80'),
  },
  modalContainer: {
    alignItems: 'center',
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingBottom: 15,
    overflow: 'hidden',
    width: WP('80'),
    color: colors.background,
  },
  modalView: {
    alignItems: 'center',
  },
  modalImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  titleText: {
    fontSize: 20,
    width: WP('60'),
    textAlign: 'center',
    fontFamily: fonts.semiBold,
  },
  blackColor: {
    color: colors.black,
  },
  redColor: {
    color: colors.red,
  },
  descriptionText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 25,
    color: colors.black,
    width: WP('60'),
    marginTop: 10,

    textAlign: 'center',
  },
  button: {
    ...commonStyles.btnContainer,
    width: WP('60'),
    marginTop: 30,
  },
  buttonText: {
    ...commonStyles.btnText,
  },

  buttonDismiss: {
    ...commonStyles.btnDismissContainer,
    width: WP('60'),
    // marginTop: 30,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 10,
  },
  buttonDismissText: {
    ...commonStyles.btnDismissText,
    fontSize: fontSizes.xSmall,
    fontFamily: fonts.regular,
    color: colors.black,
    textAlign: 'center',
  },
  addMembershipBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    height: 50,
    width: WP('60'),
    marginBottom: 15,
  },
  notNowBtn: {
    marginBottom: 20,
  },
  notNowBtnText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    lineHeight: 21,
    color: colors.black,
  },
  icon: {
    width: 30,
    height: 30,

    resizeMode: 'contain',
    tintColor: colors.red,
  },
  redColor: {
    color: colors.red,
  },
  icon_red_icon: {
    width: 30,
    height: 30,
    marginTop: 10,
    resizeMode: 'contain',
    tintColor: colors.red,
  },
});
