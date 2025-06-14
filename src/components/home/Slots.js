import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, FlatList} from 'react-native';
import {colors, fonts} from '../../utils/styles';
import {s, vs} from 'react-native-size-matters';
const Slots = ({data, selectedDate, setSelectedDate}) => {
  return (
    <FlatList
      data={data}
      keyExtractor={(_, index) => index.toString()}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.flatListContent}
      renderItem={({item, index}) => {
        const isSelected = selectedDate?.date === item?.date;

        return (
          <TouchableOpacity
            style={[
              styles.dayContainer,
              isSelected && styles.selectedDayContainer,
            ]}
            onPress={() => setSelectedDate(item)}
            activeOpacity={0.8}>
            <Text
              style={[styles.dayText, isSelected && styles.selectedDayText]}>
              {item.day}
            </Text>
            <Text
              style={[styles.dateText, isSelected && styles.selectedDayText]}>
              {item.date}
            </Text>

            {isSelected && <View style={styles.dot} />}
          </TouchableOpacity>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  flatListContent: {
    margin: 10,
    gap: 15,
  },
  dayContainer: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0EAFF',
    justifyContent: 'center',
    alignItems: 'center',
    width: s(36),
    height: vs(60),
  },
  selectedDayContainer: {
    backgroundColor: colors.primary,
    borderColor: 'transparent',
  },
  dayText: {
    fontSize: 12,
    color: '#000',
    fontFamily: fonts.regular,
  },
  dateText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: '#000',
    marginTop: 5,
  },
  selectedDayText: {
    color: '#fff',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    marginTop: 8,
  },
});

export default Slots;
