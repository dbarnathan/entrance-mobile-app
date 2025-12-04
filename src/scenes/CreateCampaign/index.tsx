import React, { useEffect, useState, useContext, useLayoutEffect, useCallback } from 'react'
import { Text, View, ScrollView, StyleSheet, Pressable, useWindowDimensions, Image, FlatList, RefreshControl, Button, ActivityIndicator, Alert, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView, Switch } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { TextInput } from 'react-native';
import { doc, onSnapshot, setDoc, query, collection, getDocs, where, getDoc, orderBy } from 'firebase/firestore';
import { colors, fontSize } from '../../theme'
import { UserDataContext } from '../../context/UserDataContext'
import { FlagContext } from '../../context/FlagContext'
import { ColorSchemeContext } from '../../context/ColorSchemeContext'
import axios from 'axios'
import styles from './styles'
import { StatusBar } from 'react-native'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { Keyboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

export default function CreateCampaign() {
    const navigation = useNavigation()
    const deviceHeight = useWindowDimensions().height;
    const deviceWidth = useWindowDimensions().width;
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false);
    const { userData, getWorkspaceCampaigns } = useContext(UserDataContext)
    const { rerender } = useContext(FlagContext)
    const { scheme } = useContext(ColorSchemeContext)
    const [response, setResponse] = useState()
    const [selected, setSelected] = useState("")
    const [removeAll, setRemoveAll] = useState(false)
    const [isExcluded, setIsExcluded] = useState(false)

    const [campaignName, setCampaignName] = useState("")

    const [canCreate, setCanCreate] = useState(false)

    const isDark = scheme === 'dark'

    const typeList = [
        { label: "Single Blast", id: "SINGLE_BLAST" }, { label: "Burst", id: "BURST" }, { label: "Hook", id: "HOOK" }, { label: "Scheduled", id: "SCHEDULED" }, { label: "Personal", id: "PERSONAL" }
    ]

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

    const toggleSwitch = async () => {
        setRemoveAll(!removeAll)

        // axios.patch(`https://${process.env.EXPO_PUBLIC_LIVE}/users/${userData.user_id}`, { add_email_meta: !isEnabled }, { headers: { 'Authorization': userData.access_token } }).then((response) => {

        //     console.log("RESPONSE: ", response.data)

        //     Toast.show({
        //         type: 'success',
        //         text1: 'Updated',
        //         text2: 'Successfully updated add email meta. 👋'
        //     });

        // }).catch((err) => {
        //     console.log(err.response, " :ERROR ADDING EMAIL META");

        // })

    }

    const toggleExcludedSwitch = async () => {
        setIsExcluded(!isExcluded)
    }

    useEffect(() => {
        console.log("SELECTED: ", selected)
        if (campaignName.length > 2 && selected) {
            setCanCreate(true)
        }

    }, [campaignName, selected])

    const handleCreate = async () => {
        console.log("CREATING CAMPAIGN")
   
        axios.post(`https://${process.env.EXPO_PUBLIC_LIVE}/campaigns`, {name: campaignName, type: selected, remove_all_permissions: removeAll, include_excluded_users: isExcluded }, { headers: { 'Authorization': userData.access_token } }).then((response) => {

            console.log("RESPONSE: ", response.data)
            getWorkspaceCampaigns(userData, false, "HOOK,SINGLE_BLAST,RETARGET", false)
            navigation.goBack()
            Toast.show({
                type: 'success',
                text2: 'Successfully created a new campaign. 👋'
            });

        }).catch((err) => {
            console.log(err, " :ERROR CREATING CAMPAIGN");

        })
    }

    return (
        <KeyboardAvoidingView
            style={{ height: '100%', backgroundColor: "white", flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}

        >
            <View>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 10, paddingTop: 3 }}>
                    <Feather name="chevron-left" size={30} color="black" />
                </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 25, fontWeight: "600", paddingHorizontal: 20 }}>Create a New Campaign</Text>
                <View style={{ height: "160%", marginBottom: 70, }}>
                    <View style={{ padding: 20, paddingTop: 32 }}>

                        <View style={{ gap: 12, paddingBottom: 25 }}>
                            <Text style={{ fontSize: 14, color: "black" }}>Campaign Name</Text>

                            <TextInput
                                style={{ backgroundColor: colors.lightGrayPurple, color: "black", borderRadius: 12, fontSize: 16, padding: 12, borderColor: "#7972BC", borderWidth: 1 }}
                                placeholderTextColor={"gray"}
                                placeholder={"Name Your Campaign"}
                                onChangeText={(value) => setCampaignName(value)}
                                value={campaignName}
                                underlineColorAndroid="transparent"
                            />
                        </View>
                        <View style={{ gap: 12, paddingBottom: 25, flexDirection: "row", width: "115%", flexWrap: 'wrap' }}>
                            {
                                typeList.map((type) => (
                                    <Pressable style={[styles.button, { backgroundColor: selected == type.id ? "#22C03C" : "white", borderWidth: selected == type.id ? 0 : 1 }]} onPress={() => { setSelected(type.id) }}>
                                        <Text style={{ color: selected == type.id ? "white" : "black", fontSize: 14 }}>{type.label}</Text>

                                    </Pressable>
                                ))
                            }



                        </View>
                        <View style={{ marginTop: 10, marginBottom: 45 }}>
                            {
                                selected != "PERSONAL" ?
                                    <>
                                        <Text style={{ fontSize: 14, color: "black" }}>Permissions</Text>
                                        <View style={{ flexDirection: "row", gap: 12, justifyContent: "space-between", alignItems: "center" }}>
                                            <Text style={{ color: colors.grayLight, fontSize: 14, }}>Remove all users from campaign</Text>
                                            <Switch
                                                trackColor={{ false: '#767577', true: '#81b0ff' }}
                                                thumbColor={removeAll ? '#f5dd4b' : '#f4f3f4'}
                                                ios_backgroundColor="#3e3e3e"
                                                onValueChange={toggleSwitch}
                                                style={{
                                                    transform: [{ scaleX: Platform.OS == "ios" ? .75 : 1.5 }, { scaleY: Platform.OS == "ios" ? .75 : 1.5 }] // Change the scale as needed
                                                }}
                                                value={removeAll}
                                            />

                                        </View>
                                        <View style={{ flexDirection: "row", gap: 12, justifyContent: "space-between", alignItems: "center" }}>
                                            <Text style={{ color: colors.grayLight, fontSize: 14, }}>Add excluded users to campaign</Text>
                                            <Switch
                                                trackColor={{ false: '#767577', true: '#81b0ff' }}
                                                thumbColor={isExcluded ? '#f5dd4b' : '#f4f3f4'}
                                                ios_backgroundColor="#3e3e3e"
                                                onValueChange={toggleExcludedSwitch}
                                                style={{
                                                    transform: [{ scaleX: Platform.OS == "ios" ? .75 : 1.5 }, { scaleY: Platform.OS == "ios" ? .75 : 1.5 }] // Change the scale as needed
                                                }}
                                                value={isExcluded}
                                            />

                                        </View>
                                    </> : ""
                            }




                        </View>
                        <Pressable style={[styles.createButton, { backgroundColor: canCreate ? "#22C03C" : "#A4ACC0" }]} onPress={() => { handleCreate() }}>
                            <Text style={{ color: canCreate ? "white" : "white", fontSize: 14 }}>Create</Text>

                        </Pressable>
                    </View>
                </View>
            </View>



        </KeyboardAvoidingView>
    )
}

