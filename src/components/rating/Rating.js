import React from 'react';
import {View, TouchableOpacity, Image, StyleSheet} from 'react-native';
import Star from '../../../assets/icons/star-sharp.svg';
import StarFill from '../../../assets/icons/star-sharp-fill.svg';

const RatingStarsCard = ({rating, onRatingChange, read}) => {
  const handleRating = selectedRating => {
    onRatingChange(selectedRating);
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => handleRating(i)}
          disabled={read}>
          {i <= rating ? (
            <StarFill width={24} height={24} />
          ) : (
            <Star width={24} height={24} />
          )}
        </TouchableOpacity>,
      );
    }
    return stars;
  };

  return <View style={styles.container}>{renderStars()}</View>;
};

export default RatingStarsCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 5,
  },
  star: {
    width: 21,
    height: 21,
    margin: 5,
  },
});
