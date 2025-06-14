import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Dimensions,
} from 'react-native';
import React from 'react';

import { TouchableOpacity } from 'react-native';
import { fontSizes, fonts } from '../../utils/styles';
import { useTranslation } from 'react-i18next';
import { colors } from '../../utils/styles';
import HeartIon from '../../../assets/icons/more/heart.svg';
import Star from '../../../assets/icons/light_star.svg';
import FastImage from 'react-native-fast-image';
import { API_ENDPOINTS, putRequest } from '../../utils/apiService';

const screenWidth = Dimensions.get('window').width;
const isSmallScreen = screenWidth < 400;

const FavoritesCard = ({ data, setdata, setloading }) => {
  const { t } = useTranslation();
  const Like = async (item, index) => {
    try {
      setloading(true);
      const result = await putRequest(
        `${API_ENDPOINTS.business.like}${item._id}/likes`,
      );
      setloading(false);

      if (result.success) {
        // Remove the unliked item from the array
        setdata((prevData) => prevData.filter((_, i) => i !== index));
      } else {
        console.error('Error unliking the item:', result.error);
      }
    } catch (error) {
      setloading(false);
      console.error('Error in like function:', error);
    }
  };

  const renderItem = ({ item, index }) => {
    return (
      <View
        style={[
          styles.service_card_container,
          {
            backgroundColor: colors.whiteGray,
          },
        ]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ position: 'relative' }}>
            <FastImage source={{ uri: item?.image }} style={styles.profile} />
          </View>

          <View style={{ flex: 1 }}>
            <View style={styles.rowContainer}>
              <Text allowFontScaling={false} style={styles.title}>
                {item?.name}
              </Text>

              <TouchableOpacity
                style={[
                  styles.icon_background,
                  {
                    backgroundColor: colors.primary,
                  },
                ]}
                onPress={() => Like(item, index)} // Bind Like function
              >
                <HeartIon height={16} width={16} />
              </TouchableOpacity>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 1,
                marginTop: 5,
              }}>
              <Star width={24} height={24} />

              <Text
                allowFontScaling={false}
                style={[styles.subtitle, { marginTop: 3 }]}>
                {item?.averageRating?.toFixed(1) || 0}
              </Text>
            </View>
            <Text allowFontScaling={false} style={styles.categorey}>
              {item?.categories?.map((category) => category.name).join(', ')}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.superContainer}>
      {data?.length > 0 ? (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ marginTop: 15 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <Text allowFontScaling={false} style={styles.noDataText}>
          {t('noDataFound')}
        </Text>
      )}
    </View>
  );
};

export default FavoritesCard;


const styles = StyleSheet.create({
  service_card_container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
    marginHorizontal: 10,
    borderRadius: 12,
  },

  title: {
    fontSize: fontSizes.small,
    fontFamily: fonts.semiBold,
    color: colors.black,
    flexShrink: 1, // Allow text to shrink when space is constrained
  },

  subtitle: {
    fontSize: fontSizes.xSmall,
    fontFamily: fonts.medium,
    color: colors.black,
  },

  profile: {
    width: isSmallScreen ? 90 : 105,
    height: isSmallScreen ? 90 : 102,
    borderRadius: 10,
    flex: 1,
  },
  card_inner_row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  service: {
    fontSize: 20,
    color: colors.black,
    fontFamily: fonts.semiBold,
    marginTop: 10,
    marginHorizontal: 10,
  },
  icon2: {
    width: 14,
    height: 14,
    resizeMode: 'contain',
  },
  icon_background: {
    width: isSmallScreen ? 24 : 26,
    height: isSmallScreen ? 24 : 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 26 / 2,
  },

  categorey: {
    fontSize: fontSizes.small,
    fontFamily: fonts.medium,
    color: colors.primary,
    marginTop: 5,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: fontSizes.xSmall,
    color: colors.black,
    fontFamily: fonts.medium,
    textAlign: 'center',
    marginTop: 20,
  },
});
