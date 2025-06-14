import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import {colors, commonStyles, fonts} from '../../utils/styles';
import {useTranslation} from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
const discoverItems = [
  {
    title: 'Rental',
    icon: require('../../../assets/icons/rental.png'),
    navigateTitle:"ListingList"
  },
  {
    title: 'Bundles',
    icon: require('../../../assets/icons/bundle.png'),
    navigateTitle:"BundleList"
  },
];

const DiscoverSection = () => {
  const {t} = useTranslation();
  const navigation = useNavigation()
  return (
    <View style={styles.container}>
      <Text allowFontScaling={false} style={commonStyles.heading}>
        {t('discover')}
      </Text>
      <FlatList
        data={discoverItems}
        numColumns={2}
        keyExtractor={(item, index) => index.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={{gap: 10}}
        renderItem={({item}) => (
          <TouchableOpacity style={styles.itemContainer} activeOpacity={0.8} onPress={()=> navigation.navigate(item.navigateTitle)}>
            <View style={styles.iconWrapper}>
              <Image source={item.icon} style={styles.iconImage} />
            </View>
            <Text style={styles.itemTitle}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },

  itemContainer: {
    backgroundColor: colors.whiteGray, // light purple background
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginTop: 10,
    gap: 15,
  },
  iconWrapper: {
    width: 50,
    height: 50,
    backgroundColor: colors.primary, // purple background
    borderRadius: 50 / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconImage: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  itemTitle: {
    fontSize: 16,
    color: colors.lightBlack,
    fontWeight: '500',
  },
  title: {
    fontSize: 13,
    marginBottom: 5,
    fontFamily: fonts.regular,
    color: colors.black,
  },
  rowContainerBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});


export default DiscoverSection;


