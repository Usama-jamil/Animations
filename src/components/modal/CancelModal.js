import {
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import React, { useState } from 'react';

// Third Party
import { Overlay } from '@rneui/themed';
import { Dropdown } from 'react-native-element-dropdown';

// Stylesheet

import { useTranslation } from 'react-i18next';
import { widthPercentageToDP as WP } from 'react-native-responsive-screen';
import { fontSizes, fonts, colors, commonStyles } from '../../utils/styles';
import ChevronIcon from '../../../assets/icons/auth/chevron.svg';
import { useNavigation } from '@react-navigation/native';

const cancellationData = [
  { label: 'I am not available', value: '1' },
  { label: 'Changed my plans', value: '2' },
  { label: 'Found another option', value: '3' },
  { label: 'Unexpected circumstances', value: '4' },
  { label: 'Financial reasons', value: '5' },
  { label: 'Health issues', value: '6' },
  { label: 'Family emergency', value: '7' },
  { label: 'Travel restrictions', value: '8' },
  { label: 'Unsatisfactory service', value: '9' },
];
const CancelModal = ({
  modalSuccess,
  Set_Modal_Visibilty,
  title,
  yesBtnTitle,
  handleYesPress,
  noBtnTitle,
  handleNoPress,
  cancelOption,
  setCancelOption,
  SetcancelReason,
  cancelReason,
}) => {
  const [reasonOptionValue, setReasonOptionValue] = useState(null);
  const [reasonOptionError, setReasonOptionError] = useState(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const { t } = useTranslation();


  console.log('modal success', modalSuccess)

  const handleOkPress = () => {
    let isValid = true;
    if (cancelOption.trim() === '') {
      setReasonOptionError(true);
      isValid = false;
    } else {
      setReasonOptionError(false);
    }

    if (isValid) {
      handleYesPress();
    }
  };
  const renderItem = () =>
    isDropdownVisible ? (
      <ChevronIcon width={25} height={25} />
    ) : (
      <ChevronIcon width={25} height={25} />
    );

  return (
    <View style={styles.centeredView}>
      <Overlay
        overlayStyle={{
          padding: 0,
          marginBottom: 0,
          borderRadius: 30,
        }}
        animationType="fade"
        transparent={true}
        isVisible={modalSuccess}
        onBackdropPress={() => Set_Modal_Visibilty(false)}>
        <View style={styles.centeredView}>
          <View style={styles.modalContainer}>
            <View style={styles.modalView}>
              <View
                style={{
                  alignItems: 'center',
                }}>
                <Text allowFontScaling={false} style={styles.titleText}>
                  {title}
                </Text>

                <Dropdown
                  style={[styles.dropwDown]}
                  placeholderStyle={styles.placeholderStyle}
                  placeholder={t('selectReason')}
                  selectedTextStyle={styles.dropDownInput}
                  inputSearchStyle={styles.inputSearchStyle}
                  iconStyle={styles.iconStyle}
                  renderRightIcon={renderItem}
                  data={cancellationData}
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  value={reasonOptionValue}
                  onFocus={() => setIsDropdownVisible(true)}
                  onBlur={() => setIsDropdownVisible(false)}
                  onChange={item => {
                    setReasonOptionValue(item.value);
                    setCancelOption(item.label);
                    setReasonOptionError(null);
                  }}
                />
                {reasonOptionError && (
                  <Text allowFontScaling={false} style={styles.errorLabel}>
                    {t('selectOptions')}
                  </Text>
                )}

                <TextInput
                  allowFontScaling={false}
                  style={styles.reasonTextInput}
                  placeholder={t('type')}
                  placeholderTextColor={colors.placeholderGrey}
                  multiline={true}
                  numberOfLines={6}
                  textAlignVertical="top"
                  autoCapitalize="none"
                  keyboardType="default"
                  value={cancelReason}
                  onChangeText={newReasonText => {
                    SetcancelReason(newReasonText);
                  }}
                />

                <TouchableOpacity style={styles.button} onPress={handleOkPress}>
                  <Text allowFontScaling={false} style={styles.buttonText}>
                    {yesBtnTitle}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.notNowBtn}
                  onPress={() => handleNoPress()}>
                  <Text allowFontScaling={false} style={styles.notNowBtnText}>
                    {noBtnTitle}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Overlay>
    </View>
  );
};

export default CancelModal;

const styles = StyleSheet.create({
  centeredView: {
    justifyContent: 'center',
    alignItems: 'center',
    width: WP('80'),
  },
  modalContainer: {
    alignItems: 'center',
    borderRadius: 30,
    overflow: 'hidden',
    width: WP('80'),
    color: colors.white,
  },
  modalView: {
    alignItems: 'center',
  },
  modalImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginBottom: 10,
    marginTop: 20,
  },
  titleText: {
    fontSize: 20,
    width: WP('60'),
    textAlign: 'center',
    fontFamily: fonts.semiBold,
    color: colors.black,
    marginVertical: 15,
  },
  reasonTextInput: {
    height: 150,
    borderColor: '#0000001A',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingTop: 15,
    color: colors.black,
    width: WP('70'),
  },
  errorLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 19,
    color: colors.red,
    marginBottom: 15,
    marginHorizontal: 16,
    textAlign: 'center',
  },
  button: {
    ...commonStyles.btnContainer,
    width: WP('60'),
    marginVertical: 20,
  },
  buttonText: {
    ...commonStyles.btnText,
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
  iconStyle: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
    marginRight: 10,
  },
  dropwDown: {
    borderWidth: 1,
    borderColor: colors.borderGrey,
    borderRadius: 6,
    height: 50,
    marginVertical: 15,
    paddingHorizontal: 4,
    width: WP('70'),
  },
  placeholderStyle: {
    fontSize: 14,
    paddingHorizontal: 10,
    fontFamily: fonts.regular,
    color: colors.placeholderGrey,
  },
  dropDownInput: {
    paddingHorizontal: 10,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: '#000000',
    flex: 1,
  },
  inputSearchStyle: {
    height: 50,
    fontSize: 16,
  },
});
