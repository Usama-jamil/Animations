import React, { useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView } from 'react-native';
import CustomHeader from '../../components/header/CustomHeader';
import { colors, fontSizes, fonts } from '../../utils/styles';

const AddTipScreen = () => {
  const [selectedTip, setSelectedTip] = useState(5); // Default selected tip
  const [customTip, setCustomTip] = useState('');


  const handleTipSelect = (amount) => {
    setSelectedTip(amount);
    setCustomTip(''); // Clear custom amount if a preset is selected
  };

  const handleCustomTipChange = (text) => {
    setCustomTip(text);
    setSelectedTip(null); // Clear preset selection if custom is set
  };



  return (
    <SafeAreaView style={styles.container}>

     






   


     


    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:colors.background,
  },
  
  tipContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  tipButton: {
    flex: 1,
    paddingVertical: 5,
    marginHorizontal: 5,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedTipButton: {
    backgroundColor: colors.primary,

  },
  tipButtonText: {
    fontSize: fontSizes.large,
    color: colors.black,
    fontFamily:fonts.bold,

  },
  selectedTipButtonText: {
    fontSize: fontSizes.xlarge,
    color: colors.black,
    fontFamily:fonts.bold,
    color:colors.background
  },
  customAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DADADA',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 30,
  },
  customAmountInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    marginLeft: 10,
    height: 50,
    color: colors.black,
  },
  aedLabel: {
    fontSize: 16,
    color: colors.black,
    marginLeft: 5,
    fontFamily:fonts.semiBold
  },
 
  currency: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.black,
  },
});

export default AddTipScreen;
