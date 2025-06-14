import {FlatList, Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {colors, fonts} from '../../utils/styles';
import photo from '../../../assets/images/drill.png';
import FastImage from 'react-native-fast-image';

const PhotosList = ({data, pickup, note, msg,handlePress}) => {
  console.log('data', data);
  const renderItem = ({item,index}) => (
     <TouchableOpacity
      onPress={() => handlePress(data, index)} style={{marginVertical: 10}}>
      <FastImage
        source={{uri: item}}
        style={{width: 70, height: 60,borderRadius:5, marginRight: 5}}
      />
    </TouchableOpacity>
  );
  return (
    <>
      <Text style={styles.pick}>{pickup}</Text>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}

      />
      <Text style={[styles.pick, {color: colors.black}]}>{note}</Text>
      <Text
        style={[styles.pick, {color: colors.black, fontFamily: fonts.regular}]}>
        {msg}
      </Text>
    </>
  );
};

export default PhotosList;

const styles = StyleSheet.create({
  pick: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.black,
  },
});
