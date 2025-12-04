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


export const Claim = (props) => {

    const { userFlags, getUnClaimed, setUnreadNumber, getChannels, claimedList, setClaimedList, userData, handleClaimedFilter, setCurrentClaimed, currentFilter, setCurrentFilter } = useContext(UserDataContext)

    const { data, index } = props

    const navigation = useNavigation()

    const [isArchived, setIsArchived] = useState(data.archived)
    const [isStopped, setIsStopped] = useState(data.deleted)
    const [isBookmark, setIsBookmark] = useState(data.bookmarked)
    const [unread, setUnread] = useState(data.unread)
    const [currentFlag, setCurrentFlag] = useState(null)
    const [showFlag, setShowFlag] = useState(false)

    useEffect(() => {
        console.log(userFlags, ": USER FLAGS \n")

        const result = userFlags.filter((flag) => flag.id == data.flag_id)
        setCurrentFlag(result[0])
    }, [])

    const handleChangeUnread = () => {
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
            // setUnreadNumber(prev => prev + 1)
            setUnread(1)

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
        }).catch((err) => {
            console.log(err.toJSON());

        })
    }

    const handleArchive = (index) => {
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
                {
                    text: 'OK', onPress: () => {
                        handleClaimedFilter("archive", claimedList)
                        isArchived ? setCurrentFilter("1") : setCurrentFilter("3")
                        let temp = claimedList
                        var result = temp.map(el => el.id == data.id ? { ...el, archived: !isArchived } : el);
                        setClaimedList(result)
                        if (isArchived) {
                            setCurrentClaimed(result.filter((item) => item.archived == false || item.archived == null))
                        } else {
                            setCurrentClaimed(result.filter((item) => item.archived == true))
                        }


                    }
                },
            ]);
        }).catch((err) => {
            console.log(err.toJSON());

        })
    }


    const deviceHeight = useWindowDimensions().height;
    const deviceWidth = useWindowDimensions().width;



    const handleClaim = () => {
        const config = {
            method: 'patch',
            url: `https://${process.env.EXPO_PUBLIC_LIVE}/channels/${data.id}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': userData.access_token
            },
            data: {
                assigned_to: userData.user_id
            }
        };

        axios(config).then((response) => {
            console.log(response.data.record, " : Channel DATA")
            // setClaimedList(prev => [...prev, data.id])
            Alert.alert(`Channel has been claimed`, '', [
                { text: 'OK', onPress: () => getUnClaimed(userData) },
            ]);
        }).catch((err) => {
            console.log(err.response.data, " Error Claiming");

        })
    }

    const deleteChannel = () => {

        const config = {
            method: 'put',
            url: `https://${process.env.EXPO_PUBLIC_LIVE}/channels/${data.id}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': userData.access_token
            },
            data: {
                deleted: !isStopped
            }
        };
        axios(config).then(async (response) => {
            console.log(response.data.record, " : Channel DATA")
            setIsArchived(!isArchived)
            Alert.alert(`Channel to # +1 ${formatPhoneNumber(data.number)} has been ${isStopped ? 'recovered' : 'stopped'}`, '', [
                {
                    text: 'OK', onPress: () => {
                        handleClaimedFilter("stopped", claimedList)
                        !isStopped ? setCurrentFilter("1") : setCurrentFilter("2")
                        let temp = claimedList
                        var result = temp.map(el => el.id == data.id ? { ...el, deleted: !isStopped } : el);
                        setClaimedList(result)
                        if (isStopped) {
                            setCurrentClaimed(result.filter((item) => item.deleted == false))
                        } else {
                            setCurrentClaimed(result.filter((item) => item.deleted == true))
                        }


                    }
                },
            ]);
        }).catch((err) => {
            console.log(err.toJSON());

        })
    }

    return (
        <Pressable style={{ flexDirection: "row", margin: 8, backgroundColor: "white", borderRadius: 13, padding: 12, justifyContent: "space-between" }}>
            <FlagModal isVisible={showFlag} setIsVisible={setShowFlag} data={data} flagProp={currentFlag} changeFlagProp={setCurrentFlag} />

            <View style={{ flexDirection: "column", marginLeft: 12, gap: 6, flex: 1 }}>
                {
                    data.last_message.includes("$$forward$$") ?
                        <>
                            <Text style={{ color: colors.text, fontSize: 14, fontWeight: "600" }} adjustsFontSizeToFit={true} numberOfLines={1}>Forwarded to:</Text>
                            <Text style={{ color: colors.text, fontSize: 14, fontWeight: "600" }} adjustsFontSizeToFit={true} numberOfLines={1}>{formatPhoneNumber(data.number.slice(1))}</Text>
                        </> :
                        <>
                            <View style={{ flexDirection: "row", gap: 12 }}>

                                <Text style={{ color: colors.text, fontSize: 14, fontWeight: "600" }}>+1 {formatPhoneNumber(data.number.slice(1))}</Text>
                            </View>
                            <View>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>

                                    <View style={{ maxWidth: "80%" }}>
                                        <Text style={{ color: colors.gray, fontSize: 14, }} numberOfLines={1}>{data.last_message}</Text>
                                        <Text style={{ color: colors.gray, fontSize: 14, }}><TimeAgo time={data.last_response} /></Text>
                                    </View>
                                </View>
                            </View>
                        </>
                }




            </View>
            <View style={{ flexDirection: "row", gap: 5, alignItems: "center" }}>
                {/* <View>
                    <Pressable style={{ position: "absolute", height: 70, width: 50, bottom: -25, zIndex: 2 }} onPress={handleArchive}></Pressable>
                    <MaterialCommunityIcons name="archive-check-outline" size={24} color="#D13B5E" />
                </View> */}
                <View style={{ flexDirection: "row", gap: 5, alignItems: "center" }}>
                    <View style={{ backgroundColor: "#477bc9", padding: 12, borderRadius: 12 }}>
                        <Pressable style={{ position: "absolute", height: 70, width: 60, bottom: -25, zIndex: 2,}} onPress={handleClaim}></Pressable>
                        <Text style={{ color: "white", fontSize: 12 }}>Claim</Text>
                    </View>
                </View>
                {
                    isArchived ?
                        <View style={{ backgroundColor: "#477bc9", padding: 12, borderRadius: 12 }}>
                            <Pressable style={{ position: "absolute", height: 80, width: 85, bottom: -25, zIndex: 2, }} onPress={() => handleArchive(index)}></Pressable>
                            <Text style={{ color: "white", fontSize: 12 }}>un-archive</Text>
                        </View>
                        :
                        <View style={{ backgroundColor: "#737F9E", padding: 12, borderRadius: 12 }}>
                            <Pressable style={{ position: "absolute", height: 80, width: 85, bottom: -25, zIndex: 2, }} onPress={handleArchive}></Pressable>
                            <Text style={{ color: "white", fontSize: 12 }}>Archive</Text>
                        </View>
                }
                <View style={{ flexDirection: "row", gap: 5, alignItems: "center" }}>
                    <View style={{ backgroundColor:  isStopped ? "#58bf61" : "#D13B5E", padding: 12, borderRadius: 12 }}>
                        <Pressable style={{ position: "absolute", height: 40, width: 55, bottom: -25, zIndex: 2 }} onPress={deleteChannel}></Pressable>
                        <Text style={{ color: "white", fontSize: 12 }}>{isStopped ? "Recover" : "Stop"}</Text>
                    </View>
                </View>


                {/* <MaterialCommunityIcons name="archive-check-outline" size={24} color="#D13B5E" /> */}
            </View>


        </Pressable>
    )
}

export default Claim