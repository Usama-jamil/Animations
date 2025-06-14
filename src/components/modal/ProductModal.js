import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Overlay } from '@rneui/themed';
import {
  widthPercentageToDP as WP,
  heightPercentageToDP as HP,
} from 'react-native-responsive-screen';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import CirclePlus from '../../../assets/icons/circle-plus.svg';
import Minus from '../../../assets/icons/minus.svg';
import Plus from '../../../assets/icons/plus.svg';
import { colors, commonStyles, fontSizes, fonts } from '../../utils/styles';
import {
  RemoveSelectedProduct,
  SetSelectedProducts,
} from '../../store/slices/cart';
import { useDispatch } from 'react-redux';
import Toast from 'react-native-toast-message';
import { TextInput } from 'react-native';
import { Title } from 'react-native-paper';

const ProductModal = ({
  Set_Modal_Visibilty,
  selectedVariant,
  id,
  branchid,
  selected,
  currencyCode,
}) => {
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();

  console.log('selectedVariant', selectedVariant);

  const [QuantityError, setQuantityError] = useState(null);
  const [count, setCount] = useState(0);
  const dispatch = useDispatch();

  const increment = () => {
    if (count < selectedVariant?.totalStock) {
      setCount(count + 1);
    } else if (count > selectedVariant?.totalStock) {
      setQuantityError(t('maxVariantLimit'));
    } else {
      setQuantityError(null);
    }
  };

  const decrement = () => {
    if (count > 0) {
      setCount(count - 1);
    }
  };

  const handleAdd = () => {
    if (count < 1) {
      setQuantityError(t('pleaseSelectQuantity'));
      return
    } else {
      setQuantityError(null);
    }

    const data = {
      inventory: id,
      varinat: selectedVariant?._id,
      title: selectedVariant?.variantTitle,
      quantity: count,
      _id: id,
      total: selectedVariant?.price * count,
      price: selectedVariant?.price,
      branch: branchid,
    };
    console.log('data', data)

    if (count) {
      dispatch(RemoveSelectedProduct(selected?.inventory));
      dispatch(SetSelectedProducts(data));
      Set_Modal_Visibilty(false);
      Toast.show({
        type: 'success',
        position: 'top',
        bottomOffset: 20,
        text1: t('success'),
        text2: t('productAddSuccessfully'),
        visibilityTime: 3000,
      });
      navigation.navigate('HomeDetails', { id: branchid });
    }
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
        onBackdropPress={() => Set_Modal_Visibilty(false)}>
        <View style={styles.centeredView}>
          <View style={styles.modalContainer}>
            <View style={styles.modalView}>
              <View style={styles.circle}>
                <CirclePlus width={33} height={33} />
              </View>

              <Text allowFontScaling={false} style={styles.titleText}>
                {t('selectQuantity')}
              </Text>

              <View style={styles.rowContainer}>
                <TouchableOpacity
                  style={[
                    styles.countCircle,
                    { backgroundColor: colors.warning },
                  ]}
                  onPress={decrement}>
                  <Minus width={24} height={24} />
                </TouchableOpacity>
                <Text allowFontScaling={false} style={styles.number}>
                  {count}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.countCircle,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={increment}>
                  <Plus width={24} height={24} />
                </TouchableOpacity>
              </View>

              {QuantityError && (
                <Text allowFontScaling={false} style={styles.errorLabel}>
                  {QuantityError}
                </Text>
              )}

              <Text allowFontScaling={false} style={styles.inputHeading}>{t('sizeValue')}</Text>

              <View style={styles.textInputContainer}>
                <TextInput
                  allowFontScaling={false}
                  style={styles.textInput}
                  placeholder={t('password')}
                  placeholderTextColor={colors.grey}
                  autoCapitalize="none"
                  keyboardType="default"
                  value={selectedVariant?.sizeValue?.value}
                  editable={false} // This makes the TextInput read-only
                />

              </View>

              <Text allowFontScaling={false} style={styles.inputHeading}>{t('Colors')}</Text>
              <View style={styles.colorsContainer}>
                <TouchableOpacity
                  style={[
                    styles.colorBox,
                    { backgroundColor: selectedVariant.color },

                  ]}
                />
              </View>
              <View style={styles.rowContainerBetween}>
                <Text allowFontScaling={false} style={styles.inputHeading}>
                  {t('totalPrice')}:
                </Text>
                <Text
                  allowFontScaling={false}
                  style={[styles.inputHeading, { color: colors.primary }]}>
                  {selectedVariant?.price * count}{' '}
                  <Text
                    allowFontScaling={false}
                    style={{ fontSize: 13, fontFamily: fonts.regular }}>
                    {currencyCode}
                  </Text>
                </Text>
              </View>

              <TouchableOpacity style={styles.button} onPress={handleAdd}>
                <Text allowFontScaling={false} style={styles.buttonText}>
                  {t('add')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => Set_Modal_Visibilty(false)}>
                <Text allowFontScaling={false} style={styles.buttonDismissText}>
                  {t('cancel')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Overlay>
    </View>
  );
};

export default ProductModal;

const styles = StyleSheet.create({
  centeredView: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    borderRadius: 30,
    color: colors.background,
    width: WP('90'),
    padding: 20,
  },
  modalView: {
    paddingTop: 15,
  },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 44 / 2,
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: colors.primarylight,
  },
  titleText: {
    fontSize: fontSizes.large,
    width: WP('60'),
    textAlign: 'center',
    fontFamily: fonts.semiBold,
    marginTop: 20,
    color: colors.black,
    alignSelf: 'center',
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
    textAlign: 'center',
  },
  button: {
    ...commonStyles.btnContainer,
    width: WP('60'),
    marginBottom: 20,
    alignSelf: 'center',
  },
  buttonText: {
    ...commonStyles.btnText,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
  },
  countCircle: {
    width: 36,
    height: 36,
    borderRadius: 36 / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderGrey,
  },
  errorLabel: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 19,
    color: colors.red,
    marginTop: 10,
  },
  inputHeading: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 17,
    color: colors.black,
    marginVertical: 10,
    marginTop: 20,
  },
  colorsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  colorBox: {
    width: 25,
    height: 25,
    borderRadius: 5,
    marginRight: 15,
  },
  selectedColorBox: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  dropdown: {
    flex: 1,
    height: 50, // Fixed height
  },
  placeholderStyle: {
    fontSize: fontSizes.xSmall,
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
    height: 40,
    fontSize: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowContainerBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonDismissText: {
    textAlign: 'center',
    color: colors.black,
    fontSize: fontSizes.xSmall,
    fontFamily: fonts.regular,
  },
  number: {
    fontSize: fontSizes.large,
    textAlign: 'center',
    fontFamily: fonts.medium,
    marginTop: 20,
    color: colors.black,
    alignSelf: 'center',
  },
  iconStyle: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
  },
  textInput: {
    fontFamily: fonts.regular,
    fontSize: 14,
    marginLeft: 10,
    height: 50,
    color: colors.black,
  },
});
