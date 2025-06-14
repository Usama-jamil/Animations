import React from 'react';
import {StyleSheet, SafeAreaView} from 'react-native';
import CustomHeader from '../../components/header/CustomHeader';
import {useTranslation} from 'react-i18next';
import {colors, fonts} from '../../utils/styles';
import FreeSamplePack from '../../components/campaigs-Details/FreeSamplePack';
import BuyOneGetOne from '../../components/campaigs-Details/BuyOneGetOne';
import HappyHour from '../../components/campaigs-Details/HappyHour';
import EarlyBirdDiscount from '../../components/campaigs-Details/EarlyBirdDiscount';

const CompaignService = ({navigation, route}) => {
  const {t} = useTranslation();
  const selectedCompaign = route?.params?.item;

  const renderCampaignType = () => {
    switch (selectedCompaign?.type) {
      case 'earlyBirdDiscount':
        return <EarlyBirdDiscount navigation={navigation} campaign={selectedCompaign} />;
      case 'happyHour':
        return <HappyHour navigation={navigation} campaign={selectedCompaign} />;
      case 'buyOneGetOne':
        return <BuyOneGetOne navigation={navigation} campaign={selectedCompaign} />;
      case 'samplePack':
        return <FreeSamplePack navigation={navigation} campaign={selectedCompaign} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.superContainer}>
      <CustomHeader title={selectedCompaign?.title} />
      {renderCampaignType()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  superContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

export default CompaignService;