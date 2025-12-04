import React, { useEffect, useContext, useState, useRef, useCallback } from 'react'
import { Alert, FlatList, Keyboard, Platform, Pressable, SafeAreaView, ScrollView, StatusBar, Switch, Text, TextInput, TouchableWithoutFeedback, View, useWindowDimensions, Image } from 'react-native';
import { UserDataContext } from '../../context/UserDataContext';
import { ColorSchemeContext } from '../../context/ColorSchemeContext'
import ScreenTemplate from '../../components/ScreenTemplate';
import { FontAwesome, FontAwesome5, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';
import { colors, fontSize } from '../../theme';
import styles from './styles';
import { useNavigation } from '@react-navigation/native';
import uFuzzy from '@leeoniya/ufuzzy';

export default function Workspace() {

  const { setUserData, userData, workspaceCampaigns, recentCampaigns, workspaceUsers, getWorkspaceCampaigns, userRole } = useContext(UserDataContext)
  const { scheme } = useContext(ColorSchemeContext)
  const navigate = useNavigation()
  const [search, setSearch] = useState('')
  const [searchResult, setSearchResult] = useState([])


  const isDark = scheme === 'dark'

  const deviceWidth = useWindowDimensions().width
  const deviceHeight = useWindowDimensions().height

  const navigation = useNavigation()

  const workspaceList = [
    { title: "Users", color: "#00B9FF", description: "Add, edit, and remove your workspace users here. Update their numbers, permissions, and settings.", navigation: "Users" },
    { title: "Workspace Flags", color: "#0162E8", description: "Manage your message flags. Add, delete, and set flag name. Use thess flags to help manage your channels.", navigation: "Flags" },
    { title: "Numbers", color: "#22C03C", description: "Manage your workspace's numbers. Subscribe to and unrent your numbers. Cycle numbers for new ones.", navigation: "Numbers" },
    { title: "Blocked Numbers", description: "Manage your workspace's blocked numbers to better control and prevent messages from unwanted numbers.", navigation: "BlockedNumbers" },
    { title: "Billing", color: "#673AB7", description: "Review your monthly billing summary, manage your subscriptions, or purchase additional credits.", navigation: "Billing" },
    { title: "Settings", color: "#FBBC0B", description: "Adjust various settings of your users, campaigns, and claims here for more control over your workspace.", navigation: "WorkspaceSettings" },
    { title: "Message Management", color: "#0162E8", description: "Manage things like blacklisted words and phrases in your campaign messages before they're sent out.", navigation: "MessageManagement" },
    { title: "API", color: "#FBBC0B", description: "View and manage your api keys, retrieve your current api key, or regenerate a new one if needed.", navigation: "API" },
    { title: "10DLC", color: "#22C03C", description: "Register your company for 10DLC to increase the volume and rate of sending messages to customers.", navigation: "10DLC" },
    { title: "Logs", color: "#00B9FF", description: "View the activity in your workspace such as users creating campaigns, claiming, sending and so forth.", navigation: "Logs" },

  ]


  const getSearchIndexes = useCallback((haystack: string[], needle: string): number[] => {

    if (needle.length < 1) return undefined

    const uf = new uFuzzy({
      intraMode: 1,
    })

    const result = uf.filter(haystack, needle)

    return [...result]

  }, [])

  useEffect(() => {

    console.log("ENV: ", process.env.HOST_NAME)


    const searchCampaignIndexes = getSearchIndexes(workspaceCampaigns.map(item => item?.name), search)

    if (!searchCampaignIndexes) return;

    setSearchResult((previous) => {

      if (searchCampaignIndexes.length < 1) return previous

      const searchItems = searchCampaignIndexes.map((index) => workspaceCampaigns[index])

      return searchItems

    })

  }, [search, workspaceCampaigns, getSearchIndexes])

  const Campaign = ({ item }) => {
    // console.log("Campaign Component: ", item

    const handleCampaign = () => {
      navigate.navigate("ViewCampaign", { campaign_id: item?.id })
    }


    const options = {
      weekday: 'numeric',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    };

    const created = new Date(item.created_at)


    return (
      <Pressable style={{

        padding: 10, marginVertical: 5,
        borderRadius: 10,

        width: '45%', // Adjust to fit two items per row
        height: "18%",
        backgroundColor: 'white',

        margin: 8,
        borderTopWidth: 2.5,
        borderTopColor: item.color,
        shadowColor: "#000000",
        shadowOpacity: 0.3033,
        shadowRadius: 2.5,
        shadowOffset: {
          height: 3,
          width: 1
        },
        elevation: 5,

      }}
        onPress={() => navigate.navigate(item.navigation)}
      >

        <Text style={{ fontWeight: "500", fontSize: 14, paddingBottom: 5 }}>{item.title}</Text>
        <Text style={{ color: colors.grayLight, }}>{item.description}</Text>
      </Pressable>
    )
  }

  return (
    <TouchableWithoutFeedback style={{}} onPress={() => { Keyboard.dismiss() }}>
      <>



        <View style={{ padding: 12, marginTop: -12, paddingBottom: 8, justifyContent: "space-between", flexDirection: "row", backgroundColor: "white", alignItems: "center" }}>

          <View style={{ flexDirection: "row", gap: 5, padding: 0, }}>
            <Pressable style={{ position: "absolute", height: 70, width: 90, top: -15, left: -15 }} onPress={() => { navigation.goBack() }}></Pressable>

            <FontAwesome5 name="chevron-left" size={22} color="black" />


          </View>
          <View style={{}}>
            <Text style={{ fontSize: 18, fontWeight: "500" }}>Workspace</Text>
          </View>
          <View style={{ paddingTop: 0, paddingRight: 12, alignItems: "center" }}>

          </View>
          <View style={{ position: "absolute", top: 0, right: 10, flex: 1 }}>
            <Image source={require('../../../assets/images/purpleE.png')} resizeMode='contain'
              style={{ alignSelf: "flex-start", height: deviceHeight * .05, width: deviceWidth * .08, }} />
          </View>
        </View>
        <ScrollView nestedScrollEnabled={true} scrollEnabled={false} >
          <View style={{ marginTop: 10 }}></View>
          <View style={styles.container}>

            {
              workspaceList.map((item, index) => (
                <>
                  {
                    userRole == "senior" && item.title == "Billing" ? "" : <Campaign item={item} />
                  }
                </>

              ))
            }

          </View>
          <View style={{ marginBottom: deviceHeight * .2 }} />

        </ScrollView>

      </>

    </TouchableWithoutFeedback>
  )
}