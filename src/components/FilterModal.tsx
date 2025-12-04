import React, { useEffect, useCallback, useMemo, useRef, useState, useContext } from "react"
import { View, Text, Pressable, ScrollView, TouchableOpacity, useWindowDimensions, TextInput, Animated, Image, Share, DeviceEventEmitter, StyleSheet, Switch, KeyboardAvoidingView, FlatList, Alert } from 'react-native';
import { UserDataContext } from "../context/UserDataContext";
import Modal from "react-native-modal";
import colors from "../theme/colors";
import axios from "axios";
import { FontAwesome5 } from "@expo/vector-icons";
import { Dropdown } from "react-native-element-dropdown";
import BouncyCheckbox from "react-native-bouncy-checkbox";

export const FilterModal = (props) => {
    const { isVisible, setIsVisible, } = props

    const { userData, userFlags, getChannels, unread, setUnread, bookmarked, setBookmarked, oldest, setOldest, selectedFlag, setSelectedFlag } = useContext(UserDataContext)
    const [campaignFocus, setCampaignFocus] = useState(false)
    const [flagFocus, setFlagFocus] = useState(false)



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
                    <Text style={{ fontWeight: "600", fontSize: 25, paddingBottom: 12 }}>Select Filter</Text>


                </View>

                <View style={{ flexDirection: "row", gap: 10, justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <Text style={{ fontWeight: "500", fontSize: 14 }}>Campaign</Text>
                    <Dropdown
                        style={[styles.dropdown, campaignFocus && { borderColor: 'blue' }]}
                        data={campaigns}
                        selectedTextStyle={{ fontSize: 12 }}
                        inputSearchStyle={{ fontSize: 12 }}
                        itemTextStyle={{ fontSize: 12 }}
                        placeholderStyle={{ fontSize: 12 }}
                        containerStyle={{ width: '100%' }}
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholder={!campaignFocus ? 'None Selected' : '...'}

                        searchPlaceholder="Search..."
                        value={selectedCampaign}
                        onFocus={() => setCampaignFocus(true)}
                        onBlur={() => setCampaignFocus(false)}
                        onChange={item => {
                            console.log("ITEM: ", item)
                            setSelectedCampaign(item.id);
                            setCampaignFocus(false);
                        }}

                    />
                </View>
                <View style={{ flexDirection: "row", gap: 10, justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <Text style={{ fontWeight: "500", fontSize: 14 }}>Flags</Text>
                    <Dropdown
                        style={[styles.dropdown, flagFocus && { borderColor: 'blue' }]}
                        data={[{ name: "All", id: "all" }, ...userFlags]}
                        selectedTextStyle={{ fontSize: 12 }}
                        inputSearchStyle={{ fontSize: 12 }}
                        itemTextStyle={{ fontSize: 12 }}
                        placeholderStyle={{ fontSize: 12 }}
                        containerStyle={{ width: '100%' }}
                        maxHeight={300}
                        labelField="name"
                        valueField="id"
                        placeholder={!flagFocus ? 'None Selected' : '...'}

                        searchPlaceholder="Search..."
                        value={selectedFlag}
                        onFocus={() => setFlagFocus(true)}
                        onBlur={() => setFlagFocus(false)}
                        onChange={item => {
                            console.log("I T E M: ", item.id)
                            setSelectedFlag(item.id);
                            handleAddFlag(item.id)
                            setFlagFocus(false);
                        }}

                    />
                </View>
                <View style={{ borderBottomColor: "#BFBFBF", borderBottomWidth: 1, width: "100%", marginVertical: 13 }}></View>

                <View style={{ width: "55%" }}>
                    {
                        selections.map((ele) => (
                            <View style={{ flexDirection: "row", gap: 10, alignItems: "center", marginBottom: 5, justifyContent: "space-between" }}>
                                <Text style={{ fontWeight: "500", fontSize: 14 }}>{ele.title}</Text>
                                <BouncyCheckbox style={{ borderRadius: 0 }} fillColor={colors.claim} iconStyle={{ borderRadius: 5 }} innerIconStyle={{ borderRadius: 5 }} isChecked={ele.hook} onPress={() => ele.setHook(!ele.hook)} />
                            </View>
                        ))
                    }

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

export default FilterModal