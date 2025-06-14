import React, {useState} from 'react';
import {StyleSheet, Image, Text, TouchableOpacity, View} from 'react-native';
import {colors, fontSizes, fonts} from '../../utils/styles';
import FastImage from 'react-native-fast-image';
import UserAvatar from 'react-native-user-avatar';
import {Badge} from '@rneui/base';
const ChatCard = ({navigation, item}) => {
  const [error, setError] = useState(false);
  console.log('item', item);
  return (
    <>
      <TouchableOpacity
        style={styles.container}
        key={item.id}
        onPress={() =>
          navigation.navigate('ChatDetail', {
            id: item?._id,
            userName: item?.name,
            userImg: item?.image,
          })
        }>
        <View style={styles.userDetailContainer}>
          {!error &&
          item?.image !==
            'https://timezzi-bucket.s3.amazonaws.com/noImg.png' ? (
            <FastImage
              source={{uri: item?.image}}
              style={styles.userImg}
              resizeMode="cover"
              onError={() => setError(true)}
            />
          ) : (
            <View style={{marginRight: 15}}>
              <UserAvatar
                size={50}
                name={
                  item?.name
                    ?.split(' ')
                    .map(word => word.charAt(0).toUpperCase())
                    .join('') || ''
                }
                bgColors={[colors.primary]}
              />
            </View>
          )}
          <View style={{flex: 1}}>
            <View style={styles.row}>
              <Text allowFontScaling={false} style={styles.userNameText}>
                {item?.name}
              </Text>
              {item?.unread_count > 0 && (
                <Badge
                  value={item?.unread_count} // Display unread count
                  status="primary"
                  badgeStyle={styles.badge}
                  textStyle={styles.badgeText}
                  containerStyle={styles.badgeContainer}
                />
              )}
            </View>

            <Text
              allowFontScaling={false}
              style={[
                styles.messageText,
                {marginRight: 20, color: !item?.is_read && colors.primary},
              ]}
              numberOfLines={1}>
              {item?.message}
            </Text>
        <Text allowFontScaling={false} style={styles.lastMsgTimeText}>{item?.timesince}</Text>

          </View>
        </View>
      </TouchableOpacity>
    </>
  );
};

export default ChatCard;

export const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: colors.grey,
  },
  userDetailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  userImg: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 7,
  },
  userNameText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 24,
    color: colors.black,
  },
  messageText: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.small,
    color: colors.darkGrey,
  },
  badgeContainer: {
    alignSelf: 'flex-end',
    borderRadius: 50,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 5,
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 24 / 2,
    backgroundColor: colors.primary,
  },
  badgeText: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.mSmall,
    color: colors.background,
  },
  lastMsgTimeText:{
    fontFamily: fonts.regular,
    fontSize: fontSizes.small,
    color: colors.lightBlack,
    alignSelf:"flex-end"
  }
});
