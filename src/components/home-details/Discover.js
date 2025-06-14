import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Share,
  Linking,
  Alert,
} from 'react-native';
import dynamicLinks from '@react-native-firebase/dynamic-links';

const Discover = ({businessdata, id}) => {
  const discoverItems = [
    {
      title: 'Instagram',
      icon: require('../../../assets/icons/instagram.png'),
      link: businessdata?.socialLinks?.instagram,
    },
    {
      title: 'Website',
      icon: require('../../../assets/icons/website.png'),
      link: businessdata?.socialLinks?.website,
    },
    {
      title: 'Facebook',
      icon: require('../../../assets/icons/facebook.png'),
      link: businessdata?.socialLinks?.facebook,
    },
    {
      title: 'Tiktok',
      icon: require('../../../assets/icons/tiktok.png'),
      link: businessdata?.socialLinks?.tiktok,
    },
    {
      title: 'Share',
      icon: require('../../../assets/icons/share.png'),
      // no direct link here, share uses dynamic link
    },
  ];

 const generateLink = async () => {
    try {
      const link = await dynamicLinks().buildShortLink(
        {
          link: `https://timezzicustomer34.page.link/?productId=${id}`,
          domainUriPrefix: 'https://timezzicustomer34.page.link',
          android: {
            packageName: 'com.timezzicustomer',
          },
          ios: {
            appStoreId: '6615079411',
            bundleId: 'com.timezzi',
          },
        },
        dynamicLinks.ShortLinkType.DEFAULT,
      );
      console.log('link:', link);
      return link;
    } catch (error) {
      console.log('Generating Link Error:', error);
    }
  };

  const shareBusiness = async () => {
    const getLink = await generateLink();
    try {
      Share.share({
        message: getLink,
      });
    } catch (error) {
      console.log('Sharing Error:', error);
    }
  };

const handlePress = async (item) => {
  if (item.title === 'Share') {
    await shareBusiness();
  } else if (item.link) {
    try {
      const supported = await Linking.canOpenURL(item.link);
      if (supported) {
        await Linking.openURL(item.link);
      } else {
        Alert.alert('Invalid Link', 'Cannot open this link.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open the link.');
    }
  } else {
    Alert.alert('No Link', 'No valid link available.');
  }
};
  return (
    <View style={styles.container}>
      <FlatList
        data={discoverItems}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.item}
            activeOpacity={0.8}
            onPress={() => handlePress(item)}
          >
            <View style={styles.iconWrapper}>
              <Image source={item.icon} style={styles.icon} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  contentContainer: {
    alignItems: 'center',
  },
  item: {
    alignItems: 'center',
    marginRight: 25,
  },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  icon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
});

export default Discover;
