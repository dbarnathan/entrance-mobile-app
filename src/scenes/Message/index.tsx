import React, { useEffect, useContext, useState, useRef, useCallback } from 'react'
import { FlatList, Keyboard, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StatusBar, Text, TextInput, TouchableWithoutFeedback, View, useWindowDimensions } from 'react-native';
import { UserDataContext } from '../../context/UserDataContext';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { doc, onSnapshot, collection, query, getDocs, setDoc, deleteDoc, orderBy, limit, getDoc } from 'firebase/firestore';
import { colors, fontSize } from '../../theme';
import styles from './styles';
import { useNavigation, useRoute } from '@react-navigation/native';
import MakeEntranceWebsocket from '../../utils/socket';
import { socket } from '../../sockets/socket';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import TimeAgo from 'react-native-timeago';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

const formatPhoneNumber = (e) => {
  let formattedNumber;
  const length = e.length;

  console.log("EEEEEE: ", e)
  // Filter non numbers
  const regex = () => e.replace(/[^0-9\.]+/g, "");
  // Set area code with parenthesis around it
  const areaCode = () => `(${regex().slice(0, 3)})`;

  // Set formatting for first six digits
  const firstSix = () => `${areaCode()} ${regex().slice(3, 6)}`;

  // Dynamic trail as user types
  const trailer = (start) => `${regex().slice(start,
    regex().length)}`;
  if (length < 3) {
    // First 3 digits
    formattedNumber = regex();
  } else if (length === 4) {
    // After area code
    formattedNumber = `${areaCode()} ${trailer(3)}`;
  } else if (length === 5) {
    // When deleting digits inside parenthesis
    formattedNumber = `${areaCode().replace(")", "")}`;
  } else if (length > 5 && length < 9) {
    // Before dash
    formattedNumber = `${areaCode()} ${trailer(3)}`;
  } else if (length >= 10) {
    // After dash
    formattedNumber = `${firstSix()}-${trailer(6)}`;
  }


  return formattedNumber

};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function Message() {
  const route = useRoute()
  const { setUserData, userData, godChecked, archiveChecked } = useContext(UserDataContext)
  const { refreshChannel } = useContext(UserDataContext)
  const navigation = useNavigation()
  const [messages, setMessages] = useState(["1", "2", "3", "4", "5", "6"])
  const [newMessage, setNewMessage] = useState("")
  const [showSend, setShowSend] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const scrollPosition = useRef(0); // To store the current scroll position
  const [isScrolling, setIsScrolling] = useState(false);

  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [page, setPage] = useState(0)
  const textRef = useRef(null)
  const messageRef = useRef(null)

  const { channelId, number, channelData } = route.params

  const deviceWidth = useWindowDimensions().width
  const deviceHeight = useWindowDimensions().height

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
      setTimeout(() => messageRef.current.scrollToEnd({ animated: true }), 0);
    });
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => { });

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  useEffect(() => {
    socket.Subscribe('MESSAGE_EVENT', async (data) => {
      console.log(
        "DATA FROM WEBSOCKET MESSAGE SCREEN: ", data
      )
      getMessages()
    })
  }, [])

  useEffect(() => {
    console.log("Whats in channel Datas: ", channelId, " number : ", number)
    getMessages()
  }, [])

  const scrollToBottom = () => {

    setTimeout(() => { messageRef.current.scrollToEnd({ animated: false }) }, 700);

  };

  // Scroll to the bottom whenever the messages change (new message received)
  useEffect(() => {
    scrollToBottom();
    scrollToBottom();
  }, [isLoaded]);

  const handleScrollBegin = () => {
    setIsScrolling(true);
  };

  const handleScrollEnd = () => {
    setIsScrolling(false);
  };


  const getMessages = async () => {
    console.log("READ MESSAGE")
    await axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/messages?channelid=${channelId}&order=DESC&limit=40&update[seen]=true`, {
      headers: {
        'Authorization': userData.access_token
      }
    }).then((response) => {
      console.log(response.data, " : Channel DATA")
      setMessages(response.data.records.reverse())


      setIsLoaded(true)

    }).catch((err) => {
      console.log(err.toJSON());

    })
  }

  const loadMoreMessagesAtStart = (loadMore = false) => {
    console.log("FIRE ", messages[0])

    setIsLoadingMore(true);

    if (messages.length % 40 == 0) {

      axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/messages?channelid=${channelId}&order=DESC&limit=40&update[seen]=true&ts=${messages[0]?.ts}`, {
        headers: {
          'Authorization': userData.access_token
        }
      }).then((response) => {
        console.log(response.data, " : Channel DATA")

        const newMessages = response.data.records.reverse()
        setMessages(prevMessages => loadMore ? [...newMessages, ...prevMessages] : newMessages)
        setTimeout(() => {
          messageRef.current.scrollToOffset({
            offset: scrollPosition.current + (deviceHeight * 2.1), // Restore to previous scroll position
            animated: false,  // Disable animation for smoother experience
          });
        }, 0)





        setIsLoadingMore(false);

      }).catch((err) => {
        console.log(err.toJSON());

      })
    }


  }

  const handleScroll = ({ nativeEvent }) => {

    const contentHeight = nativeEvent.contentSize.height;  // Total content height
    const visibleHeight = nativeEvent.layoutMeasurement.height;  // Visible height
    const yOffset = nativeEvent.contentOffset.y;  // Current scroll offse

    const halfwayPoint = contentHeight / 2 - visibleHeight / 2;

    if (yOffset <= halfwayPoint) {
      // When contentOffset.y <= 0, the list is at the start
      // console.log("Threshold is " + nativeEvent.contentOffset.y)
      console.log("LOAD MORE MESSAGES: ", messages?.length, " Is it Loading??: ", isLoadingMore)
      // setIsLoadingMore(false)
      if (!isLoadingMore) {
        // if(scrollPosition.current == 0)
        scrollPosition.current = nativeEvent.contentOffset.y;
        loadMoreMessagesAtStart(true);
      }
    }
  };

  useEffect(() => {
    if (newMessage.length > 0) {
      setShowSend(true)
    } else {
      setShowSend(false)
    }
  }, [newMessage]);



  useEffect(() => {


    navigation.getParent()?.setOptions({
      tabBarStyle: {
        display: "none"
      }
    });
    return () => navigation.getParent()?.setOptions({
      tabBarStyle: {
        display: "inline"
      }
    });
  }, [])

  const Message = ({ item, index }) => {

    const checkTimeAgo = (time) => {
      let date = new Date(time)
      let now = new Date()
      let diff = (now.getTime() - date.getTime()) / 1000

      diff /= (60 * 60)
      let hrs = Math.abs(Math.round(diff))
      // console.log("DIFFERENCE IN TIME: ", hrs)
      return hrs
    }

    const checkDifferece = () => {
      let date = new Date(messages[index - 1]?.ts)
      let now = new Date(item.ts)
      let diff = (now.getDate() - date.getTime()) / 1000

      // console.log("LAST MESSAGE: ", date)
      if (now.getDate() != date.getDate()) {
        return true
      } else {
        return false
      }

    }



    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };



    const checkPrevMessage = () => {
      // console.log("INdex: ", index)
      if (index == 0) {

        return true
      }
    }


    return (
      <View style={{ paddingBottom: 20 }}>
        {
          checkDifferece() || checkPrevMessage() ? <Text style={{ color: colors.gray, fontSize: 12, paddingTop: 5, alignSelf: "center", paddingBottom: 50 }}>{new Date(item.ts).toLocaleDateString('en-US', options)}</Text> : null
        }
        {
          item.inbound ? <View style={{ alignItems: "flex-start" }}>
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#949494", padding: 14, borderRadius: 12, maxWidth: "70%" }}>

              <Text style={{ color: colors.white, fontSize: fontSize.h1, }}>{item.message}</Text>

            </View>
            <Text style={{ color: colors.gray, fontSize: 12, paddingTop: 15 }}>{checkTimeAgo(item.ts) > 3 ? new Date(item.ts).toLocaleString([], { hour: '2-digit', minute: '2-digit' }) : <TimeAgo time={item.ts} />}</Text>
          </View> : <View style={{ alignItems: "flex-end" }}>
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#4797c9", padding: 14, borderRadius: 12, maxWidth: "70%" }}>

              <Text style={{ color: colors.white, fontSize: fontSize.h1, }}>{item.message}</Text>

            </View>
            <Text style={{ color: colors.gray, fontSize: 12, paddingTop: 15 }}>{checkTimeAgo(item.ts) > 3 ? new Date(item.ts).toLocaleString([], { hour: '2-digit', minute: '2-digit' }) : <TimeAgo time={item.ts} />}</Text>
          </View>
        }
      </View>

    )
  }

  const handleSendMessage = async () => {
    console.log("SENDING MESSAGE")
    let data = {
      channel_id: channelId,
      message: newMessage
    }
    setShowSend(false)

    axios.post(`https://${process.env.EXPO_PUBLIC_LIVE}/messages`, data, {
      headers: {
        'Authorization': userData.access_token
      }
    }).then((response) => {
      console.log(response.data, " : Channel DATA")
      setNewMessage("")
      Keyboard.dismiss()
      getMessages()
      refreshChannel(godChecked, archiveChecked, userData)

    }).catch((err) => {

      setNewMessage("")
      Keyboard.dismiss()
      console.log(err, ": Error Sending Message")
    }
    )
  }

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
      console.log("Notifications: ", existingStatus)
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
        if (!projectId) {
          throw new Error('Project ID not found');
        }
        token = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;
        console.log(token);
      } catch (e) {
        token = `${e}`;
      }
    } else {
      alert('Must use physical device for Push Notifications');
    }

    return token;
  }


  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "padding"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 57 : 0}
    >
      <View style={{ justifyContent: "space-between", height: "100%" }} >
        <View style={{ padding: 12, justifyContent: "space-between", flexDirection: "row", backgroundColor: "white", }}>

          <View style={{ flexDirection: "row", gap: 5, padding: 8, paddingTop: 0 }}>
            <Pressable style={{ position: "absolute", height: 70, width: 90, top: -15, left: -15 }} onPress={() => { navigation.goBack() }}></Pressable>

            <FontAwesome5 name="chevron-left" size={22} color="black" />


          </View>
          <View>
            <Text>+1 {formatPhoneNumber(number.slice(1))}</Text>
          </View>
          <View style={{ padding: 8, paddingTop: 0, paddingRight: 12 }}>
            <Pressable style={{ position: "absolute", height: 70, width: 70, top: -40, right: -10 }} onPress={() => { navigation.navigate("ContactStack", { data: channelData }) }}></Pressable>
            <FontAwesome6 name="ellipsis-vertical" size={18} color="gray" />
          </View>
        </View>


        <View style={{ flex: 1, height: "100%" }}>
          <FlatList
            data={messages}
            ref={messageRef}
            ItemSeparatorComponent={() => <View
              style={{
                padding: 4
              }}
            />}
            onScrollBeginDrag={handleScrollBegin}  // Detect when scrolling begins
            onScrollEndDrag={handleScrollEnd}      // Detect when scrolling stops
            onMomentumScrollBegin={handleScrollBegin} // Detect when momentum scrolling starts
            onMomentumScrollEnd={handleScrollEnd}
            scrollEnabled={true}
            onScroll={handleScroll}  // Detect scroll position
            scrollEventThrottle={16}
            style={{

              paddingHorizontal: 28,

            }}
            renderItem={({ item, index }) => (
              <Message item={item} index={index} />
            )}
            ListFooterComponent={<View style={{ height: 20 }} />}
          />
        </View>

        <View style={{ backgroundColor: "white", padding: 20, paddingBottom: 35, flexDirection: "row", gap: 12 }}>
          <TextInput
            style={{ backgroundColor: colors.lightGrayPurple, color: "black", borderRadius: 12, fontSize: 16, padding: 12, borderColor: "#7972BC", borderWidth: 1, minWidth: "80%" }}
            placeholderTextColor={"gray"}
            ref={textRef}
            placeholder={"Type your message here..."}

            onChangeText={(value) => setNewMessage(value)}
            value={newMessage}


          />
          {
            showSend ?
              <View style={{ borderRadius: 20, backgroundColor: "#58bf61", height: 30, width: 30, alignItems: "center", justifyContent: "center" }}>
                <Pressable style={{ height: 80, width: 80, position: "absolute", top: -10, zIndex: 2 }} onPress={() => handleSendMessage()}></Pressable>
                <FontAwesome5 name="arrow-up" size={18} color="white" />
              </View>
              : <View style={{ borderRadius: 20, backgroundColor: "lightgray", height: 30, width: 30, alignItems: "center", justifyContent: "center" }}>
                <Pressable style={{ height: 80, width: 80, position: "absolute", top: -10, zIndex: 2 }} ></Pressable>
                <FontAwesome5 name="arrow-up" size={18} color="white" />
              </View>
          }
        </View>

      </View>
    </KeyboardAvoidingView>
  )
}