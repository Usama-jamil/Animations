import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ImageBackground,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {colors, fontSizes, fonts} from '../../utils/styles';
import bg_shadow from '../../../assets/images/image_bg_shadow.png';
import FastImage from 'react-native-fast-image';

const Images = ({data, selectedItems, setSelectedItems}) => {
  const route = useRoute();

  uniqueData = Array.from(new Set(data.map(item => item._id))).map(id =>
    data.find(item => item._id === id),
  );

  const toggleSelection = item => {
    if (selectedItems?.[0]?._id === item._id) {
      // If the item is already selected, deselect it
      setSelectedItems([]);
    } else {
      // Select the new item, deselect the previous one
      setSelectedItems([item]);
    }
  };

  const renderItem = ({item}) => {
    const isSelected = selectedItems?.[0]?._id === item._id;
    console.log('item', item);
    return (
      <TouchableOpacity
        onPress={() => route.name !== 'SelectTime' && toggleSelection(item)}
        style={styles.touchable}
        disable={route.name === 'SelectTime'}>
        <View style={[styles.imageContainer,isSelected && styles.selectedImageContainer]}>
          <FastImage
            source={{uri: item?.user?.image}}
            style={styles.image}
            resizeMode="cover"
          />
          <ImageBackground style={styles.usernameContainer} source={bg_shadow}>
            <Text allowFontScaling={false} style={styles.usernameText}>
              {item?.user?.name}
            </Text>
            <Text
              allowFontScaling={false}
              style={[styles.usernameText, {marginTop: 2, flex: 1}]}
              numberOfLines={2}>
              {item?.jobTitle}
            </Text>
          </ImageBackground>
       
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View>
      {uniqueData.length > 0 ? (
        <FlatList
          data={uniqueData}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={[
            styles.flatListContainer,
            {
              marginTop: route.name === 'SelectTime' && 10,
              marginBottom: route.name !== 'SelectTime' && 80,
            },
          ]}
          showsVerticalScrollIndicator={false}
          numColumns={route.name === 'SelectTime' ? 0 : 3}
          horizontal={route.name === 'SelectTime'}
        />
      ) : (
        <Text allowFontScaling={false} style={styles.noDataText}>
          No Data Found
        </Text>
      )}
    </View>
  );
};

export default Images;

const styles = StyleSheet.create({
  flatListContainer: {
    marginVertical: 10,
  },
  imageContainer: {
    width: (Dimensions.get('window').width - 40) / 3 - 10,
    height: (Dimensions.get('window').width - 40) / 3 - 10,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 12,
    marginRight: 10,
  },
  selectedImageContainer: {
   borderColor:colors.primary,
   borderWidth:4
  },
  image: {
    width: '100%',
    height: '100%',
  },
  usernameContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'contain',
    height: 53,
  },
  usernameText: {
    color: colors.background,
    fontSize: fontSizes.small,
    fontFamily: fonts.semiBold,
    marginTop: 10,
  },
  touchable: {
    // flex: 1,
  },
  noDataText: {
    fontSize: fontSizes.xSmall,
    color: colors.black,
    fontFamily: fonts.medium,
    textAlign: 'center',
    marginTop: 20,
  },
});