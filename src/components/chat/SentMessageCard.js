import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { colors, fontSizes, fonts } from '../../utils/styles';
import UserAvatar from 'react-native-user-avatar';
import { LinkPreview } from '@flyerhq/react-native-link-preview';

const SentMessageCard = ({ item }) => {
  const { user } = useSelector(state => state.auth);
  const [error, setError] = useState(false);

  // Format the time based on the difference
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
      <View style={styles.messageContainer} key={item?.id}>
        {containsUrl ? (
          <LinkPreview
            text={item?.message}
            enableAnimation={true}
          />
        ) : 
        <Text style={styles.msgText}>
          {item?.message?.trim()}

        </Text>}

        <View style={styles.timeAndStatus}>
          <Text allowFontScaling={false} style={styles.timeText}>
            {formattedTime}
          </Text>
          <FastImage
            source={item?.is_read ? require('../../../assets/icons/double-check.png') : require('../../../assets/icons/single-check.png')}
            style={styles.checkIcon}
            resizeMode="contain"
          />
        </View>
      </View>

      {(!error && user?.image !== 'https://timezzi-bucket.s3.amazonaws.com/noImg.png') ?
        <FastImage
          source={{ uri: user?.image }}
          style={styles.userImg}
          resizeMode="cover"
          onError={() => setError(true)}

        />

        :
        <UserAvatar
          name={user?.name
            ?.split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .join('') || ''}
          bgColors={[colors.primary]}
        />

      }
    </View>
  );
};

export default SentMessageCard;

const styles = StyleSheet.create({
  parentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    alignSelf: 'flex-end',
    marginBottom: 15,
  },
  userImg: {
    width: 25,
    height: 25,
    borderRadius: 100,
    marginLeft: 5,
    alignSelf: "flex-end"
  },
  messageContainer: {
    backgroundColor: colors.primary,
    padding: 10,
    marginRight: 5,
    borderRadius: 10,
    minWidth: '50%',
    maxWidth: '75%',
  },
  msgText: {
    fontSize: 16,
    lineHeight: 20,
    color: colors.background,
    fontFamily: fonts.regular,
  },
  timeAndStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  timeText: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.mSmall,
    color: colors.background,
    textAlign: 'right',
    flex: 1,
  },
  checkIcon: {
    width: 15,
    height: 15,
    marginLeft: 5,
  },
});
