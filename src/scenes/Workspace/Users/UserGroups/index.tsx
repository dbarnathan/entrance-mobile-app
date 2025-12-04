import React, { useEffect, useState, useContext, useLayoutEffect, useCallback, useRef } from 'react'
import { Text, View, ScrollView, StyleSheet, Pressable, useWindowDimensions, Keyboard, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView, Switch } from 'react-native'
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

export default function UserGroups() {
    const navigation = useNavigation()
    const deviceHeight = useWindowDimensions().height;
    const deviceWidth = useWindowDimensions().width;
    const [refreshing, setRefreshing] = useState(false);
    const { userData, getWorkspaceUsers, userGroups, workspaceUsers } = useContext(UserDataContext)
    const { rerender } = useContext(FlagContext)
    const { scheme } = useContext(ColorSchemeContext)
    const [response, setResponse] = useState()
    const [selected, setSelected] = useState("")

    const [userPermissions, setUserPermissions] = useState([])
    const [removedUsers, setRemovedUsers] = useState([])



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
        console.log("CURRENT USER GROUPS: ", userGroups)

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

    const UserGroup = ({ item }) => {
        // console.log("Campaign Component: ", item)

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
            console.log("User Group Item: ", item)
        }, [])

        const handleRemoveUsers = (index) => {
            axios.delete(`https://${process.env.EXPO_PUBLIC_LIVE}/user-group-assigns/${userPermissions[index].id}`, { headers: { 'Authorization': userData.access_token } }).then((response) => {
                console.log("Successfully removed group")

            }).catch((err) => {
                console.log(err, " :ERROR REMOVING GROUP");

            })
            setRemovedUsers([...removedUsers, userPermissions[index]])
            setUserPermissions(userPermissions.filter((_, i) => i !== index))
        }

        const handleAddUser = (index) => {
            axios.post(`https://${process.env.EXPO_PUBLIC_LIVE}/user-group-assigns`, { user_id: removedUsers[index].id, user_group_id: item.id },
                {
                    headers: { 'Authorization': userData.access_token }
                },


            ).then((response) => {
                console.log("Successfully added group")

            }).catch((err) => {
                console.log(err, " :ERROR ADDING GROUP");

            })
            setUserPermissions([...userPermissions, removedUsers[index]])
            setRemovedUsers(removedUsers.filter((_, i) => i !== index))
        }

        const handleDeleteGroup = () => {
            axios.delete(`https://${process.env.EXPO_PUBLIC_LIVE}/user-groups/${item.id}`, { headers: { 'Authorization': userData.access_token } }).then((response) => {
                console.log("Successfully removed user group")

            }).catch((err) => {
                console.log(err, " :ERROR REMOVING GROUP");

            })
        }


        useEffect(() => {
            axios
                .get(`https://${process.env.EXPO_PUBLIC_LIVE}/user-group-assigns?user_group_id=${item?.id}`, {
                    headers: {
                        Authorization: userData.access_token,
                    },
                })
                .then(async (response) => {
                    console.log("Campaigns from view: ", response.data.records);

                    // Fetch all user details in parallel using Promise.all
                    const userFetchPromises = response.data.records.map((record) =>
                        axios
                            .get(`https://${process.env.EXPO_PUBLIC_LIVE}/users/${record.user_id}`, {
                                headers: {
                                    Authorization: userData.access_token,
                                },
                            })
                            .then((res) => (res.data.record))
                            .catch((err) => {
                                console.error("Error fetching user data:", err.toJSON());
                                return null; // Handle errors by returning null or an empty object
                            })
                    );

                    // Wait for all requests to finish and filter out any null values (failed requests)
                    let temp1 = (await Promise.all(userFetchPromises)).filter(Boolean);


                    setUserPermissions(temp1);

                    // Continue with the rest of the logic after temp1 is fully populated
                    let temp2 = []
                    let removeList = []


                    // temp2.filter(item => !temp1.includes(item.id));

                    temp1.forEach((ele, indx) => {
                        workspaceUsers.forEach((record) => {

                            if (record?.id == ele?.id) {
                                removeList.push(record)
                            } else {
                                temp2.push(record)
                            }
                        });
                    });

                    temp2 = temp2.filter(item => !removeList.includes(item));

                    setRemovedUsers(temp2);

                })
                .catch((err) => {
                    console.error("Error fetching user-group assignments:", err.toJSON());
                });
        }, [item, userData.access_token, workspaceUsers]);

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


        return (
            <Pressable style={{
                gap: 9, backgroundColor: colors.lightGrayPurple,
                borderRadius: 12, marginVertical: 5, paddingVertical: 10, paddingHorizontal: 5
            }} onPress={() => setIsExtra(!isExtra)}
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
                                </View> :
                                <Pressable style={{ padding: 10, paddingVertical: 11.5, borderRadius: 20, backgroundColor: "#DFDFDF", alignItems: "center" }} onPress={() => { setIsEdit(!isEdit); textRef.current?.focus() }}>
                                    <Text style={{ color: "black", fontSize: 14, fontWeight: "500" }}>{item?.name}</Text>
                                </Pressable>

                        }



                    </View>
                    <View style={{ flexDirection: 'row', gap: 5 }}>
                        <Pressable style={{ padding: 8, borderRadius: 8, backgroundColor: colors.pink }} onPress={() => { handleDeleteGroup() }}>
                            <Feather name="trash" size={15} color="white" />
                        </Pressable>

                        {
                            isExtra ?
                                <View style={{ padding: 7 }}>
                                    <Entypo name="chevron-thin-up" size={18} color="black" />
                                </View> :
                                <View style={{ padding: 7 }}>
                                    <Entypo name="chevron-thin-down" size={18} color="black" />
                                </View>
                        }


                    </View>
                </View>



                {
                    isExtra &&
                    <View style={{ alignItems: "flex-start" }}>
                        <Text style={{ fontWeight: "500", paddingVertical: 5 }}>Users apart of Group</Text>
                        <View style={{ flexDirection: "column", gap: 10, paddingBottom: 15 }}>
                            <Text style={{ color: "black", fontSize: 13, fontWeight: "500", margin: 7, marginHorizontal: 4, marginBottom: 3 }}>Assigned Users</Text>
                            <View style={{ flexDirection: "row", gap: 8 }}>
                                {
                                    userPermissions.map((item, index) => (
                                        <Pressable style={{ backgroundColor: "#23C03D", padding: 12, borderRadius: 12 }} onPress={() => handleRemoveUsers(index)}>
                                            <Text style={{ color: "white", fontWeight: "500", fontSize: 13, }}>{item.firstname} {item.lastname}</Text>
                                        </Pressable>
                                    ))
                                }

                            </View>

                            <Text style={{ color: "black", fontSize: 13, fontWeight: "500", margin: 7, marginHorizontal: 4 }}>Removed Users</Text>
                            <View style={{ flexDirection: "row", gap: 8 }}>
                                {
                                    removedUsers.map((item, index) => (
                                        <Pressable style={{ backgroundColor: colors.grayLight, padding: 12, borderRadius: 12 }} onPress={() => handleAddUser(index)}>
                                            <Text style={{ color: "white", fontWeight: "500", fontSize: 13, }}>{item.firstname} {item.lastname}</Text>
                                        </Pressable>
                                    ))
                                }
                            </View>

                        </View>
                    </View>


                }
            </Pressable>
        )
    }

    return (
        <>
            <View style={{ backgroundColor: "white" }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 10, paddingTop: 3, paddingBottom: 0 }}>
                    <Feather name="chevron-left" size={30} color="black" />
                </TouchableOpacity>
                <View style={{ paddingHorizontal: 20, paddingBottom: 5 }}>
                    <Text style={{ fontSize: 25, fontWeight: "600" }}>User Groups</Text>
                    <Text style={{ color: colors.grayLight }}>Add new users to your workspace</Text>
                </View>

            </View>
            <KeyboardAwareScrollView bounces={false} keyboardShouldPersistTaps={'always'} keyboardDismissMode="on-drag" style={styles.card}>

                <View style={{ flex: 1, paddingHorizontal: 10 }}>

                    {
                        userGroups.map((invite, index) => (
                            <UserGroup key={index} item={invite} />

                        ))
                    }

                </View>

                <View style={{ marginBottom: deviceHeight * .2 }} ></View>

            </KeyboardAwareScrollView>


        </>


    )
}

