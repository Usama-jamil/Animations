import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import React, { useState } from 'react';
import DeleteIcon from '../../../assets/icons/more/delete_Red.png';
import { colors, fontSizes, fonts } from '../../utils/styles';
import Close from '../../../assets/icons/booking/close_Circle.svg';
import GeneralModal from '../modal/GeneralModal';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { setErrorMessage, setLoading } from '../../store/slices/paymentmethod';
import { API_ENDPOINTS, deleteRequest } from '../../utils/apiService';
import Toast from 'react-native-toast-message';
import FastImage from 'react-native-fast-image';
import { banks } from '../../utils/bankBrands';

const CardManagementCard = ({ data, seterr, setData }) => {
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [showPopUp, setShowPopUp] = useState(false);
  const { t } = useTranslation();

  const dispatch = useDispatch();

  console.log('data',data?.id)

  const handleBtnPress = async id => {
    setShowPopUp(!showPopUp);
    setSelectedItemId(id);
  };

  const handleDelete = async () => {
    setShowPopUp(!showPopUp);

    const payload = {
      paymentMethodId: selectedItemId,
    };

    dispatch(setLoading(true));

    const result = await deleteRequest(
      API_ENDPOINTS.cardManagement.payment,
      payload,
    );
    dispatch(setLoading(false));

    if (result.success) {
      Toast.show({
        type: 'success',
        position: 'top',
        bottomOffset: 20,
        text1: t('success'),
        text2: t('deleteSuccessfully'),
        visibilityTime: 3000,
      });
      const updatedData = data.filter(item => item.id !== selectedItemId);
      setData(updatedData)
    } else {
      seterr(true);
      dispatch(setErrorMessage(result.error));
    }
  };

  const handleCancel = () => {
    setShowPopUp(false);
  };

  const Item = ({ item }) => {
    const bankdata = banks?.find(data => data.bankName === item?.card?.brand);
    console.log('bankdata', item?.id);
    return (
      <TouchableOpacity
        style={[styles.itemContainer]}
        onPress={() => {
          setSelectedItemId(item.id);
        }}>
        <View style={styles.rowContainer}>
          {bankdata?.bankIcon && (
            <FastImage
              source={{
                uri:
                  bankdata?.bankIcon ||
                  'https://w7.pngwing.com/pngs/667/172/png-transparent-logo-brand-visa-font-visa-blue-text-trademark-thumbnail.png',
              }}
              style={styles.image}
              resizeMode="cover"
            />
          )}
          <View style={styles.textContainer}>
            <Text allowFontScaling={false} style={styles.title}>
              {item?.card?.brand}
            </Text>
            <Text allowFontScaling={false} style={styles.number}>
              **** **** ****{item?.card?.last4}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => handleBtnPress(item.id)}>
          <Image source={DeleteIcon} style={styles.icon} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <>

      {data?.length > 0 ? (
        <FlatList
          data={data}
          renderItem={({ item }) => <Item item={item} />}
          keyExtractor={item => item._id}
          contentContainerStyle={{ marginVertical: 10 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <Text allowFontScaling={false} style={styles.noDataText}>
          {t('noDataFound')}
        </Text>
      )}

      {showPopUp && (
        <GeneralModal
          modalSuccess={showPopUp}
          Set_Modal_Visibilty={setShowPopUp}
          imageSource={<Close width={38} height={38} />}
          title={t('confirmation')}
          description={t('deleteYourCard')}
          yesBtnTitle={t('yes')}
          handleYesPress={handleDelete}
          noBtnTitle={t('no')}
          handleNoPress={handleCancel}
        />
      )}
    </>
  );
};

export default CardManagementCard;

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.background,
  },
  selectedItemContainer: {
    borderColor: colors.primary,
  },
  image: {
    width: 48,
    height: 48,
    resizeMode: 'cover',
    borderRadius: 24,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    marginLeft: 10,
  },
  title: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: colors.black,
  },
  number: {
    fontSize: 15,
    fontFamily: fonts.medium,
    color: colors.lightBlack,
  },
  icon: {
    width: 24,
    height: 24,
  },
  noDataText: {
    fontSize: fontSizes.xSmall,
    color: colors.black,
    fontFamily: fonts.medium,
    textAlign: 'center',
    marginTop: 20,
  },
});
