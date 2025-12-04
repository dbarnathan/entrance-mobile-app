import React, { useEffect, useContext, useState, useRef, useCallback } from 'react'
import { FlatList, Keyboard, Platform, Pressable, SafeAreaView, ScrollView, StatusBar, Text, TouchableWithoutFeedback, View, useWindowDimensions, Image } from 'react-native';
import { UserDataContext } from '../../context/UserDataContext';
import { ColorSchemeContext } from '../../context/ColorSchemeContext'
import ScreenTemplate from '../../components/ScreenTemplate';
import { MaterialIcons } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';
import { colors, fontSize } from '../../theme';
import styles from './styles';
import { useNavigation } from '@react-navigation/native';
import { socket } from '../../sockets/socket';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BarChart, LineChart, PieChart, PopulationPyramid } from "react-native-gifted-charts";
import { DateModal } from '../../components/DateModal';
import EndDateModal from '../../components/EndDateModal';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { connectStorageEmulator } from 'firebase/storage';
import Settings from '../Settings';


export default function Profile() {

  const { setUserData, userData, campaigns, setCampaigns, recentCampaigns, workspaceUsers, userBlasts, getUserSentBlasts, userRole } = useContext(UserDataContext)
  const { scheme } = useContext(ColorSchemeContext)
  const navigate = useNavigation()

  const [flagList, setFlagList] = useState([])
  const [update, setUpdate] = useState(false)
  const [revealUser, setRevealUser] = useState(false)
  const [allDelivered, setAllDelivered] = useState(0)
  const [allResponded, setAllResponded] = useState(0)
  const [allUndelivered, setAllUndelivered] = useState(0)
  const [allStopped, setAllStopped] = useState(0)
  const [allSpam, setAllSpam] = useState(0)
  const [seeMore, setSeeMore] = useState(false)

  const [dateVisible, setDateVisible] = useState(false)
  const [endDateVisible, setEndDateVisible] = useState(false) //

  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)))
  const [endDate, setEndDate] = useState(new Date())

  const [billing, setBilling] = useState({})

  const [data, setData] = useState([{ value: 50 }, { value: 80 }, { value: 90 }, { value: 70 }])

  const isDark = scheme === 'dark'


  const sort = {
    last_message_at: -1
  };

  const colorScheme = {
    container: isDark ? colors.dark : colors.white,
    text: isDark ? colors.white : colors.primaryText
  }

  const deviceWidth = useWindowDimensions().width
  const deviceHeight = useWindowDimensions().height

  const handleLogOut = async () => {
    await AsyncStorage.clear();
    setUserData('')
  }

  useEffect(() => {

    axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/billing/usage`, {
      headers: {
        'Authorization': userData.access_token
      }
    }).then((response) => {
      console.log(response.data, " : Billing DATA")
      setBilling(response.data)
    })
  }, [])

  useEffect(() => {
    let temp = []
    let allDelivered = 0
    let allResponded = 0
    let allUndelivered = 0
    let allStopped = 0
    let allSpam = 0
    const options = {


      month: 'short',
      day: 'numeric',
    };

    console.log("OPtions")
    campaigns.forEach(campaign => {


      allDelivered += campaign.delivered

      allResponded += campaign.response
      allUndelivered += campaign.undelivered
      allStopped += campaign.stop
      allSpam += campaign.spam

      const currentDate = new Date(campaign.date)

      const realDate = currentDate.setDate(currentDate.getDate() + 1)

      temp.push({
        value: campaign.delivered == 0 ? 0.01 : campaign.delivered,
        label: new Date(realDate)?.toLocaleDateString("en-US", options),
        labelTextStyle: { fontSize: 12 },
        labelWidth: 40,
        spacing: 3,
        frontColor: '#22C03C',
      }, {
        value: campaign.response == 0 ? 0.01 : campaign.response,
        frontColor: '#D13B5E',
        spacing: 3,
      }, {
        value: campaign.undelivered == 0 ? 0.01 : campaign.undelivered,
        frontColor: '#FBBC0B',
        spacing: 35,
      })
    })
    console.log("DATA BAR CHART: ", temp)
    setAllDelivered(allDelivered)
    setAllResponded(allResponded)
    setAllUndelivered(allUndelivered)
    setAllSpam(allSpam)
    setAllStopped(allStopped)
    setData(temp)
  }, [flagList])

  useEffect(() => {
    console.log("HELP PROFILE: ", userRole)
  }, [])

  useEffect(() => {
    axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/flags?order=DESC`, {
      headers: {
        'Authorization': userData.access_token
      },
      params: {
        adminview: true,
      }
    }).then((response) => {
      console.log(response.data, " : Channel DATA")
      setFlagList(response.data.records)



    }).catch((err) => {
      console.log(err.toJSON());

    })
  }, [])

  useEffect(() => {
    socket.Subscribe('MESSAGE', (data) => {
      console.log(
        "DATA FROM WEBSOCKET MESSAGE: ", data
      )
    })
  }, [])

  useEffect(() => {
    const startString = new Date(startDate).getFullYear() + '-' + new Date(startDate).getMonth() + '-' + new Date(startDate).getDate()
    const endString = new Date(endDate).getFullYear() + '-' + new Date(endDate).getMonth() + '-' + new Date(endDate).getDate()
    getUserSentBlasts(userData, startString, endString)
  }, [startDate, endDate])

  const Flag = ({ item }) => {
    console.log("Follow component: ", item)

    const [id, setId] = useState("")
    const [otherUser, setOtherUser] = useState()

    return (
      <Pressable style={{ flexDirection: "row", alignItems: "center", gap: 9, paddingTop: 6 }}
      >
        <View style={{ height: 20, width: 20, borderRadius: 20, backgroundColor: item.color_id }} />
        <Text style={{ fontWeight: "500", fontSize: 12, }}>{item.name}</Text>
      </Pressable>
    )
  }

  const User = ({ item }) => {
    console.log("Follow component: ", item)

    const [id, setId] = useState("")
    const [otherUser, setOtherUser] = useState()

    return (
      <Pressable style={{ flexDirection: "row", alignItems: "center", gap: 9, paddingTop: 6, paddingBottom: 10 }}
      >

        <View style={{ padding: 10, paddingVertical: 11.5, borderRadius: 20, backgroundColor: "#DFDFDF", alignItems: "center" }} >
          <Text style={{ color: "black", fontSize: 14, fontWeight: "500" }}>{item.firstname[0] + item.lastname[0]}</Text>
        </View>
        <View style={{ flexDirection: "column", gap: 5 }}>
          <Text style={{ fontWeight: "500", fontSize: 14, }}>{item.firstname} {item.lastname}</Text>
          <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
            <Text style={{ fontWeight: "500", fontSize: 12, color: colors.grayLight }}>User ID: #{item.id}</Text>
            <Text style={{ fontWeight: "500", fontSize: 12, color: item.permission == "admin" ? "#52BE80" : item.permission == "user" ? "#D13B5E" : "#FFC300" }}>{item.permission}</Text>
          </View>
        </View>
      </Pressable>
    )
  }

  const Campaign = ({ item }) => {
    // console.log("Campaign Component: ", item)

    const [id, setId] = useState("")
    const [otherUser, setOtherUser] = useState()



    const options = {
      weekday: 'numeric',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    };

    const created = new Date(item.created_at)


    return (
      <Pressable style={{ flexDirection: "column", padding: 10, marginVertical: 5, backgroundColor: "#ECF0FA", borderRadius: 10 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, justifyContent: "space-between", paddingBottom: 3 }}>
          <View style={{ flexDirection: "row", gap: 9, flex: 1 }}>
            <Text style={{ maxWidth: "40%" }} numberOfLines={1} ellipsizeMode='tail'>{item.name}</Text>
            <Text style={{ fontWeight: "500" }} >{item.type}</Text>
          </View>
          <Text style={{}}>{created.getMonth() + "/" + created.getDate() + "/" + created.getFullYear()}</Text>


        </View>
        <Text style={{ fontWeight: "400", fontSize: 12, }} numberOfLines={3}>{item.text_message}</Text>
      </Pressable>
    )
  }

  const UserBlasts = ({ item }) => {

    return (
      <Pressable style={{ flexDirection: "column", padding: 10, backgroundColor: "#ECF0FA", borderRadius: 10, marginBottom: 8 }}
        onPress={() => { navigate.navigate("UserBlastsStack", { user: item }) }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, justifyContent: "space-between", }}>
          <View style={{ flexDirection: "row", flex: 1 }}>
            <Text style={{ maxWidth: "40%", fontSize: 14 }} numberOfLines={2} ellipsizeMode='tail'>{item.firstname} {item.lastname}</Text>
            <Text style={{ fontWeight: "500" }} >{item.type}</Text>
          </View>
          <View style={{ flexDirection: "column", alignItems: "center" }}>
            <Text style={{ fontSize: 13, fontWeight: "600" }}>{item.sent}</Text>
            <Text style={{ fontWeight: '500' }}>Sent</Text>
          </View>
          <View style={{ flexDirection: "column", alignItems: "center" }}>
            <Text style={{ fontSize: 13, fontWeight: "600" }}>{item.response}</Text>
            <Text style={{ fontWeight: '500' }}>Response</Text>
          </View>

        </View>

      </Pressable>
    )
  }

  const IosDatePicker = () => {
    return (
      <View style={{ flexDirection: "row", gap: 15 }}>
        <Pressable style={{ borderRadius: 12, backgroundColor: Platform.OS == "ios" ? "transparent" : colors.grayedOutUnread, padding: Platform.OS == "ios" ? 0 : 12, marginBottom: 10, alignItems: "center" }} onPress={() => setDateVisible(true)}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialCommunityIcons name="calendar-start" size={24} color="black" />
            <DateModal date={startDate} setDate={setStartDate} isVisible={dateVisible} setIsVisible={setDateVisible} />
          </View>
        </Pressable>
        <Pressable style={{ borderRadius: 12, backgroundColor: Platform.OS == "ios" ? "transparent" : colors.grayedOutUnread, padding: Platform.OS == "ios" ? 0 : 12, marginBottom: 10, alignItems: "center" }} onPress={() => setEndDateVisible(true)}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialCommunityIcons name="calendar-end" size={24} color="black" />
            <EndDateModal date={endDate} setDate={setEndDate} isVisible={endDateVisible} setIsVisible={setEndDateVisible} />
          </View>


        </Pressable>
      </View>

    )
  }

  const AndroidDatePicker = () => {
    const options = {

      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    return (

      <View style={{ flexDirection: "row", gap: 15 }}>
        {
          dateVisible && <DateModal date={startDate} setDate={setStartDate} isVisible={dateVisible} setIsVisible={setDateVisible} />
        }
        {
          endDateVisible && <EndDateModal date={endDate} setDate={setEndDate} isVisible={endDateVisible} setIsVisible={setEndDateVisible} />
        }
        <Pressable style={{ borderRadius: 12, backgroundColor: "gray", marginBottom: 10, alignItems: "center" }} onPress={() => setDateVisible(true)}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <MaterialCommunityIcons name="calendar-start" size={24} color="white" style={{ padding: 6 }} />
            <View style={{ backgroundColor: colors.lightGrayPurple, borderRadius: 12, padding: 10 }}>
              <Text style={{ fontWeight: "500" }}>{startDate?.toLocaleDateString("us-EN", options)}</Text>
            </View>
          </View>

        </Pressable>
        <Pressable style={{ borderRadius: 12, backgroundColor: "gray", marginBottom: 10, alignItems: "center" }} onPress={() => setEndDateVisible(true)}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <MaterialCommunityIcons name="calendar-end" size={24} color="white" style={{ padding: 6 }} />
            <View style={{ backgroundColor: colors.lightGrayPurple, borderRadius: 12, padding: 10 }}>
              <Text style={{ fontWeight: "500" }}>{endDate?.toLocaleDateString("us-EN", options)}</Text>
            </View>

          </View>


        </Pressable>
      </View>

    )
  }


  return (
    <TouchableWithoutFeedback style={{}} onPress={() => { Keyboard.dismiss() }}>
      <>

        {
          Platform.OS === "ios" ?
            <SafeAreaView style={Platform.OS == "ios" ? { flex: .01, backgroundColor: "white" } : { flex: 0.06 }}>
              <StatusBar barStyle="dark-content" backgroundColor="white" />
            </SafeAreaView> : <StatusBar barStyle="dark-content" backgroundColor="white" />
        }
        <View style={{ backgroundColor: "white", }}>
          <View style={{ padding: 12, paddingTop: 0, justifyContent: "flex-end", flexDirection: "row", alignItems: "flex-end" }}>

            <View>

              <Pressable style={{ flexDirection: "row", gap: 9, alignItems: 'center' }} onPress={() => { navigate.navigate("SettingsStack") }}>
                <Text style={{ fontSize: 16 }}>Welcome back <Text style={{ fontWeight: "600" }}>{userData.firstname}</Text></Text>
                <MaterialIcons name="account-circle" size={28} color={colors.primaryText} />
              </Pressable>
            </View>

          </View>
          {
            revealUser ?
              <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
                <View style={{ paddingHorizontal: 12, alignItems: "flex-start", gap: 3 }}>

                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 }}>
                    <Ionicons name="person" size={18} color={colors.primaryText} />
                    <Text style={{ color: colors.primaryText, fontSize: fontSize.h2 }}>{userData.firstname} {userData.lastname}</Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 }}>
                    <Ionicons name="mail" size={18} color={colors.primaryText} />
                    <Text style={{ color: colors.primaryText, fontSize: fontSize.h2 }}>{userData.email}</Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 }}>
                    <Ionicons name="phone-portrait-outline" size={18} color={colors.primaryText} />
                    <Text style={{ color: colors.primaryText, fontSize: fontSize.h2 }}>User # - {userData.user_id}</Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, marginBottom: 15 }}>
                    <Ionicons name="flag" size={18} color={colors.primaryText} />
                    <Text style={{ color: colors.primaryText, fontSize: fontSize.h2 }}>Workspace # - {userData.workspace_id}</Text>
                  </View>

                </View>
                <Pressable style={[styles.button, { marginTop: 10, marginRight: 15 }]} onPress={() => { handleLogOut() }}>
                  <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>Logout</Text>
                </Pressable>

              </View> : ""
          }
        </View>

        {
          userRole == "user" ? <Settings /> :
            <View style={{ ...styles.container, }}>

              <ScrollView style={{ width: deviceWidth, padding: 12 }} nestedScrollEnabled={true} bounces={false} showsVerticalScrollIndicator={false}>
                <View style={{ borderRadius: 12, backgroundColor: "white", margin: 5, padding: 12 }}>
                  <Text style={{ fontWeight: "600", fontSize: 16 }}>Message Status History</Text>
                  <Text style={{ color: colors.grayLight, paddingTop: 5, paddingBottom: 10 }}>Track your message status history</Text>
                  <View style={{ flexDirection: "column", alignItems: "flex-start", paddingBottom: 10 }}>

                    <View style={{ flexDirection: "row", gap: 15 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 }}>
                        <View style={{ height: 10, width: 10, borderRadius: 20, backgroundColor: "#22C03C" }} />
                        <Text style={{ fontSize: 16, fontWeight: "600" }}>{allDelivered}</Text>
                        <Text style={{ fontSize: 14, color: colors.grayLight }}>Delivered</Text>

                      </View>
                      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 }}>
                        <View style={{ height: 10, width: 10, borderRadius: 20, backgroundColor: '#D13B5E' }} />
                        <Text style={{ fontSize: 16, fontWeight: "600" }}>{allResponded}</Text>
                        <Text style={{ fontSize: 14, color: colors.grayLight }}>Responded</Text>

                      </View>

                    </View>

                    <View style={{ flexDirection: "row", gap: 15 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 }}>
                        <View style={{ height: 10, width: 10, borderRadius: 20, backgroundColor: "#FBBC0B" }} />
                        <Text style={{ fontSize: 16, fontWeight: "600" }}>{allUndelivered}</Text>
                        <Text style={{ fontSize: 14, color: colors.grayLight }}>Undelivered</Text>

                      </View>

                      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 }}>
                        <View style={{ height: 10, width: 10, borderRadius: 20, backgroundColor: "#0162E8" }} />
                        <Text style={{ fontSize: 16, fontWeight: "600" }}>{allSpam}</Text>
                        <Text style={{ fontSize: 12, color: colors.grayLight }}>Spam</Text>

                      </View>
                      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 }}>
                        <View style={{ height: 10, width: 10, borderRadius: 20, backgroundColor: "#737F9E" }} />
                        <Text style={{ fontSize: 16, fontWeight: "600" }}>{allStopped}</Text>
                        <Text style={{ fontSize: 12, color: colors.grayLight }}>Stopped</Text>

                      </View>

                    </View>

                  </View>
                  {
                    allDelivered == 0 && allResponded == 0 && allUndelivered == 0 ?
                      <View style={{ alignItems: "center", paddingVertical: 5 }}>
                        <Image source={require('../../../assets/images/purpleE.png')} resizeMode='contain'
                          style={{ height: deviceHeight * .2, width: deviceWidth * .8, tintColor: colors.grayedOut }} />
                        <Text style={{ color: colors.grayLight, fontSize: 16 }}>No Message History Available</Text>
                      </View> : <BarChart data={data} barBorderRadius={4} spacing={10} noOfSections={5} barWidth={10} width={deviceWidth * .75} />
                  }

                </View>
                <View style={{ borderRadius: 12, backgroundColor: "white", margin: 5, padding: 12 }}>
                  <Text style={{ fontWeight: "600", fontSize: 16 }}>Current Pricing</Text>
                  <Text style={{ color: colors.grayLight, paddingTop: 5 }}>A quick summary of your current segments, cost per segment and so forth</Text>
                  <View style={{ flexDirection: "column", alignItems: "flex-start", paddingTop: 10 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 }}>
                      <View style={{ height: 10, width: 10, borderRadius: 3, backgroundColor: "#5E9AE7" }} />
                      <Text style={{ fontSize: 14, color: colors.grayLight }}>Current Balance: </Text>
                      <Text style={{ fontSize: 16, fontWeight: "600" }}><Text style={{ fontSize: 12 }}>$</Text>{billing?.current_balance?.toFixed(2)}</Text>

                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 }}>
                      <View style={{ height: 10, width: 10, borderRadius: 3, backgroundColor: "#0162E8" }} />

                      <Text style={{ fontSize: 14, color: colors.grayLight }}>Cost per segment: </Text>
                      <Text style={{ fontSize: 16, fontWeight: "600" }}><Text style={{ fontSize: 12 }}>$</Text>{billing?.cost_per_segment?.toFixed(3)}</Text>


                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 }}>
                      <View style={{ height: 10, width: 10, borderRadius: 3, backgroundColor: "#00B9FF" }} />

                      <Text style={{ fontSize: 14, color: colors.grayLight }}>Segments: </Text>
                      <Text style={{ fontSize: 16, fontWeight: "600" }}>{billing?.segments}</Text>

                    </View>

                  </View>
                </View>
                <View style={{ borderRadius: 12, backgroundColor: "white", margin: 5, padding: 12 }}>
                  <Text style={{ fontWeight: "600", fontSize: 16 }}>Flags</Text>
                  <Text style={{ color: colors.grayLight, paddingTop: 5 }}>All flags within your workspace</Text>

                  <FlatList
                    data={seeMore ? flagList : flagList.slice(0, 6)}
                    keyExtractor={(item) => item.name + Math.random() * 9999}
                    ItemSeparatorComponent={() => <View
                      style={{
                        padding: 4
                      }}
                    />}
                    scrollEnabled={false}
                    style={{
                      marginBottom: 30,
                    }}
                    renderItem={({ item, index }) => (
                      <Flag item={item} />
                    )}
                  />
                  <Pressable style={{ paddingTop: 2, flexDirection: "row", alignItems: "center", gap: 8 }} onPress={() => { setSeeMore(!seeMore) }}>
                    {
                      seeMore ?
                        <>
                          <Text>See Less</Text>
                          <Entypo name="chevron-thin-up" size={17} color="black" />
                        </> :
                        <>
                          <Text>See More</Text>
                          <Entypo name="chevron-thin-down" size={17} color="black" />
                        </>
                    }

                  </Pressable>
                </View>
                <View style={{ borderRadius: 12, backgroundColor: "white", margin: 5, padding: 12, flex: 1, maxHeight: deviceHeight * .65 }}>
                  <Text style={{ fontWeight: "600", fontSize: 16 }}>Users</Text>
                  <Text style={{ color: colors.grayLight, paddingTop: 5, marginBottom: 10 }}>Workspace users that can view your activities</Text>

                  <ScrollView nestedScrollEnabled={true}>
                    {
                      workspaceUsers.map((item, index) => (
                        <User item={item} />
                      ))
                    }
                  </ScrollView>
                </View>
                <View style={{ borderRadius: 12, backgroundColor: "white", margin: 5, padding: 12, flex: 1 }}>
                  <Text style={{ fontWeight: "600", fontSize: 16 }}>User Sent Manual Blast Campaigns</Text>
                  <Text style={{ color: colors.grayLight, paddingTop: 5, marginBottom: 10 }}>User Blast Campaigns from the last month</Text>
                  <View style={{ marginVertical: 7 }}>
                    {
                      Platform.OS == "ios" ? <IosDatePicker /> : <AndroidDatePicker />
                    }
                  </View>

                  {
                    userBlasts.slice(0, 8).map((item, index) => (
                      <UserBlasts item={item} />
                    ))
                  }

                </View>
                <View style={{ borderRadius: 12, backgroundColor: "white", margin: 5, padding: 12, flex: 1 }}>
                  <Text style={{ fontWeight: "600", fontSize: 16 }}>Your Most Recent Campaigns</Text>
                  <Text style={{ color: colors.grayLight, paddingTop: 5, marginBottom: 10 }}>These are your most recent sent campaigns</Text>


                  {
                    recentCampaigns.slice(0, 8).map((item, index) => (
                      <Campaign item={item} />
                    ))
                  }

                </View>
                <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>


                </View>

                <View style={{ marginBottom: 29 }} />

              </ScrollView>
            </View>
        }



      </>



    </TouchableWithoutFeedback>
  )
}