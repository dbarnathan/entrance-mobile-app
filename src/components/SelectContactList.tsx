import React, { useEffect, useCallback, useMemo, useRef, useState, useContext } from "react"
import { View, Text, Pressable, ScrollView, TouchableOpacity, useWindowDimensions, TextInput, Animated, Image, Share, DeviceEventEmitter, StyleSheet, Switch, KeyboardAvoidingView, FlatList, Alert } from 'react-native';
import { UserDataContext } from "../context/UserDataContext";
import Modal from "react-native-modal";
import colors from "../theme/colors";
import axios from "axios";
import Toast from 'react-native-toast-message';
import ColorPickerModal from "./ColorPickerModal";
import { useNavigation } from "@react-navigation/native";


export const SelectContactList = (props) => {
    const { isVisible, setIsVisible, pickFile, item } = props
    const navigation = useNavigation()

    const { userData, userFlags, getFlags, contactList } = useContext(UserDataContext)

    const [flagName, setFlagName] = useState("")
    const [selectedColor, setSelectedColor] = useState("#000000")
    const [showColor, setShowColor] = useState(false)

    const deviceHeight = useWindowDimensions().height

    useEffect(() => {
        console.log("FLAG LIST: ", userFlags)
    }, [])


    const ContactList = ({ item }) => {
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }

        const handleSelect = () => {
            Toast.show({
                type: 'success',
                text1: 'Updated',
                text2: 'Successfully added contact list. 👋'
            });
            setIsVisible(false)
        }

        return (
            <Pressable onPress={() => handleSelect()}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <View style={{ width: 30, height: 30, borderRadius: 30, backgroundColor: "#0162E8", marginRight: 10 }} />
                        <Text style={{ fontSize: 20, fontWeight: "600" }}>{item.name}</Text>
                    </View>
                    <Pressable onPress={() => { console.log("Flag Selected") }}>
                        <Text style={{ color: colors.blue }}>{new Date(item?.created_at).toLocaleDateString(options)}</Text>
                    </Pressable>
                </View>
            </Pressable>
        )
    }

    const handleFilePick = () => {
        // setIsVisible(false)
        pickFile()
     
     
    }

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

            <View style={[styles.main, { marginTop: deviceHeight * .95, }]}>

                <Text style={{ fontWeight: "600", fontSize: 20, paddingBottom: 30 }}>Select Upload Option</Text>
                <View style={{ gap: 30 }}>

                    <Pressable style={{ flexDirection: "row", alignItems: "center" }} onPress={handleFilePick}>

                        <Text style={{ fontSize: 25, fontWeight: "600" }}>Upload from Files</Text>
                    </Pressable>
                    <Pressable style={{ flexDirection: "row", alignItems: "center" }} onPress={() => {navigation.navigate("GetContactLists", {campaignId: item.id}); setIsVisible(false)}}>

                        <Text style={{ fontSize: 25, fontWeight: "600" }}>Upload from Contact List</Text>
                    </Pressable>
                </View>
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
        height: "60%",
        padding: 20,
        justifyContent: "flex-start",

    },
    backModal: {

        margin: 0

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

export default SelectContactList