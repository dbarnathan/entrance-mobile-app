import React, { useEffect, useState, useContext, useLayoutEffect, useCallback, useRef } from 'react'
import { Text, View, ScrollView, StyleSheet, Pressable, useWindowDimensions, Keyboard, TouchableOpacity, Image } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { TextInput } from 'react-native';
import { colors, fontSize } from '../../../theme'
import { UserDataContext } from '../../../context/UserDataContext'
import { FlagContext } from '../../../context/FlagContext'
import { ColorSchemeContext } from '../../../context/ColorSchemeContext'
import axios from 'axios'
import styles from './styles'
import { Entypo, Feather } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useRoute } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import TimeAgo from 'react-native-timeago';

const formatPhoneNumber = (e) => {
    let formattedNumber;
    const length = e.length;
    // Filter non numbers
    const regex = () => e.replace(/[^0-9\.]+/g, "");
    // Set area code with parenthesis around it
    const areaCode = () => `(${regex().slice(0, 3)})`;

    // Set formatting for first six digits
    const firstSix = () => `${areaCode()} ${regex().slice(3, 6)}`;

    // Dynamic trail as user types
    const trailer = (start) => `${regex().slice(start,
        regex().length)}`;
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

export default function Numbers() {
    const navigation = useNavigation()
    const deviceHeight = useWindowDimensions().height;
    const deviceWidth = useWindowDimensions().width;
    const [refreshing, setRefreshing] = useState(false);
    const { userData, getWorkspaceUsers, userGroups, workspaceUsers, numbers } = useContext(UserDataContext)
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
        console.log("CURRENT USER NUMBERS: ", numbers)

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


    const Number = ({ item }) => {
        // console.log("Campaign Component: ", item)

        const [id, setId] = useState("")
        const [isStopped, setIsStopped] = useState(item.stop)
        const [isArchived, setIsArchived] = useState(item.archive)
        const [isExtra, setIsExtra] = useState(false)

        const [userPermissions, setUserPermissions] = useState([])
        const [removedUsers, setRemovedUsers] = useState([])

        const [isEdit, setIsEdit] = useState(false)

        const [newName, setNewName] = useState(item.name)
        const [number, setNumber] = useState("")

        const textRef = useRef(null)

        useEffect(() => {
            console.log("User Group Item: ", item)
        }, [])


        useEffect(() => {
            axios
                .get(`https://${process.env.EXPO_PUBLIC_LIVE}/workspace-numbers/${item?.id}`, {
                    headers: {
                        Authorization: userData.access_token,
                    },
                })
                .then(async (response) => {
                    console.log("Campaigns from view: ", response.data.records);
                    setNumber(response.data.record.number)


                })
                .catch((err) => {
                    console.error("Error fetching user-group assignments:", err.toJSON());
                });
        }, [item, userData.access_token, workspaceUsers]);



        return (
            <Pressable style={{
                gap: 9, backgroundColor: colors.lightGrayPurple,
                borderColor: colors.primary, borderWidth: 1,
                borderRadius: 12, marginVertical: 5, paddingVertical: 10, paddingHorizontal: 5
            }} onPress={() => setIsExtra(!isExtra)}
            >
                <View style={{ justifyContent: "space-between", alignItems: 'flex-start', width: "100%", gap: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: "center", gap: 8 }}>


                        <Pressable style={{ padding: 10, paddingVertical: 11.5, borderRadius: 20, backgroundColor: item.status == "active" ? "#22BC3B" : "#DFDFDF", alignItems: "center" }} onPress={() => { setIsEdit(!isEdit); textRef.current?.focus() }}>
                            <Text style={{ color: "black", fontSize: 14, fontWeight: "500" }}>{item?.status}</Text>
                        </Pressable>
                        <Text style={{ color: "black", fontSize: 14, fontWeight: "500" }}>+1 {formatPhoneNumber(number.slice(1))}</Text>




                    </View>
                    <View style={{ justifyContent: "space-between", flexDirection: "row", width: "100%" }}>
                        <View style={{ flexDirection: 'row', gap: 5 }}>
                            <Text style={{ color: colors.gray }}>Last Used: </Text>
                            <Text style={{ color: "black", fontSize: 14, fontWeight: "500" }}><TimeAgo time={item.last_used} /></Text>



                        </View>
                        <View style={{ flexDirection: 'row', gap: 5 }}>
                            <Text style={{ color: colors.gray }}>Rented: </Text>
                            <Text style={{ color: "black", fontSize: 14, fontWeight: "500" }}>{new Date(item?.last_used).toLocaleDateString("en-US")}</Text>



                        </View>
                    </View>
                    {
                        isExtra ?
                            <View style={{ flexDirection: "row", paddingHorizontal: 12, gap: 11, alignItems: "center" }}>
                                <View style={{ gap: 4, alignItems: "center" }}>
                                    <Text>Delivered</Text>
                                    <Text style={{ fontWeight: "600", fontSize: 15 }}>{item?.delivered}</Text>
                                </View>
                                <View style={{ gap: 4, alignItems: "center" }}>
                                    <Text>Undelivered</Text>
                                    <Text style={{ fontWeight: "600", fontSize: 15 }}>{item?.undelivered}</Text>
                                </View>
                                <View style={{ gap: 4, alignItems: "center" }}>
                                    <Text>Spam</Text>
                                    <Text style={{ fontWeight: "600", fontSize: 15 }}>{item?.spam}</Text>
                                </View>
                                <View style={{ gap: 4, alignItems: "center" }}>
                                    <Text>Stops</Text>
                                    <Text style={{ fontWeight: "600", fontSize: 15 }}>{item?.stops}</Text>
                                </View>
                                <View style={{ gap: 4, alignItems: "center" }}>
                                    <Text>Responses</Text>
                                    <Text style={{ fontWeight: "600", fontSize: 15 }}>{item?.responses}</Text>
                                </View>
                            </View> : ""
                    }
                    {
                        isExtra ?
                            <View style={{}}>
                                <Entypo name="chevron-thin-up" size={18} color="black" />
                            </View> :
                            <View style={{}}>
                                <Entypo name="chevron-thin-down" size={18} color="black" />
                            </View>
                    }

                </View>


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
                    <Text style={{ fontSize: 25, fontWeight: "600" }}>Numbers</Text>
                    <Text style={{ color: colors.grayLight }}>Look at workspace Numbers</Text>
                </View>

            </View>
            <KeyboardAwareScrollView bounces={false} keyboardShouldPersistTaps={'always'} keyboardDismissMode="on-drag" style={styles.card}>
                {
                    numbers.length > 0 ?
                        <View style={{ flex: 1, paddingHorizontal: 10 }}>

                            {
                                numbers.map((invite, index) => (
                                    <Number key={index} item={invite} />

                                ))
                            }

                        </View> :
                        <View style={{ alignItems: "center", paddingVertical: 5, justifyContent: "center", marginTop: deviceHeight * .2, gap: 15 }}>
                            <Image source={require('../../../../assets/images/purpleE.png')} resizeMode='contain'
                                style={{ height: deviceHeight * .2, width: deviceWidth * .8, tintColor: colors.grayedOut }} />
                            <Text style={{ color: colors.grayLight, fontSize: 16 }}>No numbers available</Text>
                        </View>
                }



                <View style={{ marginBottom: deviceHeight * .2 }} ></View>

            </KeyboardAwareScrollView>


        </>


    )
}

