import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { colors } from '../../utils/styles';

const ActivityIndicatorModalTransparent = ({ loaderIndicator }) => {
  return (
    <View style={styles.container}>
      {loaderIndicator === true ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        ''
      )}
    </View>
  );
};

export default ActivityIndicatorModalTransparent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    right: 0,
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 999,
  },
});
