import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {colors, fonts} from '../../utils/styles';
import FastImage from 'react-native-fast-image';

const CategorySelector = ({data, selectedCategory, setSelectedCategory}) => {
  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
        renderItem={({item}) => {
          const isSelected = selectedCategory === item?._id;
          return (
            <TouchableOpacity
              style={styles.categoryContainer}
              activeOpacity={0.8}
              onPress={() => setSelectedCategory(item?._id)}>
              <FastImage
                source={{uri: item?.image}}
                style={[
                  styles.categoryImage,
                  isSelected && styles.selectedCategoryImage,
                ]}
              />
              <Text style={styles.categoryText}>{item?.name}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 10,
  },
  flatListContent: {
    alignItems: 'center',
    gap: 20,
  },
  categoryContainer: {
    alignItems: 'center',
  },
  categoryImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    resizeMode: 'contain',
  },
  selectedCategoryImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    resizeMode: 'contain',
    borderWidth: 3,
    borderColor: colors.primary,
  },
  categoryText: {
    marginTop: 10,
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.black,
    textAlign: 'center',
  },
});

export default CategorySelector;
