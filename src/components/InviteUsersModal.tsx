import React, { useEffect, useCallback, useMemo, useRef, useState, useContext } from "react"
import { View, Text, Pressable, ScrollView, TouchableOpacity, useWindowDimensions, TextInput, Animated, Image, Share, DeviceEventEmitter, StyleSheet, Switch, KeyboardAvoidingView, FlatList, Alert } from 'react-native';
import { UserDataContext } from "../context/UserDataContext";
import Modal from "react-native-modal";
import colors from "../theme/colors";
import axios from "axios";
import { FontAwesome5 } from "@expo/vector-icons";
import { Dropdown } from "react-native-element-dropdown";
import BouncyCheckbox from "react-native-bouncy-checkbox";

export const InviteUsersModal = (props) => {
    const { isVisible, setIsVisible, } = props

    const { userData, userFlags, getChannels, unread, setUnread, bookmarked, setBookmarked, oldest, setOldest, selectedFlag, setSelectedFlag } = useContext(UserDataContext)
    const [campaignFocus, setCampaignFocus] = useState(false)
    const [flagFocus, setFlagFocus] = useState(false)
    const [email, setEmail] = useState("")
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [phone, setPhone] = useState("")



    const [selectedCampaign, setSelectedCampaign] = useState("")


    const [campaigns, setCampaigns] = useState([])

    const deviceHeight = useWindowDimensions().height

    const deviceWidth = useWindowDimensions().width

    const handleAddFlag = (select) => {
        getChannels(userData, bookmarked, select, oldest)
    }

    const handleBookMark = (select) => {
        console.log("Bookmarked: ", select)
        setBookmarked(select)
        getChannels(userData, select, selectedFlag, oldest)
    }

    const handleOrder = (select) => {
        setOldest(select)
        if (select) {
            getChannels(userData, bookmarked, selectedFlag, select)
        } else {

            getChannels(userData, bookmarked, selectedFlag, select)
        }

    }

    const handleUnread = (select) => {
        setUnread(select)
        getChannels(userData, bookmarked, selectedFlag, oldest, select)
    }

    useEffect(() => {
        console.log("FLAG LIST: ", userFlags)
    }, [])

    const selections = [
        { title: "Unread", setHook: handleUnread, hook: unread },
        { title: "Bookmarked", setHook: handleBookMark, hook: bookmarked },
        { title: "Order by Oldest", setHook: handleOrder, hook: oldest }
    ]



    return (
        <Modal
            propagateSwipe={true}
            animationIn="slideInUp"

            animationInTiming={500}
            animationOutTiming={500}
            backdropTransitionInTiming={1000}
            backdropTransitionOutTiming={500}
            isVisible={isVisible}
            onBackdropPress={() => { setIsVisible(false) }}
            style={[styles.backModal]}>
            <View style={[styles.main,]}>

                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontWeight: "600", fontSize: 25, paddingBottom: 12 }}>Invite Users</Text>


                </View>
                <View style={{ flexDirection: "row", width: "100%", gap: 6 }}>

                    <TextInput
                        style={{ backgroundColor: colors.lightGrayPurple, color: "black", borderRadius: 12, fontSize: 16, padding: 12, flex: 1 }}
                        placeholderTextColor={"gray"}

                        placeholder={"First Name"}

                        onChangeText={(value) => setFirstName(value)}
                        value={firstName}
                        underlineColorAndroid="transparent"

                    />
                    <TextInput
                        style={{ backgroundColor: colors.lightGrayPurple, color: "black", borderRadius: 12, fontSize: 16, padding: 12, flex: 1 }}
                        placeholderTextColor={"gray"}

                        placeholder={"Last Name"}

                        onChangeText={(value) => setLastName(value)}
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

                        onChangeText={(value) => setEmail(value)}
                        value={email}
                        underlineColorAndroid="transparent"

                    />
                    <TextInput
                        style={{ backgroundColor: colors.lightGrayPurple, color: "black", borderRadius: 12, fontSize: 16, padding: 12, flex: 1 }}
                        placeholderTextColor={"gray"}

                        placeholder={"Phone Number"}
                        maxLength={11}
                        onChangeText={(value) => setPhone(value)}
                        value={phone}
                        underlineColorAndroid="transparent"

                    />
                </View>



            </View>

            <View style={{ paddingBottom: 30, paddingTop: 30 }} />


        </Modal >
    )
}

const styles = StyleSheet.create({

    main: {
        backgroundColor: colors.white,

        borderRadius: 20,

        padding: 20,
        flexDirection: "column"

    },
    backModal: {

        margin: 20,
        marginTop: 50

    },
    dropdown: {
        paddingVertical: 5,
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 8,
        width: '40%',

    },

})

export default InviteUsersModal