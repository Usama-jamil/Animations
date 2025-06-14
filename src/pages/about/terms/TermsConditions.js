import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import React from 'react';

const TermsConditions = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text allowFontScaling={false}>Terms & Conditions</Text>
    </SafeAreaView>
  );
};

export default TermsConditions;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});
