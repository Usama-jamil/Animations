import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import { colors, fontSizes, fonts } from '../../utils/styles';
import moment from 'moment-timezone';

const formatDate = date => {
  const day = moment(date).format('ddd');
  const dateNumber = moment(date).format('D');
  const month = moment(date).format('MMMM');
  const year = moment(date).format('YYYY');

  return {
    date: dateNumber,
    day: day,
    month: month,
    year: year,
  };
};

const CalenderCard = ({ data, selected, setSelected }) => {
  const flatListRef = useRef(null);
  console.log('selected',selected)

  const handleSelect = item => {
    if (item.isOpen) {
      setSelected(item);
    }
  };

  const formattedData = data.map(item => {
    const formattedISODate = moment(item.date)
      .local()
      .add(1, 'days')
      .toISOString();

    return {
      ...item,
      ...formatDate(moment(item.date).local()),
      originalDate: formattedISODate,
    };
  });

  const initialIndex = formattedData.findIndex(item => item.isOpen);

  useEffect(() => {
    if (initialIndex !== -1) {
      setSelected(formattedData[initialIndex]);

      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({ index: initialIndex, animated: true });
      }
    }
  }, [initialIndex]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.card,
        selected?.date === item.date
          ? styles.selectedCard
          : styles.unselectedCard,
        !item.isOpen && styles.closedCard,
      ]}
      onPress={() => handleSelect(item)}
      disabled={!item.isOpen}
    >
      <Text
        allowFontScaling={false}
        style={[
          styles.dayText,
          {
            color: selected?.date === item.date ? colors.background : colors.lightBlack,
          },
        ]}
      >
        {item.day}
      </Text>
      <View style={styles.dateMonthContainer}>
        <Text
          allowFontScaling={false}
          style={[
            styles.dateText,
            {
              color: selected?.date === item.date ? colors.background : colors.black,
            },
          ]}
        >
          {item.date}
        </Text>
        <Text
          allowFontScaling={false}
          style={[
            styles.monthText,
            {
              color: selected?.date === item.date ? colors.background : colors.black,
            },
          ]}
        >
          {item.month}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      ref={flatListRef}
      data={formattedData}
      renderItem={renderItem}
      keyExtractor={item => item.date.toString()}
      horizontal
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
      initialScrollIndex={initialIndex}
      getItemLayout={(data, index) => ({
        length: 80, // Width of each item, adjust as needed
        offset: 80 * index, // Calculate the offset for each item
        index,
      })}
      onScrollToIndexFailed={(info) => {
        flatListRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: true });
        setTimeout(() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToIndex({ index: info.index, animated: true });
          }
        }, 100);
      }}
    />
  );
};

export default CalenderCard;

const styles = StyleSheet.create({
  listContainer: {
    marginBottom: 20,
  },
  card: {
    paddingHorizontal: 17,
    paddingVertical: 4,
    marginHorizontal: 5,
    borderRadius: 33,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCard: {
    backgroundColor: colors.primary,
  },
  unselectedCard: {
    borderWidth: 1,
    borderColor: colors.borderGrey,
  },
  closedCard: {
    borderWidth: 1,
    borderColor: colors.closedTime, // Use your yellow color here
  },
  dateMonthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  dateText: {
    color: colors.black,
    fontSize: fontSizes.xSmall,
    fontFamily: fonts.medium,
  },
  monthText: {
    color: colors.black,
    fontSize: fontSizes.xSmall,
    fontFamily: fonts.medium,
  },
  dayText: {
    color: colors.borderGrey,
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    marginTop: 5,
  },
});
