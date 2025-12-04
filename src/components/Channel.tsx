import React, { useEffect, useCallback, useState, useContext } from "react"
import { View, Text, StyleSheet, Image, useWindowDimensions, Alert, Pressable, RefreshControl, FlatList, Touchable, } from 'react-native'
import { colors, fontSize } from '../theme'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import TimeAgo from "react-native-timeago";
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { UserDataContext } from "../context/UserDataContext";
import axios from "axios";
import FlagModal from "./FlagModal";
import { useNavigation } from "@react-navigation/native";

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


export const Channel = (props) => {

    const { userFlags, setUnreadData, unreadData, unreadNumber, setUnreadNumber, getChannels, refreshChannel, godChecked, archiveChecked, userData, setArchiveChecked } = useContext(UserDataContext)

    const { data } = props

    const navigation = useNavigation()

    const [isArchived, setIsArchived] = useState(data.archived)
    const [isBookmark, setIsBookmark] = useState(data.bookmarked)
    const [unread, setUnread] = useState(Number(data.unread))
    const [currentFlag, setCurrentFlag] = useState(null)
    const [showFlag, setShowFlag] = useState(false)

    useEffect(() => {
        console.log(data, ": Is this flag Updated?")

        const result = userFlags.filter((flag) => flag.id == data.flag_id)
        setCurrentFlag(result[0])
    }, [data])

    useEffect(() => {
        let temp = 0
        axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/channels/${data.id}`, {
            headers: {
                'Authorization': userData.access_token
            },
            params: {
                adminview: true,
            }
        }).then((response) => {
            console.log(response.data.record, " : Channel DATA")
            // setUnreadNumber(prev => prev + response.data.record.unread)
            // setUnread(response.data.record.unread)

        }).catch((err) => {
            console.log(err.toJSON());

        })
    }, [])

    const handleChangeUnread = () => {
        setUnread(1)
        let newUnread = unread + 1
        const config = {
            method: 'put',
            url: `https://${process.env.EXPO_PUBLIC_LIVE}/channels/${data.id}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': userData.access_token
            },
            data: {
                unread: newUnread
            }
        };
        axios(config).then((response) => {
            console.log(response.data.record, " : Channel DATA")
            setUnreadNumber(prev => prev + 1)
           

        }).catch((err) => {
            console.log(err.toJSON());

        })

    }

    const handleBookMark = () => {
        const config = {
            method: 'put',
            url: `https://${process.env.EXPO_PUBLIC_LIVE}/channels/${data.id}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': userData.access_token
            },
            data: {
                bookmarked: !isBookmark
            }
        };
        axios(config).then((response) => {
            console.log(response.data.record, " : Channel DATA")
            setIsBookmark(!isBookmark)
            getChannels(userData)
        }).catch((err) => {
            console.log(err.toJSON());

        })
    }

    const handleArchive = () => {
        const config = {
            method: 'put',
            url: `https://${process.env.EXPO_PUBLIC_LIVE}/channels/${data.id}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': userData.access_token
            },
            data: {
                archived: !isArchived
            }
        };
        axios(config).then(async (response) => {
            console.log(response.data.record, " : Channel DATA")
            setIsArchived(!isArchived)
            Alert.alert(`Channel to # +1 ${formatPhoneNumber(data.number)} has been ${isArchived ? 'unarchived' : 'archived'}`, '', [
                { text: 'OK', onPress: () => {refreshChannel(godChecked, !isArchived, userData); setArchiveChecked(!isArchived)} },
            ]);
        }).catch((err) => {
            console.log(err.toJSON());

        })
    }


    const deviceHeight = useWindowDimensions().height;
    const deviceWidth = useWindowDimensions().width;

    async function handleMessage () {
        navigation.navigate("MessageStack", {channelId: data.id, number: data.number, channelData: data})
        const config = {
            method: 'put',
            url: `https://${process.env.EXPO_PUBLIC_LIVE}/channels/${data.id}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': userData.access_token
            },
            data: {
                unread: 0
            }
        };

        axios(config).then((response) => {
            setUnreadNumber(prev => prev - unread)
            setUnread(null)
          
         
        }).catch((err) => {
            console.log(err.toJSON());

        })
    }

    return (
        <Pressable style={{ flexDirection: "row", margin: 8, backgroundColor: "white", borderRadius: 13, padding: 12, justifyContent: "space-between" }} onPress={() => {	handleMessage()}}>
            <FlagModal isVisible={showFlag} setIsVisible={setShowFlag} data={data} flagProp={currentFlag} changeFlagProp={setCurrentFlag}/>

            <View style={{ flexDirection: "column",  gap: 6 }}>

                <View style={{ flexDirection: "row", gap: 12 }}>
                    {
                        isBookmark ? <FontAwesome name="sticky-note" size={24} color="gold" onPress={() => { handleBookMark() }} /> : <FontAwesome5 name="sticky-note" size={24} color="gold" onPress={() => { handleBookMark() }} />
                    }

                    <Text style={{ color: colors.text, fontSize: 14, fontWeight: "600" }}>+1 {formatPhoneNumber(data?.number?.slice(1))}</Text>
                </View>
                <View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                        <View>
                            {
                                unread > 0 ?
                                    <Pressable style={{
                                        borderRadius: 10, height: 30, width: 30,
                                        backgroundColor: "#D13B5E", justifyContent: "center", alignItems: "center"
                                    }} >
                                        <Text style={{ color: colors.white, fontSize: 14, borderRadius: 10, padding: 5 }}>{unread}</Text>
                                    </Pressable> :
                                    <Pressable style={{
                                        borderRadius: 10, height: 30, width: 30,
                                        backgroundColor: "#F3CED7", justifyContent: "center", alignItems: "center"
                                    }} onPress={() => { handleChangeUnread() }}>
                                        <Entypo name="plus" size={14} color="white" />
                                        {/* <Text style={{ color: colors.white, fontSize: 14, }}>1</Text> */}
                                    </Pressable>
                            }

                        </View>
                        <View style={{maxWidth: "70%"}}>
                            <Text style={{ color: unread > 0 ? colors.black : colors.gray, fontSize: 14,  fontWeight:  unread > 0 ? "500" : "400"}} numberOfLines={1}>{data.last_message}</Text>
                            <Text style={{ color: unread > 0 ? colors.black : colors.gray, fontSize: 14,  fontWeight:  unread > 0 ? "500" : "400"}}><TimeAgo time={data.last_response} /></Text>
                        </View>
                    </View>
                </View>


            </View>
            <View style={{ flexDirection: "row", gap: 5, alignItems: "center" }}>
                {
                    currentFlag ?
                        <View>
                            <Pressable style={{ position: "absolute",  height: 70, width: 50, bottom: -25, right: -5, zIndex: 2}} onPress={() => {setShowFlag(true)}} ></Pressable>
                            <Ionicons name="flag" size={24} color={currentFlag.color_id} />
                        </View> :
                        <View>
                            <Pressable style={{ position: "absolute",  height: 70, width: 50, bottom: -25, right: -5, zIndex: 2}} onPress={() => {setShowFlag(true)}}></Pressable>
                            <Ionicons name="flag" size={24} color="lightgray" />
                        </View>
                }
                {
                    isArchived ?
                        <View>
                            <Pressable style={{ position: "absolute", height: 70, width: 50, bottom: -25, zIndex: 2 }} onPress={handleArchive} ></Pressable>
                            <MaterialCommunityIcons name="archive" size={24} color="#D13B5E" />
                        </View>
                        :
                        <View>
                            <Pressable style={{ position: "absolute", height: 70, width: 50, bottom: -25, zIndex: 2 }} onPress={handleArchive}></Pressable>
                            <MaterialCommunityIcons name="archive-check-outline" size={24} color="#D13B5E"  />
                        </View>
                }


                {/* <MaterialCommunityIcons name="archive-check-outline" size={24} color="#D13B5E" /> */}
            </View>


        </Pressable>
    )
}

export default Channel