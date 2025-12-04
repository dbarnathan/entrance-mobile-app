import React, { useEffect, useState, useContext, useLayoutEffect, useCallback } from 'react'
import { Text, View, ScrollView, StyleSheet, Pressable, useWindowDimensions, Image, FlatList, RefreshControl, Button, ActivityIndicator, Alert, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView, Switch } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { TextInput } from 'react-native';
import { colors, fontSize } from '../../../../theme'
import { UserDataContext } from '../../../../context/UserDataContext'
import { FlagContext } from '../../../../context/FlagContext'
import { ColorSchemeContext } from '../../../../context/ColorSchemeContext'
import axios from 'axios'
import styles from './styles'
import { Feather } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useRoute } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function EditWorkspaceUser() {
    const navigation = useNavigation()
    const deviceHeight = useWindowDimensions().height;
    const deviceWidth = useWindowDimensions().width;
    const [refreshing, setRefreshing] = useState(false);
    const { userData, getCampaigns } = useContext(UserDataContext)
    const { rerender } = useContext(FlagContext)
    const { scheme } = useContext(ColorSchemeContext)
    const [response, setResponse] = useState()
    const [selected, setSelected] = useState("")
    const [removeAll, setRemoveAll] = useState(false)



    const [campaignName, setCampaignName] = useState("")

    const [canCreate, setCanCreate] = useState(false)
    const route = useRoute()

    const { user } = route.params

    const [phoneNumber, setPhoneNumber] = useState(user.number)
    const [verifiedNumber, setVerifiedNumber] = useState(user.verified_number)
    const [blastLimit, setBlastLimit] = useState(user.manual_blast_message_limit.toString())
    const [isExcluded, setIsExcluded] = useState(user.exclude_from_campaigns)

    const isDark = scheme === 'dark'
    const colorScheme = {
        content: isDark ? styles.darkContent : styles.lightContent,
        text: isDark ? colors.white : colors.primaryText
    }
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);

    const typeList = [
        { label: "Single Blast", id: "SINGLE_BLAST" }, { label: "Burst", id: "BURST" }, { label: "Hook", id: "HOOK" }, { label: "Scheduled", id: "SCHEDULED" }, { label: "Personal", id: "PERSONAL" }
    ]

    useEffect(() => {


        navigation.getParent()?.setOptions({
            tabBarStyle: {
                display: "none"
            }
        });
    }, [])

    const toggleSwitch = async () => {


        axios.patch(`https://${process.env.EXPO_PUBLIC_LIVE}/users/${userData.user_id}`, { exclude_from_campaigns: !removeAll }, { headers: { 'Authorization': userData.access_token } }).then((response) => {

            console.log("RESPONSE: ", response.data)

            Toast.show({
                type: 'success',
                text1: 'Updated',
                text2: 'Successfully updated add email meta. 👋'
            });

            setRemoveAll(!removeAll)

        }).catch((err) => {
            console.log(err.response, " :ERROR ADDING EMAIL META");

        })

    }

    const handleBlastLimit = async (limit) => {
        await setBlastLimit(limit)
        console.log("SEE LIMIT: ", limit)
        axios.patch(`https://${process.env.EXPO_PUBLIC_LIVE}/users/${userData.user_id}`, { manual_blast_message_limit: Number(limit) }, { headers: { 'Authorization': userData.access_token } }).then((response) => {

            console.log("RESPONSE: ", response.data)

            Toast.show({
                type: 'success',
                text1: 'Updated',
                text2: 'Successfully updated add email meta. 👋'
            });

         

        }).catch((err) => {
            console.log(err.response, " :ERROR ADDING EMAIL META");

        })
    }

    useEffect(() => {
        console.log("SELECTED: ", selected)
        if (campaignName.length > 2 && selected) {
            setCanCreate(true)
        }

    }, [campaignName, selected])

    useEffect(() => {
        console.log("USER: ", user)
    }, [])

    return (
        <KeyboardAwareScrollView bounces={false} keyboardShouldPersistTaps={'always'} keyboardDismissMode="on-drag" >
            <View>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 10, paddingTop: 3 }}>
                    <Feather name="chevron-left" size={30} color="black" />
                </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
                <View style={{ paddingHorizontal: 20 }}>
                    <Text style={{ fontSize: 25, fontWeight: "600" }}>User Groups</Text>
                    <Text style={{ color: colors.grayLight }}>Create and Edit User Groups</Text>
                </View>
                <View style={{ height: "160%", marginBottom: 70, }}>

                    <View style={{ padding: 20, paddingTop: 32 }}>

                        <View style={{ gap: 12, paddingBottom: 10, flexDirection: "row", alignItems: 'center' }}>
                            <Text style={{ fontSize: 14, color: "black" }}>Id:</Text>

                            <Text style={{ fontWeight: "500" }}>{user.id}</Text>
                        </View>
                        <View style={{ gap: 12, paddingBottom: 10, flexDirection: "row", alignItems: 'center' }}>
                            <Text style={{ fontSize: 14, color: "black" }}>Email:</Text>
                            <Text style={{ fontWeight: "500" }}>{user.email}</Text>
                        </View>
                        <View style={{ gap: 12, paddingBottom: 10, flexDirection: "row", alignItems: 'center' }}>
                            <Text style={{ fontSize: 14, color: "black" }}>Name:</Text>
                            <Text style={{ fontWeight: "500" }}>{user.lastname} {user.firstname}</Text>
                        </View>
                        <View style={{ gap: 12, paddingBottom: 10, flexDirection: "row", alignItems: 'center' }}>
                            <Text style={{ fontSize: 14, color: "black" }}>Role/Permission:</Text>
                            <Text style={{ fontWeight: "500" }}>{user.permission}</Text>
                        </View>
                        <View style={{ gap: 12, paddingBottom: 10, flexDirection: "row", alignItems: 'center' }}>
                            <Text style={{ fontSize: 14, color: "black" }}>Claim Limit:</Text>
                            <Text style={{ fontWeight: "500" }}>{user.claim_limit}</Text>
                        </View>
                        <View style={{ gap: 12, paddingBottom: 10, flexDirection: "row", alignItems: 'center' }}>
                            <Text style={{ fontSize: 14, color: "black" }}>Claim Time:</Text>
                            <Text style={{ fontWeight: "500" }}>{user.claim_time}</Text>
                        </View>
                    </View>
                    <View style={{ gap: 12, paddingBottom: 25, flexDirection: "row", width: "115%", flexWrap: 'wrap', paddingHorizontal: 20 }}>
                        <Text style={{ color: colors.primaryText, fontSize: 14, paddingBottom: 2 }}>Call Forwarding</Text>
                        <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                            <TextInput
                                style={{ backgroundColor: colors.lightGrayPurple, color: "black", borderRadius: 12, fontSize: 16, padding: 12, borderColor: "#7972BC", borderWidth: 1, width: "65%" }}
                                placeholderTextColor={"gray"}
                                placeholder={"ex. 15555555555"}
                                maxLength={11}
                                keyboardType={"phone-pad"}
                                onChangeText={(value) => setPhoneNumber(value)}
                                value={phoneNumber}


                            />
                            <Pressable style={[styles.updateButton, { backgroundColor: phoneNumber?.length >= 10 ? "#0162E8" : "#A4ACC0" }]} onPress={() => { }}>
                                <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>Save</Text>
                            </Pressable>


                        </View>
                        <Text style={{ color: colors.primaryText, fontSize: 14, paddingBottom: 2 }}>Verified Number</Text>
                        <View style={{ flexDirection: "row", gap: 10, alignItems: "center", paddingBottom: 15 }}>
                            <TextInput
                                style={{ backgroundColor: colors.lightGrayPurple, color: "black", borderRadius: 12, fontSize: 16, padding: 12, borderColor: "#7972BC", borderWidth: 1, width: "65%" }}
                                placeholderTextColor={"gray"}
                                placeholder={"ex. 15555555555"}
                                maxLength={11}
                                keyboardType={"phone-pad"}
                                onChangeText={(value) => setVerifiedNumber(value)}
                                value={verifiedNumber}


                            />
                            <Pressable style={[styles.updateButton, { backgroundColor: phoneNumber?.length >= 10 ? "#0162E8" : "#A4ACC0" }]} onPress={() => { }}>
                                <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>Save</Text>
                            </Pressable>


                        </View>
                        <View style={{ marginTop: 10, marginBottom: 45 }}>
                            <View style={{ flexDirection: "row", gap: 12, justifyContent: "space-between", alignItems: "center", paddingBottom: 10 }}>
                                <Text style={{ color: colors.black, fontSize: 14, fontWeight: "500" }}>Exclude from Campaigns</Text>
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

                            <Text style={{ color: colors.primaryText, fontSize: 14, paddingBottom: 2 }}>Manual Blast Limit</Text>
                            <View style={{ flexDirection: "row", gap: 10, alignItems: "center", paddingBottom: 15 }}>
                                <TextInput
                                    style={{ backgroundColor: colors.lightGrayPurple, color: "black", borderRadius: 12, fontSize: 16, padding: 12, borderColor: "#7972BC", borderWidth: 1, width: "65%" }}
                                    placeholderTextColor={"gray"}
                                    placeholder={"limit"}
                                    maxLength={11}
                                    keyboardType={"phone-pad"}
                                    onChangeText={(value) => handleBlastLimit(value)}
                                    value={blastLimit}


                                />



                            </View>




                        </View>

                    </View>

                </View>
            </View>



        </KeyboardAwareScrollView>
    )
}

