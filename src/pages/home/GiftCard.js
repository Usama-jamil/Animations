import {ScrollView, StyleSheet, SafeAreaView} from 'react-native';
import React, {useState} from 'react';
import CustomHeader from '../../components/header/CustomHeader';
import GiftCardsComponent from '../../components/Gift/GiftCards';
import {colors} from '../../utils/styles';
import {useTranslation} from 'react-i18next';

const GiftCards = ({navigation, route}) => {
  const {t} = useTranslation();
  const branchid = route?.params?.branchid;
  const selectedGiftCards = route?.params?.selectedGiftCards;

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader title={t('giftCards')} />

      <GiftCardsComponent
        branchid={branchid}
        selectedGiftCards={selectedGiftCards}
      />
    </SafeAreaView>
  );
};

export default GiftCards;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
