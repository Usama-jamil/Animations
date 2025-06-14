import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity, Image} from 'react-native';
import {colors, fontSizes, fonts} from '../../utils/styles';

// Stylesheet

const FaqCard = ({item, index}) => {
  return (
    <View style={styles.container} key={index}>
      <View style={styles.queAndAnsTxtsContainer}>
        <Text allowFontScaling={false} style={styles.questionText}>
          {item.title}
        </Text>
        <Text allowFontScaling={false} style={styles.answerText}>
          {item.message}
        </Text>
      </View>
    </View>
  );
};

export default FaqCard;

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 10,
  },
  queAndAnsTxtsContainer: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  questionText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fonts.bold,
    color: colors.black,
  },
  answerText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.black,
    marginTop: 10,
  },
  showHideOpacitiesContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: '100%',
  },
  iconStyle: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
  },
});
