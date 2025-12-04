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
import Octicons from '@expo/vector-icons/Octicons';
import AddWebHook from '../../../components/AddWebHook';
import MessageStatusHook from '../../../components/MessageStatusHook';
import Toast from 'react-native-toast-message';


export default function Api() {

    const { setUserData, userData, workspaceCampaigns, getFlags, userFlags, getWorkspaceCampaigns } = useContext(UserDataContext)
    const { scheme } = useContext(ColorSchemeContext)
    const navigate = useNavigation()
    const [apiKeys, setApiKeys] = useState([])

    const [showAdd, setShowAdd] = useState(false)
    const [showMessageStatus, setShowMessageStatus] = useState(false)


    const isDark = scheme === 'dark'

    const deviceWidth = useWindowDimensions().width
    const deviceHeight = useWindowDimensions().height

    const navigation = useNavigation()

    const getApiKeys = async () => {
        axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/user-api-keys?last_id=9999999999999&limit=20&order=DESC`, {
            headers: {
                'Authorization': userData.access_token
            },
        }).then((response) => {
            console.log(response.data.records, "  : API")
            let sort = response.data.records

            setApiKeys(sort)


        }).catch((err) => {
            console.log("CONTACTS ERROR: ", err.toJSON());

        })
    }


    useEffect(() => {
        getApiKeys()
    }, [])



    const KeyValue = ({ item }) => {

        const [userPermissions, setUserPermissions] = useState([])
        const [removedUsers, setRemovedUsers] = useState([])

        const [isEdit, setIsEdit] = useState(false)

        const [newName, setNewName] = useState({})

        const textRef = useRef(null)

        const options = {

            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
        };

        useEffect(() => {
            let value = axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/users/${item.user_id}`, {
                headers: {
                    'Authorization': userData.access_token
                }
            }).then((response) => {
                let temp1 = []
                console.log("User from view: ", response.data.record)
                setNewName({ id: response.data.record.id, name: response.data.record.firstname + " " + response.data.record.lastname })

                // return temp1

            }).catch((err) => {
                console.log(err.toJSON());
            })


            console.log("Result of the user lookup: ", value)

        }, [])

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

        const handleRegenerate = () => {
            Toast.show({
                type: 'success',
                text1: 'Updated',
                text2: 'For changing api keys visit the Entrance Group browser'
            });
            // axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/user-api-keys/${item?.id}/refresh`, {
            //     headers: {
            //         'Authorization': userData.access_token
            //     }
            // }).then((response) => {
            //     console.log("API KEY REGENERATED!!")

            // })
        }


        return (
            <Pressable style={{
                gap: 9, backgroundColor: colors.lightGrayPurple,
                borderRadius: 12, marginVertical: 5, paddingVertical: 10, paddingHorizontal: 5,
                shadowColor: "#000000",
                shadowOpacity: 0.3033,
                shadowRadius: 2.5,
                shadowOffset: {
                    height: 3,
                    width: 1
                },
                elevation: 5,
            }}
            >
                <View style={{ justifyContent: "space-between", flexDirection: "row", alignItems: 'center', width: "100%" }}>
                    <View>
                        <Text style={{ fontSize: 10, color: colors.grayLight, paddingBottom: 5 }}>{item.app_key}</Text>
                        <Text style={{ fontSize: 14, fontWeight: "500" }}>{newName.name}</Text>

                    </View>

                    <View style={{ flexDirection: 'row', gap: 15, paddingRight: 10 }}>
                        <View style={{ padding: 8, height: 20, width: 20, borderRadius: 20, backgroundColor: item?.color_id }}>

                        </View>

                        <Pressable style={{ padding: 10, borderRadius: 10, alignItems: "flex-end", backgroundColor: colors.green }} onPress={() => { handleRegenerate() }}>
                            <Octicons name="key" size={18} color="white" />

                        </Pressable>


                    </View>
                </View>
                <Text style={{ fontSize: 10 }}>{new Date(item?.created_at).toLocaleDateString("en-US", options)} at {new Date(item?.created_at).toLocaleTimeString()}</Text>

            </Pressable>
        )

    }



    return (
        <TouchableWithoutFeedback style={{}} onPress={() => { Keyboard.dismiss() }}>
            <>


                <AddWebHook isVisible={showAdd} setIsVisible={setShowAdd} />
                <MessageStatusHook isVisible={showMessageStatus} setIsVisible={setShowMessageStatus} />

                <View style={{ padding: 12, paddingBottom: 8, paddingTop: -12, justifyContent: "space-between", flexDirection: "row", backgroundColor: "white", alignItems: "center" }}>

                    <View style={{ flexDirection: "row", gap: 5, padding: 0, }}>
                        <Pressable style={{ position: "absolute", height: 70, width: 90, top: -15, left: -15 }} onPress={() => { navigation.goBack() }}></Pressable>

                        <FontAwesome5 name="chevron-left" size={22} color="black" />


                    </View>
                    <View style={{}}>
                        <Text style={{ fontSize: 18, fontWeight: "500", textAlign: "center" }}>API Keys</Text>
                    </View>

                    <View style={{ flexDirection: "row", gap: 8 }} >
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
                            onPress={() => setShowMessageStatus(true)}>
                            <Octicons name="webhook" size={18} color="white" />
                        </Pressable>
                    </View>
                </View>

                <ScrollView nestedScrollEnabled={true} bounces={false}>
                    <View style={{ marginTop: 10 }}></View>
                    <View style={[styles.container, { marginHorizontal: 8 }]}>

                        {
                            apiKeys?.map((item, index) => (
                                <KeyValue item={item} />
                            ))
                        }

                    </View>
                    <View style={{ marginBottom: deviceHeight * .2 }} />

                </ScrollView>


            </>

        </TouchableWithoutFeedback>
    )
}