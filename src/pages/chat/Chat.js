import React, {useState, useCallback, useEffect} from 'react';
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  Image,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';

// Components
import ChatCard from '../../components/chat/ChatCard';

// Third Party
import {useTranslation} from 'react-i18next';

// Assets
import BellIcon from '../../../assets/icons/header/bell.svg';

// Third Party
import {colors, fontSizes, fonts} from '../../utils/styles';
import {setNewNotification} from '../../store/slices/user';
import {useDispatch, useSelector} from 'react-redux';
import {API_ENDPOINTS, getRequest} from '../../utils/apiService';
import {useFocusEffect} from '@react-navigation/native';
import GeneralModal from '../../components/modal/GeneralModal';
import NoDataIcon from '../../../assets/icons/no_data.svg';
import {ActivityIndicator} from 'react-native';
import {Badge} from '@rneui/base';
import GuestModal from '../../components/guest-modal/GuestModal';

const conversation_Per_Page = 10;

const Chat = ({navigation}) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const {newNotification, chatUnReadCount, unreadCount} = useSelector(
    state => state.auth,
  );
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [conversationPage, setConversationPage] = useState(1);
  const [conversationTotalPages, setConversationTotalPages] = useState(1);
  const [conversations, setConversations] = useState([]);
    const [guestPopUp, setGuestPopUp] = useState(false);
    const {user} = useSelector(state => state.auth);

  useFocusEffect(
    useCallback(() => {
      setConversationPage(1);
      setConversationTotalPages(1);
      fetchInitialConversations();
      return () => {
        setIsLoading(true);
      };
    }, [chatUnReadCount]),
  );

  const fetchInitialConversations = async (currentPage = 1) => {
    setIsLoading(true);
    const endpoint = `${API_ENDPOINTS.conversation.getAll}?pageno=${currentPage}&limit=${conversation_Per_Page}`;
    const result = await getRequest(endpoint);
    console.log('result', result);
    setIsLoading(false);
    if (result.success) {
      setConversations(result?.data);
      setConversationTotalPages(result?.data?.total_pages);
    } else {
      setErr(true);
      setErrMsg(result.error);
    }
  };

  const onRefresh = useCallback(() => {
    setConversationPage(1);
    setConversationTotalPages(1);
    fetchInitialConversations(1);
  }, []);

  // Load More Bookings API call
  const handleLoadMoreConversations = async () => {
    if (conversationPage < conversationTotalPages) {
      const nextPage = conversationPage + 1;
      setConversationPage(nextPage);
      const endpoint = `${API_ENDPOINTS.conversation.getAll}?pageno=${nextPage}&limit=${conversation_Per_Page}`;

      const result = await getRequest(endpoint);
      console.log('result', result);
      setIsLoading(false);
      if (result.success) {
        setConversations(prevConversations => [
          ...prevConversations,
          ...result?.data,
        ]);
      } else {
        setErr(true);
        setErrMsg(result.error);
      }
    }
  };

  const renderChatItem = ({item}) => (
    <ChatCard navigation={navigation} item={item} />
  );

  return (
    <SafeAreaView style={styles.superContainer}>
      {err && (
        <GeneralModal
          modalError={true}
          description={errMsg}
          Set_Modal_Visibilty={setErr}
        />
      )}
      {guestPopUp && (
        <GuestModal showPopUp={guestPopUp} setShowPopUp={setGuestPopUp} />
      )}

      <View style={styles.headerContainer}>
        <Text allowFontScaling={false} style={styles.headingText}>
          {t('chats')}
        </Text>
        <TouchableOpacity
          onPress={() =>
            !user?.isGuest
              ? navigation.navigate('Notifications')
              : setGuestPopUp(true)
          }
          style={{position: 'relative'}}>
          <BellIcon width={24} height={24} />

          {unreadCount > 0 && (
            <Badge
              value={unreadCount} // Display unread count
              status="error" // Red badge color
              containerStyle={styles.badgeContainer}
            />
          )}
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View
          style={{
            justifyContent: 'flex-start',
            alignItems: 'center',
            flex: 1,
            marginTop: 20,
          }}>
          <ActivityIndicator size={'large'} color={colors.primary} />
        </View>
      ) : (
        <>
          {conversations?.length > 0 ? (
            <FlatList
              renderItem={renderChatItem}
              data={conversations}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              style={styles.chatsList}
              onEndReached={handleLoadMoreConversations}
              onEndReachedThreshold={0.5}
              refreshControl={
                <RefreshControl
                  refreshing={isLoading}
                  onRefresh={onRefresh}
                  size="large"
                  tintColor={colors.primary}
                />
              }
            />
          ) : (
            <View style={styles.noDataContainer}>
              <NoDataIcon width={300} height={250} />

              <Text allowFontScaling={false} style={styles.noDataText}>
                {t('noChats')}
              </Text>
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
};

export default Chat;

const styles = StyleSheet.create({
  superContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginTop: 20,
    marginBottom: 10,
    flexDirection: 'row',
  },
  headingText: {
    color: colors.black,
    fontFamily: fonts.bold,
    fontSize: fontSizes.large,
    lineHeight: 24,
  },
  notifOpacity: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifIcon: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
  },
  chatsList: {
    marginBottom: 90,
    marginHorizontal: 10,
    marginTop: 10,
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  noDataImg: {
    height: 150,
    width: 200,
    resizeMode: 'contain',
  },
  noDataText: {
    fontFamily: fonts.regular,
    color: colors.black,
    fontSize: 14,
    lineHeight: 24,
  },
  badgeStyle: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.red,
  },
  badgeContainer: {
    position: 'absolute',
    top: -5, // Adjust position
    right: -5, // Adjust position
  },
});
