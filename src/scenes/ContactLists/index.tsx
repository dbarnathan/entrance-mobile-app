import React, { useEffect, useContext, useState, useRef, useCallback } from 'react'
import { Alert, FlatList, Keyboard, Platform, Pressable, RefreshControl, SafeAreaView, ScrollView, StatusBar, Switch, Text, TextInput, TouchableWithoutFeedback, View, useWindowDimensions } from 'react-native';
import { UserDataContext } from '../../context/UserDataContext';
import { ColorSchemeContext } from '../../context/ColorSchemeContext'
import ScreenTemplate from '../../components/ScreenTemplate';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';
import { colors, fontSize } from '../../theme';
import styles from './styles';
import { useNavigation } from '@react-navigation/native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import uFuzzy from '@leeoniya/ufuzzy';
import NewContactListName from '../../components/NewContactListName';
import { socket } from '../../sockets/socket';

export default function ContactLists() {

  const { setUserData, userData, workspaceCampaigns, contactList, contacts, getWorkspaceCampaigns, getContacts, getContactLists } = useContext(UserDataContext)
  const { scheme } = useContext(ColorSchemeContext)
  const navigate = useNavigation()

  const [billing, setBilling] = useState({})
  const [showArchived, setShowArchived] = useState(false)
  const [search, setSearch] = useState('')
  const [searchResult, setSearchResult] = useState([])
  const [reveal, setReveal] = useState(false)

  const [isActive, setIsActive] = useState(false)
  const [isStopped, setIsStopped] = useState(false)

  const [showAll, setShowAll] = useState(true)




  const isDark = scheme === 'dark'

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    // console.log("IS ARCHIVED: ", isManual, "  IS GOD MODE: ", setSubscriber)
    getContacts(userData, isStopped, isActive)
    getContactLists(userData)
    // getGodChannels(userData)
    setRefreshing(true);
    // getChannels()
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);


  const deviceWidth = useWindowDimensions().width
  const deviceHeight = useWindowDimensions().height

  const formatPhoneNumber = (e) => {
    let formattedNumber;
    const length = e?.length;

    console.log("EEEEEE: ", e)
    // Filter non numbers
    const regex = () => e.replace(/[^0-9\.]+/g, "");
    // Set area code with parenthesis around it
    const areaCode = () => `(${regex().slice(0, 3)})`;

    // Set formatting for first six digits
    const firstSix = () => `${areaCode()} ${regex().slice(3, 6)}`;

    // Dynamic trail as user types
    const trailer = (start) => `${regex().slice(start,
      regex()?.length)}`;
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


  const getSearchIndexes = useCallback((haystack: string[], needle: string): number[] => {

    if (needle.length < 1) return undefined

    const uf = new uFuzzy({
      intraMode: 1,
    })

    const result = uf.filter(haystack, needle)

    return [...result]

  }, [])

  const showOnlyStopped = () => {
    setIsStopped(!isStopped)
    setIsActive(false)
    getContacts(userData, !isStopped)
  }

  const showOnlyActive = () => {
    setIsActive(!isActive)
    setIsStopped(false)
    getContacts(userData, false, !isActive)
  }

  useEffect(() => {
    socket.Subscribe('CONTACT_LIST', async (data) => {
      console.log(
        "Contact List Updated...", data
      )
      getContacts(userData, isStopped, isActive)
    })
    }, [])

  useEffect(() => {

    console.log("ENV: ", process.env.HOST_NAME)

    if (showAll) {
      const searchCampaignIndexes = getSearchIndexes(contacts.map(item => item?.number), search.replace(/[^a-zA-Z0-9]/g, ''))

      if (!searchCampaignIndexes) return;

      setSearchResult((previous) => {

        if (searchCampaignIndexes?.length < 1) return previous

        const searchItems = searchCampaignIndexes.map((index) => contacts[index])

        return searchItems

      })
    } else {
      const searchCampaignIndexes = getSearchIndexes(contactList.map(item => item?.name), search.replace(/[^a-zA-Z0-9]/g, ''))

      if (!searchCampaignIndexes) return;

      setSearchResult((previous) => {

        if (searchCampaignIndexes?.length < 1) return previous

        const searchItems = searchCampaignIndexes.map((index) => contactList[index])

        return searchItems

      })
    }



  }, [search, contacts, getSearchIndexes, showAll])

  const ContactList = ({ item }) => {
    // console.log("Campaign Component: ", item
    const currentDate = new Date(item?.created_at)
    const [newName, setNewName] = useState(false)

    return (
      <>
        <NewContactListName isVisible={newName} setIsVisible={setNewName} item={item}></NewContactListName>
        <Pressable style={{

          padding: 10, marginVertical: 5,
          borderRadius: 10,

          width: '45%', // Adjust to fit two items per row

          backgroundColor: 'white',

          margin: 8,
          borderTopWidth: 2.5,
          borderTopColor: "#0162E8",
          shadowColor: "#000000",
          shadowOpacity: 0.3033,
          shadowRadius: 2.5,
          shadowOffset: {
            height: 3,
            width: 1
          },
          elevation: 5,

        }}
          onPress={() => navigate.navigate("ViewContactList", { list: item })}
          onLongPress={() => { setNewName(true) }}
        >

          <Text style={{ fontWeight: "500", fontSize: 14, paddingBottom: 5 }}>{item.name}</Text>
          <Text style={{ color: colors.grayLight, }}>created at: {currentDate.toLocaleDateString()}</Text>
        </Pressable>
      </>
    )
  }

  const Contact = ({ item }) => {
    // console.log("Campaign Component: ", item)

    const [id, setId] = useState("")
    const [isStopped, setIsStopped] = useState(item.stop)
    const [isArchived, setIsArchived] = useState(item.archive)
    const [isExtra, setIsExtra] = useState(false)
    const [isActive, setIsActive] = useState(false)

    useEffect(() => {
      console.log("CONTACT FROM TAB: ", item)
    }, [])

    const handleStopped = () => {
      const config = {
        method: 'patch',
        url: `https://${process.env.EXPO_PUBLIC_LIVE}/contacts/${item.id}`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': userData.access_token
        },
        data: {
          stop: !isStopped
        }
      };

      axios(config).then(async (response) => {
        console.log(response.data.record, " : Contacts List Data")
        setIsStopped(!isStopped)
        Toast.show({
          type: 'success',
          text2: `Campaign ${item.number} has been ${isStopped ? 'un-stopped' : 'stopped'}`
        });

        getContacts()
        // Alert.alert(`Campaign ${item.number} has been ${isStopped? 'un-stopped' : 'stopped'}`, '', [
        //   { text: 'OK', onPress: () => getWorkspaceCampaigns(userData, showArchived) },
        // ]);
      }).catch((err) => {
        console.log(err.toJSON(), " Archive Error");

      })
    }

    const options = {
      weekday: 'numeric',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    };



    return (
      <Pressable style={{
        alignItems: "center", gap: 9, backgroundColor: colors.lightGrayPurple,
        borderRadius: 12, marginVertical: 5, paddingVertical: 10, paddingHorizontal: 5
      }} onPress={() => setIsExtra(!isExtra)}
      >
        <View style={{ justifyContent: "space-between", flexDirection: "row", alignItems: 'center', width: "100%" }}>
          <View style={{ flexDirection: 'row', alignItems: "center", gap: 8 }}>

            <View style={{ padding: 10, paddingVertical: 11.5, borderRadius: 20, backgroundColor: "#DFDFDF", alignItems: "center" }} >
              <Text style={{ color: "black", fontSize: 14, fontWeight: "500" }}>{formatPhoneNumber(item?.number?.slice(1))}</Text>
            </View>
            <View style={{ flexDirection: "column", gap: 5, alignItems: "center" }}>

              <View style={{ flexDirection: "column", gap: 5, alignItems: "flex-start" }}>
                <Text style={{ fontWeight: "500", fontSize: 14, color: colors.black }}>{item?.meta?.name ? item?.meta?.name : item?.meta?.username ? item?.meta?.username : item?.meta?.first_name}</Text>
                <Text style={{ fontWeight: "500", fontSize: 12, color: colors.grayLight }}>#{item?.id}</Text>

              </View>
            </View>
          </View>
          <View style={{}}>

            <Pressable style={[styles.button, { backgroundColor: isStopped ? colors.pink : colors.green }]} onPress={() => { handleStopped() }}>
              <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>{isStopped ? "Remove" : "Stop"}</Text>
            </Pressable>
          </View>
          <View style={{ padding: 7 }}>
            <Entypo name="chevron-thin-down" size={18} color="black" />
          </View>
        </View>
        {
          isExtra &&
          <View>
            <Text style={{ fontWeight: "500", paddingVertical: 5 }}>Meta Data</Text>
            {
              item?.meta?.order_id &&
              <View style={{ flexDirection: "row" }}>
                <Text style={{ color: colors.grayLight }}>order_id: </Text>
                <Text style={{ color: colors.black }}>{item?.meta?.order_id}</Text>
              </View>
            }
            {
              item?.meta?.date &&
              <View style={{ flexDirection: "row" }}>
                <Text style={{ color: colors.grayLight }}>date: </Text>
                <Text style={{ color: colors.black }}>{item?.meta?.date}</Text>
              </View>
            }
            {
              item?.meta?.username &&
              <View style={{ flexDirection: "row" }}>
                <Text style={{ color: colors.grayLight }}>username: </Text>
                <Text style={{ color: colors.black }}>{item?.meta?.username}</Text>
              </View>
            }
            {
              item?.meta &&
              <View style={{ flexDirection: "row" }}>
                <Text style={{ color: colors.grayLight }}>name: </Text>
                {
                  item?.meta?.name ? <Text style={{ color: colors.black }}>{item?.meta?.name}</Text> :
                    <Text style={{ color: colors.black }}>{item?.meta?.first_name} {item?.meta?.last_name}</Text>
                }

              </View>
            }
            {
              item?.meta?.person_type &&
              <View style={{ flexDirection: "row" }}>
                <Text style={{ color: colors.grayLight }}>name: </Text>


                <Text style={{ color: colors.black }}>{item?.meta?.person_type}</Text>


              </View>
            }
            {
              item?.meta?.person_category &&
              <View style={{ flexDirection: "row" }}>
                <Text style={{ color: colors.grayLight }}>category: </Text>
                <Text style={{ color: colors.black }}>{item?.meta?.person_category}</Text>
              </View>

            }
            {
              item?.meta?.stream_link &&
              <View style={{ flexDirection: "row" }}>
                <Text style={{ color: colors.grayLight }}>stream_link: </Text>
                <Text style={{ color: colors.black }}>{item?.meta?.stream_link}</Text>
              </View>

            }

          </View>

        }
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
        <View style={{ backgroundColor: "white" }}>
          <View style={{ padding: 12, paddingTop: 0, justifyContent: "space-between", flexDirection: "row", alignItems: "flex-end" }}>

            <View>


              <Text style={{ fontSize: 18, fontWeight: "500" }}>Contact Lists</Text>
              <Text style={{ color: colors.grayLight, paddingTop: 5 }}>View and manage your campaigns</Text>
              {/* <MaterialIcons name="account-circle" size={28} color={colors.primaryText} /> */}

            </View>
            <Pressable style={[styles.button, { backgroundColor: "#0162E8" }]} onPress={() => { setShowAll(!showAll); setSearch("") }}>
              <Text style={{ color: "white", fontSize: 14, fontWeight: "600" }}>{showAll ? "Contacts" : "Show all"}</Text>
            </Pressable>


          </View>
          {
            reveal ? <View style={{ padding: 12, paddingTop: 0 }}>
              <TextInput
                style={{ backgroundColor: colors.lightGrayPurple, color: "black", borderRadius: 12, fontSize: 16, padding: 12, }}
                placeholderTextColor={"gray"}

                placeholder={"Search Contacts"}
                keyboardType='email-address'
                onChangeText={(value) => setSearch(value)}
                value={search}
                underlineColorAndroid="transparent"

              />
              <View style={{ flexDirection: "row", padding: 10, gap: 10 }}>
                {
                  showAll && <>
                    <View style={{ flexDirection: "row", }}>

                      <Switch
                        trackColor={{ false: '#767577', true: '#81b0ff' }}
                        thumbColor={isStopped ? '#f5dd4b' : '#f4f3f4'}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={() => { showOnlyStopped() }}
                        style={{
                          transform: [{ scaleX: .75 }, { scaleY: .75 }] // Change the scale as needed
                        }}
                        value={isStopped}
                      />
                      <Text style={{ color: colors.gray, paddingTop: 5 }}>Show Stopped</Text>
                    </View>
                    <View style={{ flexDirection: "row", }}>
                      <Switch
                        trackColor={{ false: '#767577', true: '#81b0ff' }}
                        thumbColor={isActive ? '#f5dd4b' : '#f4f3f4'}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={() => { showOnlyActive() }}
                        style={{
                          transform: [{ scaleX: .75 }, { scaleY: .75 }] // Change the scale as needed
                        }}
                        value={isActive}
                      />
                      <Text style={{ color: colors.gray, paddingTop: 5 }}>Show Active</Text>
                    </View>
                  </>
                }

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
            {
              showAll ?
                <>
                  {
                    search != "" ?
                      searchResult.map((item, index) => (
                        <Contact item={item} />
                      )) :
                      contacts.map((item, index) => (
                        <Contact item={item} />
                      ))
                  }
                </> : <>
                  <View style={styles.contactList}>
                    {
                      search != "" ?
                        searchResult.map((item, index) => (
                          <ContactList item={item} />
                        )) :
                        contactList.map((item, index) => (
                          <ContactList item={item} />
                        ))
                    }
                  </View>
                </>
            }


            <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>


            </View>

            <View style={{ marginBottom: 29 }} />

          </ScrollView>
        </View>

      </>

    </TouchableWithoutFeedback>
  )
}