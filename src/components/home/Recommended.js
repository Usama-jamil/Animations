import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';

// Styles import
import {colors, commonStyles, fontSizes, fonts} from '../../utils/styles';

// Assets
import StartSharpIcon from '../../../assets/icons/star-round.svg';
import {useNavigation} from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import {useTranslation} from 'react-i18next';
import Location from '../../../assets/icons/location-pin.svg';
import {useState} from 'react';
import ImagePreview from '../imagePreview/ImagePreview';

const Recommended = ({business}) => {
  const {width} = Dimensions.get('window');
  const navigation = useNavigation();
  const {t} = useTranslation();
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [images, setImages] = useState([]);
  const Item = ({item, index}) => {
    const itemWidth = width / 2.3;

    return (
      <TouchableOpacity
        style={[
          styles.itemContainer,
          {
            backgroundColor: colors.whiteGray,
            width: itemWidth,
          },
        ]}
        onPress={() => navigation.navigate('HomeDetails', {id: item?._id})}>
        <TouchableOpacity
          style={styles.imageContainer}
          onPress={() => {
            setImages([{uri: item?.image}]); // Set the selected image
            setIsPreviewVisible(true); // Open preview
          }}
          disabled={true}
          >
          <FastImage
            source={{uri: item?.image}}
            style={styles.image}
            resizeMode="cover"
          />
        </TouchableOpacity>
        <Text allowFontScaling={false} style={styles.title}>
          {item?.name}
        </Text>
        <View style={styles.rowContainerBetween}>
          <Text
            allowFontScaling={false}
            style={[commonStyles.linkSmallText, {flex: 1}]}>
            {item?.categories[0]?.name}
          </Text>

          <View style={styles.rowContainer}>
            <StartSharpIcon width={14} height={14} style={styles.starIcon} />
            <Text allowFontScaling={false} style={styles.raitingText}>
              {item?.averageRating?.toFixed(1)} ({item?.totalReviews})
            </Text>
          </View>
        </View>

        <Text
          allowFontScaling={false}
          style={[
            styles.title,
            {flex: 1, fontFamily: fonts.regular, marginTop: 5},
          ]}
          numberOfLines={2}>
          {item?.address?.line1}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={commonStyles.container}>
      <Text allowFontScaling={false} style={commonStyles.heading}>
        {t('recommended')}
      </Text>
      {business?.length > 0 ? (
        <FlatList
          data={business}
          horizontal
          renderItem={({item, index}) => <Item item={item} index={index} />}
          keyExtractor={item => item._id.toString()} // Ensure key is a string
          contentContainerStyle={{marginVertical: 10}}
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled
        />
      ) : (
        <Text allowFontScaling={false} style={styles.noDataText}>
          {t('noDataFound')}
        </Text>
      )}

      <ImagePreview
        images={images}
        isVisible={isPreviewVisible}
        onClose={() => setIsPreviewVisible(false)}
      />
    </View>
  );
};

export default Recommended;

const styles = StyleSheet.create({
  itemContainer: {
    padding: 10,
    borderRadius: 11,
    marginRight: 15,
  },
  imageContainer: {
    width: '100%',
    height: 100,
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 10,
    fontFamily: fonts.semiBold,
    marginBottom: 5,
    color: colors.black,
  },
  rowContainerBetween: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  raitingText: {
    fontSize: fontSizes.small,
    color: colors.black,
    fontFamily: fonts.regular,
    marginTop: 2,
  },
  noDataText: {
    fontSize: fontSizes.xSmall,
    color: colors.black,
    fontFamily: fonts.medium,
    textAlign: 'center',
    marginTop: 20,
  },
});
