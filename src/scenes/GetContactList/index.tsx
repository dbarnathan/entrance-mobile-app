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
import ShowAllContactsModal from '../../components/ShowAllContactsModal';
import { socket } from '../../sockets/socket';
import { useRoute } from '@react-navigation/native';

export default function GetContactList() {

    const { setUserData, userData, workspaceCampaigns, contactList, contacts, getWorkspaceCampaigns, getContacts, getContactLists } = useContext(UserDataContext)
    const { scheme } = useContext(ColorSchemeContext)
    const navigate = useNavigation()

    const [search, setSearch] = useState('')
    const [searchResult, setSearchResult] = useState([])
    const [reveal, setReveal] = useState(false)

    const [isActive, setIsActive] = useState(false)
    const [isStopped, setIsStopped] = useState(false)

    const [showAll, setShowAll] = useState(true)



    const [selectedInfo, setSelectedInfo] = useState({ isSelected: false, contact: null })

    const route = useRoute()

    const { campaignId } = route.params




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

    useEffect(() => {
        console.log("Selected INFO: ", selectedInfo)
        console.log("C a m p a i g n i d: ", campaignId)
    }, [selectedInfo])

    const handleSelection = (index) => {
        console.log("S E L E C T: ", index)
        setSelectedInfo({ isSelected: true, contact: index })
    }

    const handleSetContactList = () => {
        axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/contact-lists/${contactList[selectedInfo.contact].id}/contacts`, {
            headers: {
                'Authorization': userData.access_token
            },
            params: {
                lastid: 0,
                limit: 999,
                order: "ASC",


            }
        }).then((response) => {
            let allContacts = response.data.records
            let parsedTemp = allContacts.map((contact) => contact.meta.number = contact.number)
           
            let parsed = []
            allContacts.forEach((ele) => {
                parsed.push(ele.meta)
            })

            console.log("What was parsed: ", parsed)
            axios.post(`https://${process.env.EXPO_PUBLIC_LIVE}/campaigns/${campaignId}/contacts`, { contacts: parsed }, { headers: { 'Authorization': userData.access_token } }).then((response) => {
                console.log("Successfully Uploaded contact: ", response)

                Toast.show({
                    type: 'success',
                    text1: 'Updated',
                    text2: 'Successfully uploaded contacts. 👋'
                });
                navigate.goBack()


            }).catch((err) => {
                console.log(err, " :ERROR REMOVING GROUP");

            })
        })
    }




    const ContactList = ({ item, index }) => {
        // console.log("Campaign Component: ", item
        const currentDate = new Date(item?.created_at)
        const [newName, setNewName] = useState(false)
        const [showAllContacts, setShowAllContacts] = useState(false)

        const handleShowAll = (index) => {
            // setSelectedInfo({ isSelected: true, contact: index })
            setShowAllContacts(true)
        }


        return (
            <>
                <ShowAllContactsModal isVisible={showAllContacts} setIsVisible={setShowAllContacts} item={item} />
                <NewContactListName isVisible={newName} setIsVisible={setNewName} item={item}></NewContactListName>
                <Pressable style={{

                    padding: 10, marginVertical: 5,
                    borderRadius: 10,

                    width: '45%', // Adjust to fit two items per row

                    backgroundColor: 'white',

                    margin: 8,
                    borderTopWidth: 2.5,
                    borderTopColor: selectedInfo.contact == index ? "green" : "#0162E8",
                    shadowColor: "#000000",
                    shadowOpacity: 0.3033,
                    shadowRadius: 2.5,
                    shadowOffset: {
                        height: 3,
                        width: 1
                    },
                    elevation: 5,


                }}
                    onPress={() => handleSelection(index)}
                    onLongPress={() => { handleShowAll(index) }}
                >

                    <Text style={{ fontWeight: "500", fontSize: 14, paddingBottom: 5 }}>{item.name}</Text>
                    <Text style={{ color: colors.grayLight, }}>created at: {currentDate.toLocaleDateString()}</Text>
                </Pressable>
            </>
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


                            <Text style={{ fontSize: 18, fontWeight: "500" }}>Choose a Contact Lists</Text>
                            <Text style={{ color: colors.grayLight, paddingTop: 5 }}>View and manage your campaigns</Text>
                            {/* <MaterialIcons name="account-circle" size={28} color={colors.primaryText} /> */}

                        </View>



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
                            <View style={styles.contactList}>
                                {
                                    search != "" ?
                                        searchResult.map((item, index) => (
                                            <ContactList item={item} index={index} />
                                        )) :
                                        contactList.map((item, index) => (
                                            <ContactList item={item} index={index} />
                                        ))
                                }
                            </View>

                        }

                        <View style={{ marginBottom: 29 }} />

                    </ScrollView>
                    {
                        selectedInfo.isSelected &&
                        <View style={{
                            flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 20, borderTopWidth: 1, borderTopColor: colors.seperation, padding: 18, paddingVertical: 12, marginBottom: 30, width: "100%"
                        }}>
                            <View></View>
                            <Text style={{ fontWeight: "600", fontSize: 20 }}>{contactList[selectedInfo?.contact]?.name}</Text>
                            <Pressable style={[styles.updateButton, { backgroundColor: colors.green, paddingVertical: 12 }]} onPress={() => {handleSetContactList()}}>


                                <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>Select</Text>

                            </Pressable>


                        </View>
                    }

                </View>

            </>

        </TouchableWithoutFeedback>
    )
}