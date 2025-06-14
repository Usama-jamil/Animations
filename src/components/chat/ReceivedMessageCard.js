import React, { useState } from 'react';
import { StyleSheet, Image, Text, View } from 'react-native';

// Styles
import { colors, fontSizes, fonts } from '../../utils/styles';
import FastImage from 'react-native-fast-image';
import moment from 'moment';
import UserAvatar from 'react-native-user-avatar';
import { LinkPreview } from '@flyerhq/react-native-link-preview';

const ReceivedMessageCard = ({ item, userImg }) => {
 
  const [error, setError] = useState(false);

   const messageTime = moment(item?.timestamp);
   const now = moment();
   const diffHours = now.diff(messageTime, 'hours');
   const diffDays = now.diff(messageTime, 'days');
   const diffWeeks = now.diff(messageTime, 'weeks');
   const diffMonths = now.diff(messageTime, 'months');
   const diffYears = now.diff(messageTime, 'years');
   
   // Format time based on difference
   const formattedTime =
     diffHours < 24
       ? messageTime.format('h:mm A') // ✅ Show time if today
       : diffDays === 1
       ? 'Yesterday'
       : diffDays < 7
       ? `${diffDays} days ago`
       : diffWeeks < 4
       ? `${diffWeeks} weeks ago`
       : diffMonths < 12
       ? `${diffMonths} months ago`
       : `${diffYears} years ago`;
   

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const containsUrl = urlRegex.test(item?.message);

  return (
    <View style={styles.parentContainer}>
      {(!error && userImg !== 'https://timezzi-bucket.s3.amazonaws.com/noImg.png') ?
        <FastImage
          source={{ uri: userImg }}
          style={styles.userImg}
          resizeMode="cover"
          onError={() => setError(true)}

        />:
        <UserAvatar
          style={styles.userImg}
          name={item?.name
            ?.split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .join('') || ''}
          bgColors={[colors.primary]}
        />
      }
      <View style={styles.messageContainer} key={item?.id}>
        {containsUrl ? (
          <LinkPreview
            text={item?.message}
            enableAnimation={true}
          />
        ) : <Text style={styles.msgText}>
          {item?.message?.trim()}
        </Text>}
        <Text allowFontScaling={false} style={styles.timeText}>
          {formattedTime}
        </Text>
      </View>
    </View>
  );
};

export default ReceivedMessageCard;

const styles = StyleSheet.create({
  parentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    marginBottom: 15,
  },
  userImg: {
    width: 25,
    height: 25,
    borderRadius: 100,
    marginRight: 5,
    alignSelf: "flex-end"

  },
  messageContainer: {
    backgroundColor: colors.msgGreyBg,
    padding: 10,
    marginLeft: 5,
    alignSelf: 'flex-start',
    borderRadius: 20,
    minWidth: '50%',
    maxWidth: '75%',
  },
  msgText: {
    fontSize: 16,
    lineHeight: 20,
    color: colors.black,
    fontFamily: fonts.regular,
  },
  timeText: {
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 17,
    color: colors.lightGrey,
  },
  leftArrow: {
    position: 'absolute',
    backgroundColor: colors.purple,
    width: 20,
    height: 20,
    bottom: 0,
    borderBottomRightRadius: 25,
    left: -12,
  },
  leftArrowOverlap: {
    position: 'absolute',
    backgroundColor: colors.background,
    width: 20,
    height: 35,
    bottom: -6,
    borderBottomRightRadius: 18,
    left: -20,
  },
  timeText: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.mSmall,
    color: colors.black,
    textAlign: 'right',
  },
});
