import React, { useEffect, useState, useContext, useLayoutEffect, useCallback } from 'react'
import { Text, View, ScrollView, StyleSheet, Pressable, useWindowDimensions, Image, FlatList, RefreshControl, Button, ActivityIndicator, Alert, TouchableOpacity, Platform, SafeAreaView, Switch, KeyboardAvoidingView, StatusBar } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { TextInput } from 'react-native';
import { doc, onSnapshot, setDoc, query, collection, getDocs, where, getDoc, orderBy } from 'firebase/firestore';
import { colors, fontSize } from '../../theme'
import { UserDataContext } from '../../context/UserDataContext'
import { FlagContext } from '../../context/FlagContext'
import { ColorSchemeContext } from '../../context/ColorSchemeContext'
import axios from 'axios'
import styles from './styles'
import Toast from 'react-native-toast-message';
import { Keyboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5, FontAwesome6, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function UserSettings() {
    const navigation = useNavigation()
    const deviceHeight = useWindowDimensions().height;
    const deviceWidth = useWindowDimensions().width;
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false);

    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const [notMatchWarning, setNotMatchWarning] = useState(false)
    const [notOldPassword, setNotOldPassword] = useState(false)


    const { userData, setUserData, getFlags, isAlwaysReplaced, setIsAlwaysReplaced, userSettings, setUserSettings } = useContext(UserDataContext)
    const [isEnabled, setIsEnabled] = useState(userSettings.add_email_meta)
    const [phoneNumber, setPhoneNumber] = useState(userSettings.number)
    const [isAuto, setIsAuto] = useState(userSettings.call_forwarding_auto_response)
    const [message, setMessages] = useState(userSettings.call_forwarding_auto_response_message)
    const [verifiedNumber, setVerifiedNumber] = useState(userSettings.verified_number)
    const [isTwoFactor, setIsTwoFactor] = useState(false)

    const { rerender } = useContext(FlagContext)
    const { scheme } = useContext(ColorSchemeContext)

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

    const handleLogOut = async () => {
        await AsyncStorage.clear();
        setUserData('')
    }

    const toggleSwitch = async () => {

        axios.patch(`https://${process.env.EXPO_PUBLIC_LIVE}/users/${userData.user_id}`, { add_email_meta: !isEnabled }, { headers: { 'Authorization': userData.access_token } }).then((response) => {

            console.log("RESPONSE: ", response.data)
            setIsEnabled(!isEnabled)
            Toast.show({
                type: 'success',
                text1: 'Updated',
                text2: 'Successfully updated add email meta. 👋'
            });

        }).catch((err) => {
            console.log(err.response, " :ERROR ADDING EMAIL META");

        })

    }

    const toggleSwitch2 = async () => {

        axios.patch(`https://${process.env.EXPO_PUBLIC_LIVE}/users/${userData.user_id}`, { replace_email_meta: !isAlwaysReplaced }, { headers: { 'Authorization': userData.access_token } }).then((response) => {
            setIsAlwaysReplaced(!isAlwaysReplaced)
            Toast.show({
                type: 'success',
                text1: 'Updated',
                text2: 'Successfully updated replace email meta. 👋'
            });
        }).catch((err) => {
            console.log(err.response, " :ERROR REPLACING EMAIL META");

        })

    }

    const toggleSwitch3 = async () => {

        axios.patch(`https://${process.env.EXPO_PUBLIC_LIVE}/users/${userData.user_id}`, { call_forwarding_auto_response: !isAuto }, { headers: { 'Authorization': userData.access_token } }).then((response) => {
            setIsAuto(!isAuto)
            Toast.show({
                type: 'success',
                text1: 'Updated',
                text2: 'Successfully updated Auto Response. 👋'
            });
        }).catch((err) => {
            console.log(err.response, " :ERROR REPLACING EMAIL META");

        })

    }

    const handleSetMessage = async (text) => {

        axios.patch(`https://${process.env.EXPO_PUBLIC_LIVE}/users/${userData.user_id}`, { call_forwarding_auto_response_message: text }, { headers: { 'Authorization': userData.access_token } }).then((response) => {
            setMessages(text)
            Toast.show({
                type: 'success',
                text1: 'Updated',
                text2: 'Successfully updated Auto Response Message. 👋'
            });
        }).catch((err) => {
            console.log(err.response, " :ERROR REPLACING EMAIL META");

        })


    }

    const handleUpdateForward = async () => {
        setTimeout(() => {
            axios.patch(`https://${process.env.EXPO_PUBLIC_LIVE}/users/${userData.user_id}`, { forward_number: phoneNumber }, { headers: { 'Authorization': userData.access_token } }).then((response) => {

                Toast.show({
                    type: 'success',
                    text1: 'Updated',
                    text2: 'Successfully updated Auto Response Message. 👋'
                });
            }).catch((err) => {
                console.log(err.response, " :ERROR REPLACING EMAIL META");

            })
        }, 2000)

    }

    const handleVerifiedNumber = async () => {

        axios.patch(`https://${process.env.EXPO_PUBLIC_LIVE}/users/${userData.user_id}`, { verified_number: verifiedNumber }, { headers: { 'Authorization': userData.access_token } }).then((response) => {

            Toast.show({
                type: 'success',
                text1: 'Updated',
                text2: 'Successfully updated Verified Number. 👋'
            });
        }).catch((err) => {
            console.log(err.response, " :ERROR REPLACING EMAIL META");

        })

    }


    const handleTwoFactor = async () => {

        axios.patch(`https://${process.env.EXPO_PUBLIC_LIVE}/users/${userData.user_id}`, { two_factor_phone_authentication: !isTwoFactor }, { headers: { 'Authorization': userData.access_token } }).then((response) => {
            setIsTwoFactor(!isTwoFactor)
            Toast.show({
                type: 'success',
                text1: 'Updated',
                text2: 'Successfully updated Two Factor Authentication. 👋'
            });
        }).catch((err) => {
            console.log(err.response, " :ERROR REPLACING EMAIL META");

        })

    }

    const handleUpdatePassword = async () => {

        if (newPassword !== confirmPassword) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Passwords do not match. 👋'
            });
            setNotMatchWarning(true)
            return
        }

        axios.patch(`https://${process.env.EXPO_PUBLIC_LIVE}/users/${userData.user_id}`, { oldPassword: oldPassword, password: newPassword }, { headers: { 'Authorization': userData.access_token } }).then((response) => {
            Toast.show({
                type: 'success',
                text1: 'Updated',
                text2: 'Successfully updated Password. 👋'
            });
        }).catch((err) => {
            if (err.status === 409) {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Old password is incorrect'
                });
                setNotOldPassword(true)
            }
            console.log(err.response, " :ERROR REPLACING EMAIL META");
        })

    }




    return (
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

                        <Pressable style={{ flexDirection: "row", gap: 9, alignItems: 'center' }} onPress={() => { }}>
                            <Text style={{ fontSize: 16 }}>Welcome back <Text style={{ fontWeight: "600" }}>{userData.firstname}</Text></Text>
                            <MaterialIcons name="account-circle" size={28} color={colors.primaryText} />
                        </Pressable>
                    </View>

                </View>
              
            </View>

            <KeyboardAwareScrollView bounces={false} keyboardShouldPersistTaps={'always'} keyboardDismissMode="on-drag" style={{ backgroundColor: "#FAF0DC", height: "100%", }}
                resetScrollToCoords={null}
                enableOnAndroid={true}
                extraScrollHeight={0}
                showsVerticalScrollIndicator={false}>

                <View style={{
                    flexDirection: "row",
                    alignItems: "center", justifyContent: "center",
                    shadowColor: "#000000",
                    shadowOpacity: 0.3033,
                    shadowRadius: 2.5,
                    shadowOffset: {
                        height: 3,
                        width: 1
                    },
                    elevation: 5,
                }}>
                    <View style={{ borderRadius: 12, backgroundColor: "white", margin: 10, padding: 12, flex: 1 }}>
                        <View style={{ paddingHorizontal: 12, alignItems: "flex-start", gap: 3 }}>

                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 }}>
                                <Ionicons name="person" size={20} color={colors.primaryText} />
                                <Text style={{ color: colors.primaryText, fontSize: 14 }}>{userData.firstname} {userData.lastname}</Text>
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 }}>
                                <Ionicons name="mail" size={20} color={colors.primaryText} />
                                <Text style={{ color: colors.primaryText, fontSize: 14 }}>{userData.email}</Text>
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 }}>
                                <Ionicons name="phone-portrait-outline" size={20} color={colors.primaryText} />
                                <Text style={{ color: colors.primaryText, fontSize: 14 }}>User # - {userData.user_id}</Text>
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, marginBottom: 15 }}>
                                <Ionicons name="flag" size={20} color={colors.primaryText} />
                                <Text style={{ color: colors.primaryText, fontSize: 14 }}>Workspace # - {userData.workspace_id}</Text>
                            </View>

                        </View>
                    </View>


                </View>
                <View style={{
                    flexDirection: "row", alignItems: "flex-start", justifyContent: "flex-start",
                    shadowColor: "#000000",
                    shadowOpacity: 0.3033,
                    shadowRadius: 2.5,
                    shadowOffset: {
                        height: 3,
                        width: 1
                    },
                    elevation: 5,
                }}>
                    <View style={{ borderRadius: 12, backgroundColor: "white", margin: 10, padding: 12, flex: 1 }}>
                        <View style={{ flexDirection: 'row', justifyContent: "space-between" }}>
                            <Text style={{ fontWeight: "600", fontSize: 16, paddingBottom: 16 }}>Message Status History</Text>

                        </View>
                        <Text style={{ color: colors.primaryText, fontSize: 14 }}>Set Email Meta</Text>
                        <Text style={{ color: colors.grayLight, fontSize: 14, }}>Enable this to add email to contact's meta</Text>
                        <Switch
                            trackColor={{ false: '#767577', true: '#81b0ff' }}
                            thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={toggleSwitch}
                            style={{
                                transform: [{ scaleX: .75 }, { scaleY: .75 }] // Change the scale as needed
                            }}
                            value={isEnabled}
                        />
                        {
                            isEnabled &&
                            <>
                                <Text style={{ color: colors.primaryText, fontSize: 14, paddingTop: 5 }}>Always Replace Email Meta</Text>
                                <Text style={{ color: colors.grayLight, fontSize: 14 }}>Enable this to add email to contact's meta</Text>
                                <Switch
                                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                                    thumbColor={isAlwaysReplaced ? '#f5dd4b' : '#f4f3f4'}
                                    ios_backgroundColor="#3e3e3e"
                                    onValueChange={toggleSwitch2}
                                    style={{
                                        transform: [{ scaleX: .75 }, { scaleY: .75 }] // Change the scale as needed
                                    }}
                                    value={isAlwaysReplaced}
                                />
                            </>
                        }

                    </View>

                </View>
                <View style={{
                    flexDirection: "row", alignItems: "flex-start", justifyContent: "flex-start",
                    shadowColor: "#000000",
                    shadowOpacity: 0.3033,
                    shadowRadius: 2.5,
                    shadowOffset: {
                        height: 3,
                        width: 1
                    },
                    elevation: 5,
                }}>
                    <View style={{ borderRadius: 12, backgroundColor: "white", margin: 10, padding: 12, flex: 1 }}>
                        <Text style={{ fontWeight: "600", fontSize: 16, paddingBottom: 16 }}>Call Forwarding</Text>
                        <Text style={{ color: colors.primaryText, fontSize: 14, paddingBottom: 9 }}>Forward Call Number</Text>
                        <View style={{ flexDirection: "row", gap: 10, alignItems: "center", paddingBottom: 15 }}>
                            <TextInput
                                style={{ backgroundColor: colors.lightGrayPurple, color: "black", borderRadius: 12, fontSize: 16, padding: 12, borderColor: "#7972BC", borderWidth: 1, width: "65%" }}
                                placeholderTextColor={"gray"}
                                placeholder={"ex. 15555555555"}
                                maxLength={11}
                                keyboardType={"phone-pad"}
                                onChangeText={(value) => setPhoneNumber(value)}
                                value={phoneNumber}


                            />
                            <Pressable style={[styles.updateButton, { backgroundColor: phoneNumber?.length >= 10 ? "#0162E8" : "#A4ACC0" }]} onPress={() => { handleUpdateForward() }}>
                                <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>Update</Text>
                            </Pressable>

                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 5 }}>
                            <View style={{ borderBottomColor: "#BFBFBF", borderBottomWidth: 1, width: "43%" }}></View>
                            <Text style={{ color: "#BFBFBF", marginHorizontal: 10 }}>and</Text>
                            <View style={{ borderBottomColor: "#BFBFBF", borderBottomWidth: 1, width: "43%" }}></View>
                        </View>
                        <Text style={{ color: colors.primaryText, fontSize: 14, paddingTop: 5 }}>Auto-Response On Missed Calls</Text>
                        <Text style={{ color: colors.grayLight, fontSize: 14 }}>Turn this on to auto-respond to any missed forwarded calls</Text>
                        <Switch
                            trackColor={{ false: '#767577', true: '#81b0ff' }}
                            thumbColor={isAuto ? '#f5dd4b' : '#f4f3f4'}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={toggleSwitch3}
                            style={{
                                transform: [{ scaleX: .75 }, { scaleY: .75 }] // Change the scale as needed
                            }}
                            value={isAuto}
                        />

                        {
                            isAuto &&
                            <>
                                <Text style={{ color: colors.primaryText, fontSize: 14, paddingTop: 20, paddingBottom: 10 }}>Auto-Response Message</Text>
                                <TextInput
                                    style={{ backgroundColor: colors.lightGrayPurple, color: "black", borderRadius: 12, fontSize: 16, padding: 12, borderColor: "#7972BC", borderWidth: 1, width: "100%" }}
                                    placeholderTextColor={"gray"}
                                    placeholder={"ex. I'm currently busy, I'll get back to you soon."}
                                    multiline={true}
                                    numberOfLines={4}
                                    onChangeText={(value) => { handleSetMessage(value) }}
                                    value={message} />
                            </>
                        }




                    </View>
                </View>
                <View style={{
                    flexDirection: "row", alignItems: "flex-start", justifyContent: "flex-start",
                    shadowColor: "#000000",
                    shadowOpacity: 0.3033,
                    shadowRadius: 2.5,
                    shadowOffset: {
                        height: 3,
                        width: 1
                    },
                    elevation: 5,
                }}>
                    <View style={{ borderRadius: 12, backgroundColor: "white", margin: 10, padding: 12, flex: 1 }}>
                        <Text style={{ fontWeight: "600", fontSize: 16, paddingBottom: 16 }}>Security</Text>
                        <Text style={{ color: colors.primaryText, fontSize: 14, paddingBottom: 9 }}>Verified Number</Text>
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
                            <Pressable style={[styles.updateButton, { backgroundColor: verifiedNumber?.length >= 10 ? "#0162E8" : "#A4ACC0" }]} onPress={() => { handleVerifiedNumber() }}>
                                <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>Update</Text>
                            </Pressable>

                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 5 }}>
                            <View style={{ borderBottomColor: "#BFBFBF", borderBottomWidth: 1, width: "43%" }}></View>
                            <Text style={{ color: "#BFBFBF", marginHorizontal: 10 }}>and</Text>
                            <View style={{ borderBottomColor: "#BFBFBF", borderBottomWidth: 1, width: "43%" }}></View>
                        </View>
                        <Text style={{ color: colors.primaryText, fontSize: 14, paddingTop: 5 }}>Enable Two-Factor Phone Authentication</Text>
                        <Text style={{ color: colors.grayLight, fontSize: 14 }}>This enables two-factor phone authentication for your account</Text>
                        <Switch
                            trackColor={{ false: '#767577', true: '#81b0ff' }}
                            thumbColor={isTwoFactor ? '#f5dd4b' : '#f4f3f4'}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={handleTwoFactor}
                            style={{
                                transform: [{ scaleX: .75 }, { scaleY: .75 }] // Change the scale as needed
                            }}
                            value={isTwoFactor}
                        />

                        <Text style={{ fontWeight: "600", fontSize: 16, paddingBottom: 16, paddingTop: 20, }}>Update Password</Text>
                        <Text style={{ color: colors.primaryText, fontSize: 14, paddingTop: 0, paddingBottom: 10 }}>Old Password</Text>
                        <TextInput
                            style={{ backgroundColor: colors.lightGrayPurple, color: "black", borderRadius: 12, fontSize: 16, padding: 12, borderColor: notOldPassword ? "red" : "#7972BC", borderWidth: 1, }}
                            placeholderTextColor={"gray"}
                            secureTextEntry={true}
                            onChangeText={(value) => { setNotOldPassword(false); setOldPassword(value) }}
                            value={oldPassword}


                        />
                        <Text style={{ color: colors.primaryText, fontSize: 14, paddingBottom: 10, paddingTop: 20 }}>New Password</Text>
                        <TextInput
                            style={{ backgroundColor: colors.lightGrayPurple, color: "black", borderRadius: 12, fontSize: 16, padding: 12, borderColor: notMatchWarning ? "red" : "#7972BC", borderWidth: 1, }}
                            placeholderTextColor={"gray"}
                            keyboardType="visible-password"
                            onChangeText={(value) => { setNotMatchWarning(false); setNewPassword(value) }}
                            value={newPassword}


                        />
                        <Text style={{ color: colors.primaryText, fontSize: 14, paddingBottom: 10, paddingTop: 20 }}>Retype Password</Text>
                        <TextInput
                            style={{ backgroundColor: colors.lightGrayPurple, color: "black", borderRadius: 12, fontSize: 16, padding: 12, borderColor: notMatchWarning ? "red" : "#7972BC", borderWidth: 1, }}
                            placeholderTextColor={"gray"}
                            keyboardType="visible-password"
                            onChangeText={(value) => { setNotMatchWarning(false); setConfirmPassword(value) }}
                            value={confirmPassword}


                        />

                        <Pressable style={[styles.button, { marginTop: 25, width: "100%" }]} onPress={() => { handleUpdatePassword() }}>
                            <Text style={{ color: "black", fontSize: 12, fontWeight: "600" }}>Update Password</Text>
                        </Pressable>
                    </View>
                </View>
                <Pressable style={[styles.logOut, { marginTop: 10, marginBottom: 30 }]} onPress={() => { handleLogOut() }}>
                    <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>Logout</Text>
                </Pressable>



            </KeyboardAwareScrollView>
        </>



    )
}

