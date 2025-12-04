import React, { useEffect, useContext, useState, useRef, useCallback } from 'react'
import { Alert, FlatList, Keyboard, Platform, Pressable, SafeAreaView, ScrollView, StatusBar, Switch, Text, TextInput, TouchableWithoutFeedback, View, useWindowDimensions, RefreshControl, } from 'react-native';
import { UserDataContext } from '../../context/UserDataContext';
import { ColorSchemeContext } from '../../context/ColorSchemeContext'
import ScreenTemplate from '../../components/ScreenTemplate';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';
import { colors, fontSize } from '../../theme';
import styles from './styles';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import uFuzzy from '@leeoniya/ufuzzy';

export default function Campaigns() {

  const { setUserData, userData, workspaceCampaigns, recentCampaigns, workspaceUsers, getWorkspaceCampaigns } = useContext(UserDataContext)
  const { scheme } = useContext(ColorSchemeContext)
  const navigate = useNavigation()

  const [billing, setBilling] = useState({})
  const [showArchived, setShowArchived] = useState(false)
  const [search, setSearch] = useState('')
  const [searchResult, setSearchResult] = useState([])
  const [reveal, setReveal] = useState(false)

  const [isManual, setIsManual] = useState(false)
  const [subscriber, setSubscriber] = useState(false)

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    console.log("IS ARCHIVED: ", isManual, "  IS GOD MODE: ", setSubscriber)
    getWorkspaceCampaigns(userData, showArchived, "HOOK,SINGLE_BLAST,RETARGET", subscriber)
    // getGodChannels(userData)
    setRefreshing(true);
    // getChannels()
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);


  const isDark = scheme === 'dark'

  const colorScheme = {
    container: isDark ? colors.dark : colors.white,
    text: isDark ? colors.white : colors.primaryText
  }

  const deviceWidth = useWindowDimensions().width
  const deviceHeight = useWindowDimensions().height


  const switchArchive = () => {
    getWorkspaceCampaigns(userData, !showArchived)
    setShowArchived(!showArchived)
  }

  const switchManual = () => {
    if (isManual) {
      getWorkspaceCampaigns(userData, showArchived, "HOOK,SINGLE_BLAST,RETARGET")
    } else {
      getWorkspaceCampaigns(userData, showArchived, "MANUAL")
    }
    setIsManual(!isManual)


  }

  const switchSubscriber = () => {
    if (subscriber) {
      getWorkspaceCampaigns(userData, showArchived, "HOOK,SINGLE_BLAST,RETARGET", "false")
    } else {
      getWorkspaceCampaigns(userData, showArchived, "HOOK,SINGLE_BLAST,RETARGET", "true")
    }

    setSubscriber(!subscriber)
  }

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
    const [isArchived, setIsArchived] = useState(item.archive)



    const statsList = [
      { title: "Sent", value: item.sent },
      { title: "Delivered", value: item.delivered },
      { title: "Responded", value: item.response },
      { title: "Stop", value: item.stop },
      { title: "Spam", value: item.spam },
      { title: "Segments", value: item.total_segments },

    ]


    const handleCampaign = () => {
      navigate.navigate("ViewCampaign", { campaign_id: item?.id })
    }


    const handleArchive = () => {
      const config = {
        method: 'patch',
        url: `https://${process.env.EXPO_PUBLIC_LIVE}/campaigns/${item.id}`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': userData.access_token
        },
        data: {
          archive: !isArchived
        }
      };
      axios(config).then(async (response) => {
        console.log(response.data.record, " : Channel DATA")
        setIsArchived(!isArchived)
        Alert.alert(`Campaign ${item.name} has been ${isArchived ? 'unarchived' : 'archived'}`, '', [
          { text: 'OK', onPress: () => getWorkspaceCampaigns(userData, showArchived) },
        ]);
      }).catch((err) => {
        console.log(err.toJSON(), " Archive Error");

      })
    }

    const created = new Date(item.created_at)


    return (
      <Pressable style={{
        flexDirection: "column", padding: 10, marginVertical: 5,
        backgroundColor: colors.campaignBack, borderRadius: 12
      }}
        onPress={handleCampaign}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, justifyContent: "space-between", paddingBottom: 5 }}>
          <View style={{ flexDirection: "row", gap: 9, flex: 1 }}>
            <Text style={{ maxWidth: "90%", fontSize: 18, fontWeight: "500" }} numberOfLines={1} ellipsizeMode='tail'>{item.name}</Text>

          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
            {
              isArchived ?
                <Pressable style={{ backgroundColor: 'white', borderRadius: 14, opacity: 0.6, padding: 10 }} onPress={handleArchive}>
                  <MaterialCommunityIcons name="archive" size={20} color="black" />
                </Pressable> : <Pressable style={{ backgroundColor: 'white', borderRadius: 14, opacity: 0.6, padding: 10 }} onPress={handleArchive}>
                  <MaterialCommunityIcons name="archive" size={20} color="black" />
                </Pressable>

            }
            <Pressable style={{ backgroundColor: 'white', borderRadius: 14, opacity: 0.6, padding: 10 }} onPress={handleCampaign}>
              <Entypo name="pencil" size={20} color="black" />
            </Pressable>


          </View>

        </View>
        <View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 9, justifyContent: "flex-start", paddingTop: 0 }}>
            {
              statsList.map((stats) => (
                <View style={{ flexDirection: "column", alignItems: "center" }}>
                  <Text style={{ fontSize: 12, fontWeight: "500" }}>{stats.value}</Text>
                  <Text style={{ fontWeight: '500' }}>{stats.title}</Text>
                </View>
              ))
            }
          </View>

        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", paddingTop: 8 }}>
          <View>
            <Text style={{ color: colors.gray, fontSize: 10, fontWeight: "500" }}>{created.getMonth() + "/" + created.getDate() + "/" + created.getFullYear()}</Text>
            <View style={{ flexDirection: "row", gap: 8, alignItems: "center", paddingTop: 5 }}>
              <View style={{
                height: 13, width: 13, borderRadius: 20, backgroundColor: item.type == "HOOK" ? "#48bcfa" : item.type == "SINGLE_BLAST" ? "#fcfc6d"
                  : item.type == "RETARGET" ? "#f5cdc9" : "#f5cdc9"
              }}>

              </View>
              <Text style={{ fontWeight: "500", textDecorationLine: 1, }} >{item.type}</Text>
            </View>
          </View>


          <Text style={{ fontWeight: "600", fontSize: 12, color: colors.stop, borderRadius: 10 }}>{item.status}</Text>

        </View>
      </Pressable>
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
          <View style={{ padding: 12, paddingTop: 0, justifyContent: "space-between", flexDirection: "row", alignItems: "flex-end" }}>

            <View>


              <Text style={{ fontSize: 18, fontWeight: "500" }}>Campaigns</Text>
              <Text style={{ color: colors.grayLight, paddingTop: 5 }}>View and manage your campaigns</Text>
              {/* <MaterialIcons name="account-circle" size={28} color={colors.primaryText} /> */}

            </View>
            <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>


              {
                showArchived ?
                  <View>
                    <Pressable style={{ position: "absolute", height: 70, width: 50, bottom: -25, zIndex: 2 }} onPress={switchArchive} ></Pressable>
                    <MaterialCommunityIcons name="archive" size={24} color="#D13B5E" />
                  </View>
                  :
                  <View>
                    <Pressable style={{ position: "absolute", height: 70, width: 50, bottom: -25, zIndex: 2 }} onPress={switchArchive}></Pressable>
                    <MaterialCommunityIcons name="archive-check-outline" size={24} color="#D13B5E" />
                  </View>
              }
              <Pressable style={{
                backgroundColor: "#0162E8", padding: 10, borderRadius: 20,
                shadowColor: "#000000",
                shadowOpacity: 0.3033,
                shadowRadius: 2.5,
                shadowOffset: {
                  height: 3,
                  width: 1
                },
                elevation: 3,
              }} onPress={() => navigate.navigate("CreateStack")}>
                <Entypo name="plus" size={18} color="white" />
              </Pressable>
            </View>

          </View>
          {
            reveal ? <View style={{ padding: 12, paddingTop: 0 }}>
              <TextInput
                style={{ backgroundColor: colors.lightGrayPurple, color: "black", borderRadius: 12, fontSize: 16, padding: 12, }}
                placeholderTextColor={"gray"}

                placeholder={"Search Campaigns"}

                onChangeText={(value) => setSearch(value)}
                value={search}
                underlineColorAndroid="transparent"

              />
              <View style={{ flexDirection: "row", padding: 10, gap: 10 }}>
                <View style={{ flexDirection: "row", }}>
                  <Switch
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={subscriber ? '#f5dd4b' : '#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={() => switchSubscriber()}
                    style={{
                      transform: [{ scaleX: .75 }, { scaleY: .75 }] // Change the scale as needed
                    }}
                    value={subscriber}
                  />
                  <Text style={{ color: colors.gray, paddingTop: 5 }}>Subscriber</Text>
                </View>
                <View style={{ flexDirection: "row", }}>
                  <Switch
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={isManual ? '#f5dd4b' : '#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={() => switchManual()}
                    style={{
                      transform: [{ scaleX: .75 }, { scaleY: .75 }] // Change the scale as needed
                    }}
                    value={isManual}
                  />
                  <Text style={{ color: colors.gray, paddingTop: 5 }}>Manual</Text>
                </View>
              </View>
              <Pressable style={{ paddingTop: 5 }} onPress={() => setReveal(false)}>
                <Entypo name="chevron-up" size={24} color="black" />
              </Pressable>
            </View> :
              <View style={{ padding: 12, paddingTop: 0, paddingBottom: 5 }}>
                <Pressable onPress={() => setReveal(true)}>
                  <Entypo name="chevron-down" size={24} color="black" />
                </Pressable>
              </View>
          }


        </View>

        <View style={{ ...styles.container, }}>

          <ScrollView style={{ width: deviceWidth, padding: 12 }} nestedScrollEnabled={true}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>

            {search != "" ?
              searchResult.map((item, index) => (
                <Campaign item={item} />
              )) :
              workspaceCampaigns.map((item, index) => (
                <Campaign item={item} />
              ))
            }


            <View style={{ marginBottom: 29 }} />

          </ScrollView>
        </View>

      </>

    </TouchableWithoutFeedback>
  )
}