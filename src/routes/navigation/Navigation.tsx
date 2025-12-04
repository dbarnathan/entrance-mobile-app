import 'react-native-gesture-handler'
import React, { useEffect, useState, useContext, useRef } from 'react'
import { Platform } from "react-native";
import { NavigationContainer, } from '@react-navigation/native'
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack'
import { DefaultTheme, DarkTheme } from '@react-navigation/native'
import { ColorSchemeContext } from '../../context/ColorSchemeContext'
import { UserDataContext } from '../../context/UserDataContext'
import Toast from 'react-native-toast-message'
import { toastConfig } from '../../utils/ShowToast'
import * as Linking from 'expo-linking'
import { LoginNavigator } from './stacks'
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as Device from 'expo-device';

import { lightProps, darkProps } from './stacks/navigationProps/navigationProps';
import TabNavigator from "./tabs";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';


export default function App() {
  const { scheme } = useContext(ColorSchemeContext)
  const Stack = createStackNavigator()
  const [title, setTitle] = useState('default title')
  const { userData, getFollowers, getLiked, getSaved, expoPushToken, setExpoPushToken } = useContext(UserDataContext)
  const navigationRef = useRef();
  const [data, setData] = useState(null)


  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>([]);
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(
    undefined
  );
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  const prefix = Linking.createURL('/')
  const linking = {
    prefixes: [prefix],
    config: {
      screens: {

        HomeRoot: {
          screens: {
            Home: {
              screens: {
                HomeStack: "",
                MessageStack: {
                  path: "message/:id",
                  parse: {
                    id: (id) => `${id}`,

                  },
                  stringify: {
                    id: (id) => id.replace(/look-/g, ''),

                  },
                },
                ProfileTab: "profile"
              }
            }

          }
        }
      }

    }
  };

  useEffect(() => {
    console.log("Current URL: ", process.env.EXPO_PUBLIC_LIVE)
  }, [])

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => token && setExpoPushToken(token));

    if (Platform.OS === 'android') {
      Notifications.getNotificationChannelsAsync().then(value => setChannels(value ?? []));
    }
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
      console.log("The notification Recieved Listener: ", notification)
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const { screen, messageId, id, number } = response?.notification?.request?.content?.data?.data?.data?.message?.channel;

      console.log("Screen from notification: ", response?.notification?.request?.content?.data?.data?.data?.message?.channel)

      if (screen) {
        navigationRef.current?.navigate(screen, { messageId });
      } else {
        navigationRef.current?.navigate("MessageStack", {channelId: id, number: number});
      }
    
      console.log("The notification Response Recieved Listener: ", response);
    });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  useEffect(() => {



    (async () => {
      const isDevice = Device.isDevice
      if (!isDevice) return
      console.log('get push token')



    })();

  }, [userData])


  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      // Learn more about projectId:
      // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
      // EAS projectId is used here.
      try {
        const projectId =
          Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

          console.log("PROJECT ID: ", projectId);
          
        if (!projectId) {
          throw new Error('Project ID not found');
        }
        token = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;
        console.log("EXPO PUSH TOKEN: ", token);

        axios.post(`https://${process.env.EXPO_PUBLIC_LIVE}/users/push-token`, 
          { token: token }, 
          {headers: {
          'Authorization': userData.access_token
        }}).then((response) => {
          console.log("Successfully pushed")
        }).catch((err) => {console.log("Error Could not add push token: ", err)})

        const value = await AsyncStorage.getItem('token')


        if (value !== null) {
          // value previously stored
          console.log("VALUE: ", value)
          const parsedData = JSON.parse(value);

          parsedData.push_token = token;

          await AsyncStorage.setItem('token', JSON.stringify(parsedData))
        }


      } catch (e) {
        token = `${e}`;
      }
    } else {
      alert('Must use physical device for Push Notifications');
    }

    return token;
  }

  return (
    <>
      <NavigationContainer linking={linking} ref={navigationRef} >
        {userData ?
          <Stack.Navigator
            screenOptions={{
              headerShown: false
            }}
          >
            <Stack.Screen
              name='HomeRoot'
              component={TabNavigator}
            />

          </Stack.Navigator>
          :
          <LoginNavigator />
        }
      </NavigationContainer>
      <Toast config={toastConfig} />
    </>
  )
}


