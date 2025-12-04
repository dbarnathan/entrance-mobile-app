import React, { useEffect, useContext, useState, useRef, useCallback } from 'react'
import { Alert, FlatList, Keyboard, Platform, Pressable, SafeAreaView, ScrollView, StatusBar, Switch, Text, TextInput, TouchableWithoutFeedback, View, useWindowDimensions, Image } from 'react-native';
import { UserDataContext } from '../../../context/UserDataContext';
import { ColorSchemeContext } from '../../../context/ColorSchemeContext'
import ScreenTemplate from '../../../components/ScreenTemplate';
import { FontAwesome, FontAwesome5, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';
import { colors, fontSize } from '../../../theme';
import styles from './styles';
import { useNavigation } from '@react-navigation/native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';
import axios from 'axios';
import uFuzzy from '@leeoniya/ufuzzy';
import { WorkspaceUsersEditModal } from '../../../components/WorkspaceUsersEditModal';
import AddFlagModal from '../../../components/AddFlagModal';
import Toast from 'react-native-toast-message';

export default function Flags() {

    const { setUserData, userData, workspaceCampaigns, getFlags, userFlags, getWorkspaceCampaigns } = useContext(UserDataContext)
    const { scheme } = useContext(ColorSchemeContext)
    const navigate = useNavigation()
    const [search, setSearch] = useState('')
    const [searchResult, setSearchResult] = useState([])

    const [showAdd, setShowAdd] = useState(false)


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
        { title: "Settings", color: "#FBBC0B", description: "Adjust various settings of your users, campaigns, and claims here for more control over your workspace.", navigation: "Settings" },
        { title: "Message Management", color: "#0162E8", description: "Manage things like blacklisted words and phrases in your campaign messages before they're sent out.", navigation: "MessageManagement" },
        { title: "API", color: "#FBBC0B", description: "View and manage your api keys, retrieve your current api key, or regenerate a new one if needed.", navigation: "MessageManagement" },
        { title: "10DLC", color: "#22C03C", description: "Register your company for 10DLC to increase the volume and rate of sending messages to customers.", navigation: "10DLC" },
        { title: "Integrations", color: "#0162E8", description: "Integrate a third-party apps into your workspace with our easy to use integrations system.", navigation: "Integrations" },
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

    const Flag = ({ item }) => {

        const [id, setId] = useState("")
        const [isStopped, setIsStopped] = useState(item.stop)
        const [isArchived, setIsArchived] = useState(item.archive)
        const [isExtra, setIsExtra] = useState(false)

        const [userPermissions, setUserPermissions] = useState([])
        const [removedUsers, setRemovedUsers] = useState([])

        const [isEdit, setIsEdit] = useState(false)

        const [newName, setNewName] = useState(item.name)

        const textRef = useRef(null)

        useEffect(() => {
            axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/user-group-assigns?user_group_id=${item?.id}`, {
                headers: {
                    'Authorization': userData.access_token
                }
            }).then((response) => {
                console.log("Campaigns from view: ", response.data.records)

                let temp1 = []
                let temp2 = []

                response.data.records.forEach(async (record) => {
                    let value = await axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/users/${record.user_id}`, {
                        headers: {
                            'Authorization': userData.access_token
                        }
                    }).then((response) => {
                        let temp1 = []
                        console.log("User from view: ", response.data.record)
                        return { id: response.data.record.id, name: response.data.record.firstname + " " + response.data.record.lastname }

                        // return temp1

                    }).catch((err) => {
                        console.log(err.toJSON());
                    })

                    temp1.push(value)
                })

                setUserPermissions(temp1)

                console.log("PERMISSION: ", temp1)

                for (let key in response.data.records) {
                    console.log("Key: ", temp1)
                    let temp11 = temp1

                    // for (let record in temp1) {
                    //     console.log("RECORD: ", record)
                    //     if (temp1[record].id == response.data.records[key].id) {
                    //         temp2.push(record)
                    //     }
                    // }

                    temp11.forEach((record) => {
                        console.log("RECORD: ")
                        if (record.id == response.data.records[key].id) {
                            temp2.push(record)
                        }
                    })

                }

                setRemovedUsers(temp2)

                console.log("Groups from View: ", temp1)

            }).catch((err) => {
                console.log(err.toJSON());
            })
        }, [])

        useEffect(() => {
            if (item.name != newName) {
                axios.put(`https://${process.env.EXPO_PUBLIC_LIVE}/flags/${item?.id}`, { name: newName }, { headers: { 'Authorization': userData.access_token } }).then((response) => {

                    Toast.show({
                        type: 'success',
                        text1: 'Updated',
                        text2: 'Successfully updated Flag Name. 👋'
                    });
                    getFlags(userData)
                }).catch((err) => {
                    console.log(err.response, " :ERROR Patching");

                })
            }

        }, [isEdit])

        useEffect(() => {
            console.log("Remove Focus")
            Keyboard.addListener('keyboardDidHide', () => {
                setIsEdit(false)
                // You can add additional actions here, like updating state
            });
        }, [textRef])

        useEffect(() => {
            if (isEdit) {
                textRef.current?.focus()
                textRef.current?.focus()

            }


        }, [isEdit])

        const handleRemove = () => {
            axios.delete(`https://${process.env.EXPO_PUBLIC_LIVE}/flags/${item.id}`, {
                headers: {
                    'Authorization': userData.access_token
                }
            }).then((response) => {
                console.log("Campaigns from view: ", response.data.records)
                getFlags()
            }).catch((err) => {
                console.log(err.toJSON());
            })
        }


        return (
            <Pressable style={{
                gap: 9, backgroundColor: colors.lightGrayPurple,
                borderRadius: 12, marginVertical: 5, paddingVertical: 10, paddingHorizontal: 5
            }}
            >
                <View style={{ justifyContent: "space-between", flexDirection: "row", alignItems: 'center', width: "100%" }}>
                    <View style={{ flexDirection: 'row', alignItems: "center", gap: 8 }}>

                        {
                            isEdit ?
                                <View style={{ padding: 10, paddingVertical: 11.5, borderRadius: 20, borderColor: "#DFDFDF", borderWidth: 1, alignItems: "center" }} >
                                    <TextInput
                                        style={{ backgroundColor: colors.lightGrayPurple, color: "black", borderRadius: 12, fontSize: 16, padding: 12, borderColor: "#7972BC", borderWidth: 1, }}
                                        placeholderTextColor={"gray"}
                                        ref={textRef}
                                        placeholder={"Type your message here..."}

                                        onChangeText={(value) => setNewName(value)}
                                        value={newName}


                                    />
                                </View>
                                :
                                <Pressable style={{ padding: 10, paddingVertical: 11.5, borderRadius: 20, backgroundColor: "#DFDFDF", alignItems: "center" }} onPress={() => { setIsEdit(true); textRef.current?.focus() }}>
                                    <Text style={{ color: "black", fontSize: 14, fontWeight: "500" }}>{item?.name}</Text>
                                </Pressable>
                        }



                    </View>
                    <View style={{ flexDirection: 'row', gap: 15, paddingRight: 10 }}>
                        <View style={{ padding: 8, height: 20, width: 20, borderRadius: 20, backgroundColor: item?.color_id }}>

                        </View>

                        <Pressable style={{ paddingBottom: 5, alignItems: "flex-end" }} onPress={() => { handleRemove() }}>
                            <Feather name="trash" size={18} color="black" />

                        </Pressable>


                    </View>
                </View>

                {/* {
                    isExtra &&
                    <View style={{ alignItems: "flex-start" }}>
                        <Text style={{ fontWeight: "500", paddingVertical: 5 }}>Grispy User Group</Text>
                        <View style={{ flexDirection: "column", gap: 10, paddingBottom: 15 }}>
                            <Text style={{ color: "black", fontSize: 13, fontWeight: "500", margin: 7, marginHorizontal: 4, marginBottom: 3 }}>Assigned Users</Text>
                            <View style={{ flexDirection: "row", gap: 8 }}>
                                {
                                    userPermissions.map((item, index) => (
                                        <Pressable style={{ backgroundColor: "#23C03D", padding: 12, borderRadius: 12 }} onPress={() => console.log()}>
                                            <Text style={{ color: "white", fontWeight: "500", fontSize: 13, }}>{item.name}</Text>
                                        </Pressable>
                                    ))
                                }

                            </View>

                            <Text style={{ color: "black", fontSize: 13, fontWeight: "500", margin: 7, marginHorizontal: 4 }}>Removed Users</Text>
                            <View style={{ flexDirection: "row", gap: 8 }}>
                                {
                                    removedUsers.map((item, index) => (
                                        <Pressable style={{ backgroundColor: "#D13B5E", padding: 12, borderRadius: 12 }} onPress={() => console.log()}>
                                            <Text style={{ color: "white", fontWeight: "500", fontSize: 13, }}>{item.name}</Text>
                                        </Pressable>
                                    ))
                                }
                            </View>

                        </View>
                    </View>


                } */}
            </Pressable>
        )

    }

    return (
        <TouchableWithoutFeedback style={{}} onPress={() => { Keyboard.dismiss() }}>
            <>

                <AddFlagModal isVisible={showAdd} setIsVisible={setShowAdd} />


                <View style={{ padding: 12, paddingBottom: 8, paddingTop: -12, justifyContent: "space-between", flexDirection: "row", backgroundColor: "white", alignItems: "center" }}>

                    <View style={{ flexDirection: "row", gap: 5, padding: 0, }}>
                        <Pressable style={{ position: "absolute", height: 70, width: 90, top: -15, left: -15 }} onPress={() => { navigation.goBack() }}></Pressable>

                        <FontAwesome5 name="chevron-left" size={22} color="black" />


                    </View>
                    <View style={{}}>
                        <Text style={{ fontSize: 18, fontWeight: "500" }}>Workspace Flags</Text>
                    </View>

                    <View >
                        {/* <Image source={require('../../../../assets/images/purpleE.png')} resizeMode='contain'
                            style={{ alignSelf: "flex-start", height: deviceHeight * .05, width: deviceWidth * .08, }} /> */}
                        <Pressable style={{
                            borderRadius: 28,
                            backgroundColor: colors.lightPurple,
                            padding: 9,

                            shadowColor: "#000000",
                            shadowOpacity: 0.3033,
                            shadowRadius: 2.5,
                            shadowOffset: {
                                height: 3,
                                width: 1
                            },
                            elevation: 5,

                        }}
                            onPress={() => setShowAdd(true)}>
                            <Entypo name="plus" size={18} color="white" />
                        </Pressable>
                    </View>
                </View>
                <View style={{ flexDirection: "row", gap: 10, }}>
                    {/* <Pressable style={[styles.updateButton]} onPress={() => { console.log("Manage User Groups") }}>
            <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>Update</Text>
          </Pressable> */}
                </View>
                <ScrollView nestedScrollEnabled={true} bounces={false}>
                    <View style={{ marginTop: 10 }}></View>
                    <View style={[styles.container, { marginHorizontal: 8 }]}>

                        {
                            userFlags.map((item, index) => (
                                <Flag item={item} />
                            ))
                        }

                    </View>
                    <View style={{ marginBottom: deviceHeight * .2 }} />

                </ScrollView>


            </>

        </TouchableWithoutFeedback>
    )
}