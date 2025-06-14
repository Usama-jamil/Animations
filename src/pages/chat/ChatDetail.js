import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  Image,
  FlatList,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  AppState,
} from 'react-native';

// Import Components
import ReceivedMessageCard from '../../components/chat/ReceivedMessageCard';
import SentMessageCard from '../../components/chat/SentMessageCard';

// Third Party
import {useTranslation} from 'react-i18next';
import EmojiSelector from 'react-native-emoji-selector';

// Styles
import {colors, fonts} from '../../utils/styles';

// Assets
import ArrowLeftIcon from '../../../assets/icons/arrow_left.svg';
import SentIcon from '../../../assets/icons/sent.svg';
import SentIconDark from '../../../assets/icons/sent_dark.svg';
import EmojiIcon from '../../../assets/icons/emoji.svg';
import {useFocusEffect} from '@react-navigation/native';
import {getRequest} from '../../utils/apiService';
import {API_ENDPOINTS} from '../../utils/apiService';
import {useDispatch, useSelector} from 'react-redux';
import {connectSocket, disconnectSocket} from '../../utils/socket';
import moment from 'moment';
import FastImage from 'react-native-fast-image';
import UserAvatar from 'react-native-user-avatar';
import {getUnReadChatCount} from '../../utils/notificationService';

const ChatDetail = ({navigation, route}) => {
  const {t} = useTranslation();
  const conversationId = route?.params?.id;

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isEmojiSelectorVisible, setEmojiSelectorVisible] = useState(false);

  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const userName = route?.params?.userName;
  const userImg = route?.params?.userImg;
  const userId = route?.params?.userId;
  const {user} = useSelector(state => state.auth);
  const flatListRef = useRef(null);

  // API data

  const [socket, setSocket] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [error, setError] = useState(false);
  const [isonline, setIsOnline] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeSocket = async () => {
      await connectSocket(user, setSocket);
    };

    initializeSocket();
    return () => {
      disconnectSocket();
    };
  }, [user]);

  useEffect(() => {
    const handleAppStateChange = async nextAppState => {
      if (nextAppState === 'background') {
        console.log('App has gone to the background');
        disconnectSocket();
      }
    };

    // Listen for app state changes
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      subscription.remove(); // Clean up the listener
    };
  }, [user, socket]);

  useEffect(() => {
    if (socket && socket.connected) {
      let receiverId = userId ? userId : conversationId;

      socket.on('user_online', payload => {
        if (receiverId === payload?.userId) {
          setIsOnline(payload?.online);

          if (payload?.online) {
            setMessages(prevMessages =>
              prevMessages.map(message => ({
                ...message,
                is_read: true,
              })),
            );
          }
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('user_online');
      }
    };
  }, [socket]);

  useEffect(() => {
    if (socket && socket.connected) {
      socket.on('message', incomingMessage => {
        let receiverId = userId ? userId : conversationId;
        console.log('incoming message', incomingMessage, receiverId, user._id);
        const isMessageForActiveChat =
          (incomingMessage.sender_id === receiverId &&
            incomingMessage.to === user._id) ||
          (incomingMessage.sender_id === user._id &&
            incomingMessage.to === receiverId);

        if (isMessageForActiveChat) {
          const newMessage = {
            message: incomingMessage.payload,
            sender: incomingMessage.sender_id,
            timestamp: new Date().toISOString(),
            timesince: moment(new Date()).fromNow(),
            is_read: incomingMessage?.is_read,
          };

          setMessages(prevMessages =>
            prevMessages ? [newMessage, ...prevMessages] : [newMessage],
          );

          scrollToBottom();
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('message');
      }
    };
  }, [socket]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      scrollToBottom,
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      scrollToBottom,
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

const handleSendMessage = () => {
  const receiverId = userId ? userId : conversationId;

  if (receiverId && newMessage.trim() && socket && socket.connected) {
    try {
      const messagePayload = {
        to: receiverId,
        payload: newMessage.trim(),
        sender_id: user?._id,
      };
      console.log('Socket emit payload:', messagePayload); // Log the payload
      socket.emit('message', messagePayload);

      setNewMessage('');
      scrollToBottom(); // Scroll to bottom after sending the message
    } catch (error) {
      console.error('Error sending message:', error);
    }
  } else {
    console.error('Socket is not connected or message is empty');
  }
};
  const scrollToBottom = () => {
    if (flatListRef?.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef?.current?.scrollToOffset({animated: true, offset: 0}); // Scroll to the top of the FlatList which is the bottom of the chat
      }, 100);
    }
  };

  const handleLoadMore = async () => {
    if (page < totalPages) {
      const offsetY = scrollOffset;
      setIsLoadingMore(true);
      const nextPage = page + 1;
      setPage(nextPage);

      const result = await getRequest(
        `${API_ENDPOINTS.conversation.getSingle}/?client_id=${
          userId || conversationId
        }&pageno=${nextPage}`,
      );

      if (result.success) {
        setIsLoadingMore(false);
        setMessages(prevMessages => [...prevMessages, ...result?.data.data]);
        setTimeout(() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToOffset({
              offset: offsetY,
              animated: false,
            });
          }
        }, 100);
      } else {
        console.error('Error loading more messages:');
      }
    }
  };

  const handleScroll = event => {
    const offsetY = event?.nativeEvent?.contentOffset?.y;
    setScrollOffset(offsetY);
    if (offsetY < 10 && !isLoadingMore && !initialLoad) {
      handleLoadMore();
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
      getUnReadChatCount(dispatch);
    }, [conversationId, userId]),
  );

  const fetchData = async () => {
    if (conversationId || userId) {
      setInitialLoad(true);
      setIsLoading(true);
      const result = await getRequest(
        `${API_ENDPOINTS.conversation.getSingle}/?client_id=${
          userId || conversationId
        }&pageno=${1}`,
      );
      setIsLoading(false);
      console.log('result', result?.data?.data);
      if (result.success) {
        setInitialLoad(false);
        // Reverse the messages to display older messages at the top
        const reversedMessages = result.data.data.reverse();
        setMessages(reversedMessages);
        setTotalPages(result?.data?.total_pages);
        setIsOnline(result?.data?.isOnline);

        setTimeout(() => {
          scrollToBottom();
        }, 100);
      } else {
        setInitialLoad(false);
        setErr(true);
        setErrMsg(result.error || t('AnUnexpectedErrorOccurred'));
      }
    }
  };

  const renderMessageItem = ({item}) => {
    return item.sender === user?._id ? (
      <SentMessageCard item={item} />
    ) : (
      <ReceivedMessageCard item={item} userImg={userImg} />
    );
  };

  const toggleEmojiSelector = () => {
    if (isEmojiSelectorVisible) {
      Keyboard.dismiss();
      setEmojiSelectorVisible(false);
    } else {
      Keyboard.dismiss();
      setEmojiSelectorVisible(true);
    }
  };

  const addEmojiToMessage = emoji => {
    setNewMessage(prev => prev + emoji);
  };

  return (
    <SafeAreaView style={styles.superContainer}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backOpacity}
          onPress={() => navigation.goBack()}>
          <ArrowLeftIcon width={30} height={30} />
        </TouchableOpacity>

        {!error ? (
          <FastImage
            source={{uri: userImg}}
            style={styles.userImg}
            resizeMode="cover"
            onError={() => setError(true)}
          />
        ) : (
          <UserAvatar
            size={50}
            name={
              userName
                ?.split(' ')
                .map(word => word.charAt(0).toUpperCase())
                .join('') || ''
            }
            bgColors={[colors.primary]}
          />
        )}

        <View>
          <Text allowFontScaling={false} style={styles.nameText}>
            {userName}
          </Text>
          <Text style={styles.onlineText}>{isonline ? 'Online' :'Offline'}</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={{padding: 20, flex: 1}}>
          <ActivityIndicator animating size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          renderItem={renderMessageItem}
          data={messages}
          keyExtractor={item => item._id}
          showsVerticalScrollIndicator={false}
          style={styles.messagesList}
          inverted
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.6}
          ListFooterComponent={
            isLoadingMore ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : null
          }
        />
      )}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.messageInputContainer}>
          <TouchableOpacity
            onPress={toggleEmojiSelector}
            style={styles.sentOpacity}>
            <EmojiIcon width={25} height={25} />
          </TouchableOpacity>
          <TextInput
            allowFontScaling={false}
            style={styles.textInput}
            placeholder={t('typeYourMessage')}
            placeholderTextColor={colors.darkGrey}
            autoCapitalize="none"
            keyboardType="default"
            value={newMessage}
            onChangeText={text => {
              const capitalizedText = text.replace(
                /(?:^|\. *)([a-z])/g,
                match => match.toUpperCase(),
              );
              setNewMessage(capitalizedText);
            }}
            onFocus={() => setEmojiSelectorVisible(false)}
            multiline={true}
          />

          <TouchableOpacity
            style={styles.sentOpacity}
            onPress={handleSendMessage}
            disabled={!newMessage.trim()}>
            {newMessage?.length > 0 ? (
              <SentIcon width={25} height={25} />
            ) : (
              <SentIconDark width={25} height={25} />
            )}
          </TouchableOpacity>
        </View>
        {isEmojiSelectorVisible && (
          <View style={styles.emojiSelectorContainer}>
            <EmojiSelector
              onEmojiSelected={addEmojiToMessage}
              showSearchBar={false}
              columns={8}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatDetail;

const styles = StyleSheet.create({
  superContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginHorizontal: 10,
    marginTop: 20,
    marginBottom: 10,
    flexDirection: 'row',
    gap: 5,
  },
  nameText: {
    color: colors.black,
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  onlineText: {
    color: colors.black,
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  backOpacity: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  userImg: {
    width: 33,
    height: 33,
    borderRadius: 100,
    marginLeft: 30,
    marginRight: 10,
    resizeMode: 'cover',
  },
  messagesList: {
    marginBottom: 10,
    marginHorizontal: 10,
    marginTop: 10,
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    minHeight: 60,
    maxHeight: 300,
    backgroundColor: '#F7F7F7',
    paddingHorizontal: 10,
    gap: 5,
    marginBottom: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.borderGrey,
    marginHorizontal: 10,
  },

  textInput: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.black,
    flex: 1,
    textAlignVertical: 'center',
    marginBottom: 3,
    paddingBottom: 15,
  },
  sentOpacity: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 15 : 20,
  },
  emojiSelectorContainer: {
    height: 250,
  },
});
