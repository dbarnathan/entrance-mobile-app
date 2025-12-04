import React, { useEffect, useCallback, useMemo, useRef, useState, useContext } from "react"
import { View, Text, Pressable, ScrollView, TouchableOpacity, useWindowDimensions, TextInput, Animated, Image, Share, DeviceEventEmitter, StyleSheet, Switch, KeyboardAvoidingView, FlatList } from 'react-native';

import Modal from "react-native-modal";
import colors from "../theme/colors";
import axios from "axios";
import { UserDataContext } from "../context/UserDataContext";
import InviteUsersModal from "./InviteUsersModal";
import { useNavigation } from "@react-navigation/native";

export const WorkspaceUsersEditModal = (props) => {
    const { isVisible, setIsVisible, link, data, flagProp, changeFlagProp } = props

    const { userData } = useContext(UserDataContext)
    const [flagList, setFlagList] = useState([])
    const [showInvite, setShowInvite] = useState(false)

    const deviceHeight = useWindowDimensions().height

    const deviceWidth = useWindowDimensions().width

    const navigation = useNavigation()

    useEffect(() => {
        axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/flags?order=DESC`, {
            headers: {
                'Authorization': userData.access_token
            },
            params: {
                adminview: true,
            }
        }).then((response) => {
            console.log(response.data, " : Channel DATA")
            setFlagList(response.data.records)



        }).catch((err) => {
            console.log(err.toJSON());

        })
    }, [isVisible])

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
            <View style={[styles.main, { marginTop: deviceHeight * .75, }]}>

                {/* <Text style={{ fontWeight: "600", fontSize: 25, paddingBottom: 12 }}>Set Flag</Text> */}
                <InviteUsersModal isVisible={showInvite} setIsVisible={setShowInvite} />

                <Pressable style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 12, }}
                    onPress={() => {
                        navigation.navigate("UserGroups")
                        setIsVisible(false)
                    }}>
                    <Text style={{ fontWeight: "500", fontSize: 22, }}>Manage User Groups</Text>
                </Pressable>
                <Pressable style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 12, }}
                    onPress={() => {
                        navigation.navigate("InviteUsers")
                        setIsVisible(false)
                    }}>
                    <Text style={{ fontWeight: "500", fontSize: 22, }}>Invite Users</Text>
                </Pressable>
                <Pressable style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 12, }}
                    onPress={() => {
                        console.log("NB Connections")
                        setIsVisible(false)
                    }}>
                    <Text style={{ fontWeight: "500", fontSize: 22, }}>NB Connections</Text>
                </Pressable>

            </View>

            <View style={{ paddingBottom: 30, paddingTop: 30 }} />


        </Modal >
    )
}

const styles = StyleSheet.create({

    main: {
        backgroundColor: colors.white,

        borderTopRightRadius: 35,
        borderTopLeftRadius: 35,
        height: "48%",
        padding: 20,
        justifyContent: "flex-start"
    },
    backModal: {

        margin: 0,
        marginTop: 50



    },

})

export default WorkspaceUsersEditModal