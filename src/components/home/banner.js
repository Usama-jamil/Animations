import React from 'react';
import { Image, StyleSheet, Dimensions, TouchableOpacity, Linking } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useSharedValue } from 'react-native-reanimated';
import Carousel from 'react-native-reanimated-carousel';

const SCREEN_WIDTH = Dimensions.get('window').width;

const Banner = ({ data }) => {
  const progress = useSharedValue(0);
  const carouselRef = React.useRef(null);

  const handleImagePress = (url) => {
    if (url) {
      Linking.openURL(url).catch((err) => console.error("Failed to open URL: ", err));
    }
  };

  console.log('Banner data:', data);

  return (
    <Carousel
      ref={carouselRef}
      loop={true}
      snapEnabled={true}
      pagingEnabled={true}
      autoPlay={data && data.length > 1} // Only autoplay if data has items
      width={SCREEN_WIDTH}
      height={135}
      data={data || []}
      onProgressChange={(_, absoluteProgress) => {
        progress.value = absoluteProgress;
      }}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => handleImagePress(item.link)} activeOpacity={0.8}>
          <FastImage
            source={{ uri: item.image }} // Dynamically load the image URL from the data
            style={styles.bannerImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
      )}
    />
  );
};

const styles = StyleSheet.create({
  bannerImage: {
    width: SCREEN_WIDTH,
    height: 135,
  },
});

export default Banner;
