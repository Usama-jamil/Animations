import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import {colors, fontSizes, fonts} from '../../utils/styles';
import RenderHtml from 'react-native-render-html';

// Stylesheet

const AboutUsCard = ({item}) => {
  const source = {
    html: item,
  };
  const {width} = useWindowDimensions();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        <RenderHtml contentWidth={width} source={source} />
      </ScrollView>
    </View>
  );
};

export default AboutUsCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 10,
  },
  aboutUsContainer: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headingText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fonts.bold,
    color: colors.black,
  },
  descriptionText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.black,
    marginTop: 10,
  },
});
