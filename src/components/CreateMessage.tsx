import React, { useEffect, useCallback, useMemo, useRef, useState, useContext, } from "react"

import { View, Text, Pressable, ScrollView, TouchableOpacity, useWindowDimensions, Platform, TextInput, Animated, Image, Share, DeviceEventEmitter, StyleSheet, Switch, KeyboardAvoidingView, FlatList, Alert, Keyboard, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { UserDataContext } from "../context/UserDataContext";
import Modal from "react-native-modal";
import colors from "../theme/colors";
import axios from "axios";
import Toast from 'react-native-toast-message';
import ColorPickerModal from "./ColorPickerModal";
import { Dropdown } from "react-native-element-dropdown";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export const CreateMessage = (props) => {

    const { userData, userFlags } = useContext(UserDataContext)

    const {isVisible, setIsVisible} = props

    const [flagName, setFlagName] = useState("")
    const [selectedColor, setSelectedColor] = useState("#000000")
    const [showColor, setShowColor] = useState(false)
    const [isNumbers, setIsNumbers] = useState(true)

    const [selectedFlag, setSelectedFlag] = useState("")

    const [flagFocus, setFlagFocus] = useState(false)

    const [message, setMessage] = useState("")

    const [validMessage, setValidMessage] = useState(false)
    const [numberList, setNumberList] = useState("")
    const [flagNumberList, setFlagNumberList] = useState([])

    const [isLoading, setIsLoading] = useState(false)

    const deviceHeight = useWindowDimensions().height

    const handleAddFlag = () => {
        let list1 = []
        let list2 = []

        let tempNumberList = []
        axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/channels`, {
            headers: {
                'Authorization': userData.access_token
            },
            params: {
                limit: 999,
                bookmarked: true,
                claimed: true

            }
        }).then((response) => {
            list1 = response.data.records;
            axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/channels`, {
                headers: {
                    'Authorization': userData.access_token
                },
                params: {
                    limit: 999,
                    bookmarked: false,
                    claimed: true

                }
            }).then((response2) => {
                list2 = response2.data.records;
                const combined = [...list1, ...list2]
                console.log("C O M B I N E D: ", combined)
                var result = combined.reduce((unique, o) => {
                    if (!unique.some(obj => obj.id == o.id)) {
                        unique.push(o);
                    }
                    return unique;
                }, []);

                result.forEach((ele) => {
                    if (ele.flag_id == selectedFlag.id) {
                        tempNumberList.push(ele)
                    }
                })

                console.log(result, " : FLAG CHANNEL DATA")
                setFlagNumberList(result)
            })

        }).catch((err) => {
            console.log(err.toJSON());
        })
    }

    const handleSendMessage = () => {


        let numbers = []
        if (isNumbers) {
            numbers = numberList.replace(" ", "").split(",")

        } else {
            flagNumberList.forEach((ele) => {
                numbers.push(ele.number)
            })
        }

        console.log("Numbers: ", numbers)

        console.log("Numbers selected: ", numbers)
        axios.post(`https://${process.env.EXPO_PUBLIC_LIVE}/campaigns`, { name: "new_message", type: "MANUAL", text_message: message, numbers }, { headers: { 'Authorization': userData.access_token } }).then((response) => {

            console.log("RESPONSE: ", response.data)
            Toast.show({
                type: 'success',
                text1: 'Message Sent',
                text2: 'Message Sent Successfully. 👋'
            });
            setIsVisible(false)

        }).catch((err) => {
            console.log(err, " :ERROR CREATING CAMPAIGN");

        })
    }


    useEffect(() => {
        if (message.length > 4) {
            setValidMessage(true)
        }
        else {
            setValidMessage(false)
        }
    }, [message])


    
    return (
    
            <KeyboardAwareScrollView style={[styles.main]} contentContainerStyle={{ }} extraScrollHeight={20}>
                <ColorPickerModal
                    isVisible={showColor}
                    setIsVisible={setShowColor}
                    color={selectedColor}
                    setSelectedColor={setSelectedColor}
                />

                <View style={{ flexDirection: "column", justifyContent: "space-between", paddingBottom: 18 }}>
                    <Text style={{ fontWeight: "600", fontSize: 22, paddingBottom: 12 }}>Create Message</Text>
                    <Text style={{ color: colors.grayLight }}>Please enter the numbers separated by a comma below</Text>
                </View>

                <View style={{ flexDirection: "row", gap: 5, paddingBottom: 20 }}>
                    <Pressable
                        style={{
                            paddingHorizontal: 15,
                            paddingVertical: 10,
                            backgroundColor: isNumbers ? colors.lightPurple : "white",
                            borderRadius: 22,
                            borderWidth: 1,
                            borderColor: colors.lightPurple,
                        }}
                        onPress={() => setIsNumbers(!isNumbers)}
                    >
                        <Text style={{ fontWeight: "500", color: isNumbers ? "white" : "black" }}>Numbers</Text>
                    </Pressable>
                    <Pressable
                        style={{
                            paddingHorizontal: 15,
                            paddingVertical: 10,
                            backgroundColor: isNumbers ? "white" : colors.lightPurple,
                            borderRadius: 22,
                            borderWidth: 1,
                            borderColor: colors.lightPurple,
                        }}
                        onPress={() => setIsNumbers(!isNumbers)}
                    >
                        <Text style={{ fontWeight: "500", color: isNumbers ? "black" : "white" }}>Flags</Text>
                    </Pressable>
                </View>

                {isNumbers ? (
                    <View style={{ gap: 10, justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                        <Text style={{ fontWeight: "500", fontSize: 14 }}>Numbers</Text>
                        <TextInput
                            style={{
                                backgroundColor: colors.lightGrayPurple,
                                color: "black",
                                borderRadius: 9,
                                borderColor: "#7972BC",
                                borderWidth: 1,
                                fontSize: 16,
                                padding: 18,
                                height: 80,
                                width: "100%",
                            }}
                            keyboardType="numbers-and-punctuation"
                            placeholderTextColor={"gray"}
                            multiline
                            placeholder={"Enter numbers"}
                            onChangeText={(value) => setNumberList(value)}
                            value={numberList}
                            underlineColorAndroid="transparent"
                        />
                    </View>
                ) : (
                    <View style={{ gap: 10, justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                        <Text style={{ fontWeight: "500", fontSize: 14 }}>Flags</Text>
                        <View style={{ flexDirection: "row", gap: 10 }}>
                            <Dropdown
                                style={[styles.dropdown, flagFocus && { borderColor: 'blue' }]}
                                data={userFlags}
                                selectedTextStyle={{ fontSize: 12 }}
                                inputSearchStyle={{ fontSize: 12 }}
                                itemTextStyle={{ fontSize: 12, fontWeight: "600" }}
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
                                    console.log("I T E M: ", item);
                                    setSelectedFlag(item);
                                    handleAddFlag();
                                    setFlagFocus(false);
                                }}
                            />
                            <View
                                style={{
                                    backgroundColor: selectedFlag.color_id,
                                    borderRadius: 12,
                                    width: 90,
                                    height: "100%",
                                }}
                            ></View>
                        </View>
                    </View>
                )}

                <View style={{ gap: 10, justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40, paddingTop: 15 }}>
                    <Text style={{ fontWeight: "500", fontSize: 14 }}>Message Body</Text>
                    <TextInput
                        style={{
                            backgroundColor: colors.lightGrayPurple,
                            color: "black",
                            borderRadius: 9,
                            borderColor: "#7972BC",
                            borderWidth: 1,
                            fontSize: 16,
                            padding: 18,
                            height: 80,
                            width: "100%",
                        }}
                        placeholderTextColor={"gray"}
                        multiline
                        placeholder={"Enter your message..."}
                        onChangeText={(value) => setMessage(value)}
                        value={message}
                        underlineColorAndroid="transparent"
                    />
                </View>

                <Pressable
                    style={{
                        alignSelf: "flex-start",
                        backgroundColor: validMessage ? colors.green : "#A4ACC0",
                        flexDirection: "row",
                        borderRadius: 10,
                        alignItems: "center",
                        justifyContent: "center",
                        paddingHorizontal: 15,
                        shadowColor: "#000000",
                        shadowOpacity: 0.3033,
                        shadowRadius: 2.5,
                        shadowOffset: {
                            height: 3,
                            width: 1,
                        },
                        paddingVertical: 8,
                        elevation: 3,
                    }}
                    onPress={() => { isLoading ? handleSendMessage() : "" }}
                >
                    {
                        isLoading ? <ActivityIndicator size={90} style={{ height: 100, width: 100 }} /> : <Text style={{ fontWeight: "600", fontSize: 14, color: colors.white }}>Send Message</Text> 
                    }
                    
                </Pressable>
            </KeyboardAwareScrollView>

    )
}

const styles = StyleSheet.create({

    main: {

        borderRadius: 20,

        padding: 20,
        flexDirection: "column",


    },
    backModal: {

        margin: 20,
        marginTop: 50,
        justifyContent: 'center'

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

export default CreateMessage