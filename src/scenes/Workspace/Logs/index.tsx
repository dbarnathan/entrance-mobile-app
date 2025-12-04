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

export default function WorkspaceLogs() {

    const { setUserData, userData, workspaceCampaigns, getFlags, userFlags, getWorkspaceCampaigns } = useContext(UserDataContext)
    const { scheme } = useContext(ColorSchemeContext)
    const navigate = useNavigation()
    const [search, setSearch] = useState('')
    const [searchResult, setSearchResult] = useState([])

    const [logs, setLogs] = useState([])

    const [showAdd, setShowAdd] = useState(false)


    const isDark = scheme === 'dark'

    const deviceWidth = useWindowDimensions().width
    const deviceHeight = useWindowDimensions().height

    const navigation = useNavigation()


    useEffect(() => {
        axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/workspace-logs?lastid=0&limit=20&order=ASC`, {
            headers: {
                'Authorization': userData.access_token
            }
        }).then((response) => {
            console.log("Campaigns from view: ", response.data.records)

            let temp1 = []
            let temp2 = []

            setLogs(response.data.records)

            console.log("Groups from View: ", temp1)

        }).catch((err) => {
            console.log(err.toJSON());
        })
    }, [])



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

    const Log = ({ item }) => {


        const [userPermissions, setUserPermissions] = useState([])
        const [removedUsers, setRemovedUsers] = useState([])

        const [isEdit, setIsEdit] = useState(false)
        const [isExtra, setIsExtra] = useState(false)

        const [newName, setNewName] = useState(item.name)

        const textRef = useRef(null)

        const options = {

            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
        };


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
                onPress={() => setIsExtra(!isExtra)}
            >

                <View style={{ justifyContent: "space-between", flexDirection: "row", alignItems: 'center', width: "100%" }}>
                    <View style={{ flexDirection: 'row', alignItems: "center", gap: 8 }}>



                        <Pressable style={{ padding: 10, paddingVertical: 11.5, borderRadius: 20, backgroundColor: "#DFDFDF", alignItems: "center" }}>
                            <Text style={{ color: "black", fontSize: 12, fontWeight: "500" }}>{item?.type.toLowerCase()}</Text>
                        </Pressable>
                        {
                            !isExtra &&
                            <View >{item?.record?.type == "ARCHIVE_CHANNEL" ? <Text style={{ color: "black", maxWidth: 150 }} numberOfLines={1} ellipsizeMode='tail'>{item?.record?.userName} has archived channel {item?.record?.number}</Text> :
                                item?.record?.type == "REASSIGN_CHANNEL" ? <Text style={{ color: "black", maxWidth: 150 }} numberOfLines={1} ellipsizeMode='tail'>{item?.record?.userName} has reassigned channel {item?.record?.number} from user {item?.record?.number?.prev_assigned_to} to {item?.record?.number?.new_assigned_to}</Text> :
                                    <Text style={{ color: "black", maxWidth: 150 }} numberOfLines={1} ellipsizeMode='tail'>{item?.record?.userName} created campaign named {item?.record?.campaignName}</Text>
                            }
                            </View>
                        }





                    </View>
                    <View style={{ flexDirection: 'row', gap: 15, paddingRight: 10 }}>

                        <Text style={{ color: colors.grayLight }}>{new Date(item?.created_at).toLocaleDateString("en-US", options)}</Text>

                    </View>
                </View>

                {
                    isExtra &&
                    <View style={{ alignItems: "flex-start" }}>
                        <Text style={{ fontWeight: "500", paddingVertical: 5 }}>Logs</Text>
                        <View style={{ flexDirection: "column", gap: 10, paddingBottom: 15 }}>
                            <View >{item?.record?.type == "ARCHIVE_CHANNEL" ? <Text style={{ color: "black", }} >{item?.record?.userName} has archived channel {item?.record?.number}</Text> :
                                item?.record?.type == "REASSIGN_CHANNEL" ? <Text style={{ color: "black", }} >{item?.record?.userName} has reassigned channel {item?.record?.number} from user {item?.record?.number?.prev_assigned_to} to {item?.record?.number?.new_assigned_to}</Text> :
                                    <Text style={{ color: "black", }} >{item?.record?.userName} created campaign named {item?.record?.campaignName}</Text>
                            }
                            </View>

                        </View>
                    </View>


                }
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
                        <Text style={{ fontSize: 18, fontWeight: "500" }}>Workspace Logs</Text>
                    </View>

                    <View >
                        {/* <Image source={require('../../../../assets/images/purpleE.png')} resizeMode='contain'
                            style={{ alignSelf: "flex-start", height: deviceHeight * .05, width: deviceWidth * .08, }} /> */}
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
                            logs.map((item, index) => (
                                <Log item={item} />
                            ))
                        }

                    </View>
                    <View style={{ marginBottom: deviceHeight * .2 }} />

                </ScrollView>


            </>

        </TouchableWithoutFeedback>
    )
}