import React, { useEffect, useCallback, useMemo, useRef, useState, useContext } from "react"
import { View, Text, Pressable, ScrollView, TouchableOpacity, useWindowDimensions, TextInput, Animated, Image, Share, DeviceEventEmitter, StyleSheet, Switch, KeyboardAvoidingView, FlatList, Alert } from 'react-native';
import { UserDataContext } from "../context/UserDataContext";
import Modal from "react-native-modal";
import colors from "../theme/colors";
import axios from "axios";
import Toast from 'react-native-toast-message';
import ColorPickerModal from "./ColorPickerModal";


export const AddFlagModal = (props) => {
    const { isVisible, setIsVisible, } = props

    const { userData, userFlags, getFlags } = useContext(UserDataContext)

    const [flagName, setFlagName] = useState("")
    const [selectedColor, setSelectedColor] = useState("#000000")
    const [showColor, setShowColor] = useState(false)

    useEffect(() => {
        console.log("FLAG LIST: ", userFlags)
    }, [])

    const handleAddFlag = () => {
        axios.post(`https://${process.env.EXPO_PUBLIC_LIVE}/flags`, { name: flagName, color_id: selectedColor}, { headers: { 'Authorization': userData.access_token } }).then((response) => {
            console.log("Successfully Added Flag")
            Toast.show({
                type: 'success',
                text1: 'Updated',
                text2: 'Successfully added flag'
            });
            getFlags(userData)
            setIsVisible(false)

        }).catch((err) => {
            console.log(err, " :ERROR REMOVING GROUP");

        })
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

            <View style={[styles.main,]}>
                <ColorPickerModal isVisible={showColor} setIsVisible={setShowColor} color={selectedColor} setSelectedColor={setSelectedColor} />

                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontWeight: "600", fontSize: 25, paddingBottom: 18 }}>Add Flag</Text>


                </View>

                <View style={{ flexDirection: "row", gap: 10, justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <Text style={{ fontWeight: "500", fontSize: 14 }}>Name</Text>
                    <TextInput
                        style={{ backgroundColor: colors.lightGrayPurple, color: "black", borderRadius: 12, fontSize: 16, padding: 12, flex: 1.4 }}
                        placeholderTextColor={"gray"}

                        placeholder={"Enter flag name"}

                        onChangeText={(value) => setFlagName(value)}
                        value={flagName}
                        underlineColorAndroid="transparent"

                    />
                </View>
                <Pressable style={{ flexDirection: "row", gap: 10, justifyContent: "space-between", alignItems: "center", marginBottom: 25 }} onPress={() => { setShowColor(true) }}>
                    <Text style={{ fontWeight: "500", fontSize: 14 }}>Select Color: </Text>
                    <View style={{ padding: 8, height: 20, width: 20, borderRadius: 20, backgroundColor: selectedColor }} >

                    </View>
                </Pressable>
                <Pressable style={{
                    alignSelf: "center", width: "70%",
                    backgroundColor: colors.green, flexDirection: "row", borderRadius: 30,
                    alignItems: "center", justifyContent: "center", paddingHorizontal: 12,
                    shadowColor: "#000000",
                    shadowOpacity: 0.3033,
                    shadowRadius: 2.5,
                    shadowOffset: {
                        height: 3,
                        width: 1
                    },
                    paddingVertical: 8,

                    elevation: 3,

                }}
                    onPress={() => { handleAddFlag() }}>

                    <Text style={{ fontWeight: "600", fontSize: 14, color: colors.white }}>Add Flag</Text>

                </Pressable>

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

export default AddFlagModal