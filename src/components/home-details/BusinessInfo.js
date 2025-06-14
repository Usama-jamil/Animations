import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
} from 'react-native';
import {colors, fonts, fontSizes} from '../../utils/styles';
import MapView, {Marker} from 'react-native-maps';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ReadMore from '@fawazahmed/react-native-read-more';
import moment from 'moment';
const BusinessInfo = ({businessdata}) => {
  const formatOpeningHours = dayData => {
    if (!dayData.isOpen) return 'Closed';
    const start = moment(dayData.startTime, 'HH:mm').format('h a'); // e.g., 11 am
    const end = moment(dayData.endTime, 'HH:mm').format('h a'); // e.g., 8 pm
    return `${start} - ${end}`;
  };

 const handleNavigateToMap = coordinates => {
    if (coordinates?.length === 2) {
      const [longitude, latitude] = coordinates;
      const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
      Linking.canOpenURL(mapUrl)
        .then(supported => {
          if (supported) {
            return Linking.openURL(mapUrl);
          } else {
            Alert.alert(
              'Error',
              'Google Maps is not installed or the URL is not supported.',
            );
          }
        })
        .catch(err => {
          console.error('An error occurred', err);
        });
    }
  };

  return (
      <ScrollView
        contentContainerStyle={styles.container}
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>About Us</Text>
        <ReadMore
          numberOfLines={3}
          style={styles.description}
          seeMoreStyle={[
            styles.description,
            {color: colors.primary, fontFamily: fonts.semiBold},
          ]}
          seeLessStyle={[
            styles.description,
            {color: colors.primary, fontFamily: fonts.semiBold},
          ]}>
          Welcome to Decadence Hair and Beauty Salon, where style meets
          sophistication. Our expert stylists and beauty professionals are
          committed to providing you with the ultimate pampering experience.
          Whether you’re looking for a fresh haircut, a bold new color, or a
          rejuvenating facial, we’ve got you covered.
        </ReadMore>

        {/* Features */}
        <Text style={styles.sectionTitle}>Features</Text>
        <View style={styles.featuresContainer}>
          {businessdata?.categories?.map((feature, index) => (
            <View style={styles.featureItem} key={index}>
              <View style={styles.dot} />
              <Text style={styles.featureText}>{feature?.name}</Text>
            </View>
          ))}
        </View>

        {/* Opening Hours */}
        <Text style={styles.sectionTitle}>Opening Hours</Text>
        {businessdata?.openingHours?.map(dayData => (
          <View style={styles.timeRow} key={dayData._id}>
            <Text style={styles.dayText}>{dayData.day}</Text>
            <Text
              style={[
                styles.timeText,
                !dayData.isOpen && {color: colors.warning},
              ]}>
              {formatOpeningHours(dayData)}
            </Text>
          </View>
        ))}
        {/* Address */}
        <View
          style={[
            styles.addressRow,
            {
              justifyContent: 'space-between',
              marginVertical: 8,
              paddingBottom: 5,
              borderBottomWidth: 1,
              borderBottomColor: '#0000000d',
            },
          ]}>
          <Text style={styles.sectionTitle}>Address</Text>
          <TouchableOpacity onPress={() => handleNavigateToMap(businessdata?.address?.location?.coordinates)}>
            <Text style={styles.mapLinkText}>View on Map</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={[styles.addressRow, {marginBottom: 15}]} onPress={() => handleNavigateToMap(businessdata?.address?.location?.coordinates)}>
          <View style={styles.icon_background}>
            <MaterialIcons
              name="location-on"
              size={24}
              color={colors.primary}
            />
          </View>
          <Text style={styles.addressText}>{businessdata?.address?.line1}</Text>
        </TouchableOpacity>

        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: businessdata?.address?.location?.coordinates[1],
              longitude: businessdata?.address?.location?.coordinates[0],
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            provider="google"
            pointerEvents="none"
            >
            <Marker
              coordinate={{
                latitude: businessdata?.address?.location?.coordinates[1],
                longitude: businessdata?.address?.location?.coordinates[0],
              }}
              title={businessdata?.address?.country}
              description={businessdata?.address?.line1}
            />
          </MapView>
        </View>
      </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    backgroundColor: colors.background,
    paddingBottom:80
  },
  sectionTitle: {
    fontSize: fontSizes.xSmall,
    fontFamily: fonts.semiBold,
    marginBottom: 5,
    color: colors.black,
  },
  description: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.lightBlack,
    lineHeight: 22,
    marginBottom: 10,
  },
  showMore: {
    color: colors.primary,
    fontFamily: fonts.medium,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: 6,
  },
  featureText: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.small,
    color: colors.black,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  dayText: {
    fontFamily: fonts.medium,
    color: colors.black,
    fontSize: fontSizes.small,
  },
  timeText: {
    fontFamily: fonts.medium,
    color: colors.black,
    fontSize: fontSizes.small,
  },

  mapLinkText: {
    fontFamily: fonts.medium,
    color: colors.primary,
    fontSize: fontSizes.small,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressText: {
    fontFamily: fonts.regular,
    color: colors.black,
    marginLeft: 6,
    fontSize: fontSizes.small,
  },
  mapContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    height: 180,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  icon_background: {
    width: 46,
    height: 46,
    backgroundColor: colors.whiteGray,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
  },
});

export default BusinessInfo;
