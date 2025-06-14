import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const places = [
  { title: 'At Our Place', icon: require('../../../assets/icons/inPlace.png') },
  { title: 'At Your Place', icon: require('../../../assets/icons/homeService.png') },
];

const PlacesSection = () => {
  const [selectedPlace, setSelectedPlace] = useState('At Our Place');

  return (
    <View style={styles.container}>
      {places.map((place, index) => {
        const isSelected = selectedPlace === place.title;
        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.placeItem,
              isSelected ? styles.selectedPlaceItem : styles.unselectedPlaceItem
            ]}
            onPress={() => setSelectedPlace(place.title)}
            activeOpacity={0.8}
          >
            <Image source={place.icon} style={styles.placeIcon} />
            <Text style={[
              styles.placeText,
              isSelected ? styles.selectedText : styles.unselectedText
            ]}>
              {place.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  placeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 30,
  },
  selectedPlaceItem: {
    backgroundColor: '#7B4FFF',
  },
  unselectedPlaceItem: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  placeIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    resizeMode: 'contain',
  },
  placeText: {
    fontSize: 15,
    fontWeight: '600',
  },
  selectedText: {
    color: '#fff',
  },
  unselectedText: {
    color: '#555',
  },
});

export default PlacesSection;
