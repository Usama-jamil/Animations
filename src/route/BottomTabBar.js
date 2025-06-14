import React, {useEffect} from 'react';
import {Image, Platform, View, Dimensions, StyleSheet} from 'react-native';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

// Import Components
import Home from '../pages/home/Home';
import Booking from '../pages/booking/Booking';
import Chat from '../pages/chat/Chat';
import More from '../pages/more/More';

// Import Images
import HomeIcon from '../../assets/icons/bottom_tab_bar/home.svg';
import HomeFillIcon from '../../assets/icons/bottom_tab_bar/home_active.svg';
import BookIcon from '../../assets/icons/bottom_tab_bar/booking.svg';
import BookingFillIcon from '../../assets/icons/bottom_tab_bar/booking_active.svg';
import ChatIcon from '../../assets/icons/bottom_tab_bar/chat.svg';
import ChatFillIcon from '../../assets/icons/bottom_tab_bar/chat_active.svg';
import MoreIcon from '../../assets/icons/bottom_tab_bar/more.svg';
import MoreFillIcon from '../../assets/icons/bottom_tab_bar/more_active.svg';

// Third Party
import {heightPercentageToDP as HP} from 'react-native-responsive-screen';
import {colors, fontSizes} from '../utils/styles';

const Tab = createBottomTabNavigator();

const screenHeight = Dimensions.get('window').height;
import {useSelector} from 'react-redux';
import {Badge} from '@rneui/base';

const BottomTabBar = () => {
  const {chatUnReadCount,user} = useSelector(state => state.auth);
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        keyboardHidesTabBar: true,
        activeTintColor: 'red',
        tabStyle: {
          padding: 3,
          margin: 0,
        },
        labelStyle: {
          fontSize: fontSizes.small,
        },
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          height: 60,
          marginHorizontal: 10,
          marginVertical: 10,
          borderRadius: 100,
          backgroundColor: colors.background,
          marginBottom: Platform.OS === 'ios' && 25,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 1},
              shadowOpacity: 0.8,
              shadowRadius: 2,
            },
            android: {
              elevation: 13,
            },
          }),
        },
      }}>
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({focused}) => (
            <View
              style={{
                width: 40,
                height: 40,
                padding: 7,
                borderRadius: 100,
                marginBottom:
                  screenHeight < 668
                    ? HP(-2)
                    : Platform.OS === 'ios'
                    ? HP(-4.5)
                    : -15,
              }}>
              {focused ? (
                <HomeFillIcon width={30} height={30} />
              ) : (
                <HomeIcon width={30} height={30} />
              )}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Booking"
        component={Booking}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({focused}) => (
            <View
              style={{
                width: 40,
                height: 40,

                padding: 7,
                borderRadius: 100,
                marginBottom:
                  screenHeight < 668
                    ? HP(-2)
                    : Platform.OS === 'ios'
                    ? HP(-4.5)
                    : -15,
              }}>
              {focused ? (
                <BookingFillIcon width={30} height={30} />
              ) : (
                <BookIcon width={30} height={30} />
              )}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={Chat}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({focused}) => (
            <View
              style={{
                width: 40,
                height: 40,

                padding: 7,
                borderRadius: 100,
                marginBottom:
                  screenHeight < 668
                    ? HP(-2)
                    : Platform.OS === 'ios'
                    ? HP(-4.5)
                    : -15,
              }}>
              <View style={styles.tabIconContainer}>
                {focused ? (
                  <ChatFillIcon width={30} height={30} />
                ) : (
                  <ChatIcon width={30} height={30} />
                )}
                {chatUnReadCount > 0 && (
                  <Badge
                    value={chatUnReadCount} // Display unread count
                    status="error" // Red badge color
                    containerStyle={styles.badgeContainer}
                  />
                )}
              </View>
            </View>
          ),
        }}
      />
      { !user?.isGuest && (
  <Tab.Screen
  name="More"
  component={More}
  options={{
    tabBarLabel: '',
    tabBarIcon: ({focused}) => (
      <View
        style={{
          width: 40,
          height: 40,

          padding: 7,
          borderRadius: 100,
          marginBottom:
            screenHeight < 668
              ? HP(-2)
              : Platform.OS === 'ios'
              ? HP(-4.5)
              : -15,
        }}>
        {focused ? (
          <MoreFillIcon width={30} height={30} />
        ) : (
          <MoreIcon width={30} height={30} />
        )}
      </View>
    ),
  }}
/>
      )}
    
    </Tab.Navigator>
  );
};

export default BottomTabBar;

const styles = StyleSheet.create({
  tabIconContainer: {
    position: 'relative',
  },
  badgeContainer: {
    position: 'absolute',
    top: -5, // Adjust position
    right: -5, // Adjust position
  },
});
