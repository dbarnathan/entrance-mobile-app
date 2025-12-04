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
import { Entypo, Feather } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useRoute } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function EditWorkspaceUser() {
    const navigation = useNavigation()
    const deviceHeight = useWindowDimensions().height;
    const deviceWidth = useWindowDimensions().width;
    const [refreshing, setRefreshing] = useState(false);
    const { userData, getWorkspaceUsers } = useContext(UserDataContext)
    const { rerender } = useContext(FlagContext)
    const { scheme } = useContext(ColorSchemeContext)
    const [response, setResponse] = useState()
    const [selected, setSelected] = useState("")
    const [removeAll, setRemoveAll] = useState(false)
    const [isExcluded, setIsExcluded] = useState(false)



    const [campaignName, setCampaignName] = useState("")

    const [canCreate, setCanCreate] = useState(false)
    const route = useRoute()



    const [inviteList, setInviteList] = useState([
        {
            email: "",
            firstname: "",
            lastname: "",
            phoneNumber: "",
            isError: false
        }
    ])

    const isDark = scheme === 'dark'

    useEffect(() => {
        console.log("Invite LIST: ", inviteList)
    }, [setInviteList])


    useEffect(() => {


        navigation.getParent()?.setOptions({
            tabBarStyle: {
                display: "none"
            }
        });
    }, [])


    useEffect(() => {
        console.log("SELECTED: ", selected)
        if (campaignName.length > 2 && selected) {
            setCanCreate(true)
        }

    }, [campaignName, selected])

    const handleAdd = () => {
        console.log("Current Invite List: ")

        setInviteList([...inviteList, {
            email: "",
            firstname: "",
            lastname: "",
            phoneNumber: "",
            isError: false
        }])
    }

    const handleInvite = async () => {
        inviteList.forEach((invite, index) => {
            if (!invite.email.includes("@")) {
                Toast.show({
                    type: 'error',
                    position: 'top',
                    text1: 'Error',
                    text2: 'Email is not valid'
                });

                let temp = [...inviteList]
                temp[index].isError = true
                setInviteList(temp)

                return
            } else if (invite.firstname.length < 2) {
                Toast.show({
                    type: 'error',
                    position: 'top',
                    text1: 'Error',
                    text2: 'Please fill first name'
                });
                
                let temp = [...inviteList]
                temp[index].isError = true
                setInviteList(temp)

                return
            } else if (invite.lastname.length < 2) {
                Toast.show({
                    type: 'error',
                    position: 'top',
                    text1: 'Error',
                    text2: 'Please fill in Last name'
                });
                let temp = [...inviteList]
                temp[index].isError = true
                setInviteList(temp)
                return
            } else if (invite.phoneNumber.length < 3) {
                Toast.show({
                    type: 'error',
                    position: 'top',
                    text1: 'Error',
                    text2: 'Please fill in Last name'
                });
                let temp = [...inviteList]
                temp[index].isError = true
                setInviteList(temp)
                return
            }

        })

        await inviteList.forEach(async (invite, index) => {
            console.log("Sedning..")
            await axios.post(`https://${process.env.EXPO_PUBLIC_LIVE}/users`, {
                email: invite.email,
                firstname: invite.firstname,
                lastname: invite.lastname,
                phoneNumber: invite.phoneNumber
            }, { headers: { 'Authorization': userData.access_token } }
        ).then((res) => {
                console.log("INVITE SENT")
            }).catch((err) => {
                console.log("INVITE ERROR: ", err.toJSON())
                
            })
        })

        await getWorkspaceUsers(userData)

        navigation.goBack()
    }



    const User = ({ index, item }) => {

        const [email, setEmail] = useState(inviteList[index].email)
        const [firstName, setFirstName] = useState(inviteList[index].firstname)
        const [lastName, setLastName] = useState(inviteList[index].lastname)
        const [phone, setPhone] = useState(inviteList[index].phoneNumber)

        const handleFirstName = (val) => {
            let temp = inviteList
            temp[index].firstname = val
            temp[index].isError = false
            setFirstName(val)
            setInviteList(temp)
        }

        const handleLastName = (val) => {
            let temp = inviteList
            temp[index].lastname = val
            temp[index].isError = false
            setLastName(val)
            setInviteList(temp)
        }

        const handleEmail = (val) => {
            let temp = inviteList
            temp[index].email = val
            temp[index].isError = false
            setEmail(val)
            setInviteList(temp)
        }

        const handlePhone = (val) => {
            let temp = inviteList
            temp[index].phoneNumber = val
            temp[index].isError = false
            setPhone(val)
            setInviteList(temp)
        }

        const handleRemove = ({ index }) => {

            let temp = [...inviteList]
            temp.splice(index, 1)
            console.log(
                "new list: ", temp
            )
            setInviteList(temp)
        }

        return (
            <View style={{ marginHorizontal: 10, marginVertical: 15, borderColor: item.isError ? colors.pink : colors.border, borderWidth: 1, borderRadius: 12, padding: 10 }}>
                {
                    index > 0 &&
                    <Pressable style={{ paddingBottom: 5, alignItems: "flex-end" }} onPress={() => { handleRemove({ index }) }}>
                        <Feather name="trash" size={18} color="black" />

                    </Pressable>
                }

                <View style={{ flexDirection: "row", width: "100%", gap: 6 }}>

                    <TextInput
                        style={{ backgroundColor: colors.lightGrayPurple, color: "black", borderRadius: 12, fontSize: 16, padding: 12, flex: 1 }}
                        placeholderTextColor={"gray"}

                        placeholder={"First Name"}

                        onChangeText={(value) => handleFirstName(value)}
                        value={firstName}
                        underlineColorAndroid="transparent"

                    />
                    <TextInput
                        style={{ backgroundColor: colors.lightGrayPurple, color: "black", borderRadius: 12, fontSize: 16, padding: 12, flex: 1 }}
                        placeholderTextColor={"gray"}

                        placeholder={"Last Name"}

                        onChangeText={(value) => handleLastName(value)}
                        value={lastName}
                        underlineColorAndroid="transparent"

                    />
                </View>


                <View style={{ flexDirection: "row", gap: 10, justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>

                </View>
                <View style={{ flexDirection: "row", width: "100%", gap: 6 }}>
                    <TextInput
                        style={{ backgroundColor: colors.lightGrayPurple, color: "black", borderRadius: 12, fontSize: 16, padding: 12, flex: 1.4 }}
                        placeholderTextColor={"gray"}

                        placeholder={"Email"}
                        keyboardType='email-address'
                        onChangeText={(value) => handleEmail(value)}
                        value={email}
                        underlineColorAndroid="transparent"

                    />
                    <TextInput
                        style={{ backgroundColor: colors.lightGrayPurple, color: "black", borderRadius: 12, fontSize: 16, padding: 12, flex: 1 }}
                        placeholderTextColor={"gray"}
                        keyboardType={"phone-pad"}
                        placeholder={"Phone Number"}
                        maxLength={11}
                        onChangeText={(value) => handlePhone(value)}
                        value={phone}
                        underlineColorAndroid="transparent"

                    />
                </View>


            </View>
        )
    }

    return (
        <>
            <View style={{ backgroundColor: "white" }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 10, paddingTop: 3 }}>
                    <Feather name="chevron-left" size={30} color="black" />
                </TouchableOpacity>
            </View>
            <KeyboardAwareScrollView bounces={false} keyboardShouldPersistTaps={'always'} keyboardDismissMode="on-drag" style={styles.card}>

                <View style={{ flex: 1 }}>
                    <View style={{ paddingHorizontal: 20 }}>
                        <Text style={{ fontSize: 25, fontWeight: "600" }}>Invite Users</Text>
                        <Text style={{ color: colors.grayLight }}>Add new users to your workspace</Text>
                    </View>

                    {
                        inviteList.map((invite, index) => (
                            <User key={index} index={index} item={invite} />

                        ))
                    }

                    <View style={{ alignItems: "flex-end", paddingRight: 20 }}>
                        <Pressable style={{
                            backgroundColor: "#0162E8", padding: 10, borderRadius: 20,
                            shadowColor: "#000000",
                            shadowOpacity: 0.3033,
                            shadowRadius: 2.5,
                            shadowOffset: {
                                height: 3,
                                width: 1
                            },
                            alignItems: "center",
                            justifyContent: "center",
                            elevation: 3,
                            height: 37,
                            width: 37,
                            zIndex: 10
                        }} onPress={() => { handleAdd() }}>
                            <Entypo name="plus" size={18} color="white" />
                        </Pressable>
                    </View>
                </View>

                <View style={{ marginBottom: deviceHeight * .2 }} ></View>




            </KeyboardAwareScrollView>
            <Pressable style={{
                height: 60, alignSelf: "center", width: "70%",
                backgroundColor: colors.green, flexDirection: "row", borderRadius: 30, position: "absolute",
                alignItems: "center", justifyContent: "center", paddingHorizontal: 12, bottom: 45,
                shadowColor: "#000000",
                shadowOpacity: 0.3033,
                shadowRadius: 2.5,
                shadowOffset: {
                    height: 3,
                    width: 1
                },

                elevation: 3,

            }}
                onPress={() => { handleInvite() }}>

                <Text style={{ fontWeight: "600", fontSize: 16, color: colors.white }}>Invite</Text>

            </Pressable>
        </>


    )
}

