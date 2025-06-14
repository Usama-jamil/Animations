import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity,Image } from 'react-native';
import ClockIcon from '../../../assets/icons/clock.svg';
import { colors, fontSizes, fonts } from '../../utils/styles';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import { SetTime } from '../../store/slices/cart';
import Circle_check from '../../../assets/icons/circle_check_fill.svg';



const WaitingTimeCard = ({ data, selectedTime, setSelectedTime }) => {
  const dispatch = useDispatch();

  const handleSelect = time => {
    console.log('called')
    setSelectedTime(time);
    dispatch(SetTime({ startTime: time.startTime, endTime: time.endTime }));
  };

  const renderItem = ({ item }) => {
    const formattedTime = moment(item.startTime).format('h:mm A');
    const isSelected = selectedTime?.startTime === item.startTime;

    return (
      <TouchableOpacity
        onPress={() => handleSelect(item)}
        style={styles.main_container}>
        <View style={[styles.timeContainer]}>
          <ClockIcon width={24} height={24} />
          <Text
            allowFontScaling={false}
            style={[
              styles.timeText,
              { color: isSelected ? colors.primary : colors.black },
            ]}>
            {formattedTime}
          </Text>
        </View>


        <View>
          {isSelected ? (
            <Circle_check
              size={20}
            />
          ) : (
            <Image source={require('../../../assets/icons/circle-check-empty.png')} style={{ width: 20, height: 20 }} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={item => item.startTime}
      contentContainerStyle={{ marginBottom: 70 }}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default WaitingTimeCard;

const styles = StyleSheet.create({
  main_container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGrey,
    marginTop: 15,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,


    borderRadius: 10,
  },
  selectedContainer: {
    borderColor: colors.primary,
    borderWidth: 1,
  },
  timeText: {
    fontSize: 13,
    fontFamily: fonts.regular,
  },
});
