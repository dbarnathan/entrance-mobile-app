import React, { useEffect, useCallback, useMemo, useRef, useState, useContext } from "react"
import { View, Text, Pressable, ScrollView, TouchableOpacity, useWindowDimensions, TextInput, Animated, Image, Share, TouchableWithoutFeedback, StyleSheet, Switch, KeyboardAvoidingView, Keyboard, Platform } from 'react-native';
import { UserDataContext } from "../context/UserDataContext";
import Modal from "react-native-modal";
import colors from "../theme/colors";
import axios from "axios";
import Toast from 'react-native-toast-message';


export const NewContactListName = (props) => {
    const { isVisible, setIsVisible, item } = props

    const { userData, userFlags, getContactLists } = useContext(UserDataContext)

    const [newName, setNewName] = useState("")


    const deviceHeight = useWindowDimensions().height

    const deviceWidth = useWindowDimensions().width

    const handleChange = () => {
        const config = {
            method: 'patch',
            url: `https://${process.env.EXPO_PUBLIC_LIVE}/contact-lists/${item.id}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': userData.access_token
            },
            data: {
                name: newName
            }
        };

        axios(config).then(async (response) => {
            console.log(response.data.record, " : Channel DATA")

            Toast.show({
                type: 'success',
                text1: 'Updated',
                text2: 'Successfully changed name. 👋'
            });
            setIsVisible(false)
            getContactLists(userData)


            console.log("Name Updated... ", response.data.record)
        }).catch((err) => {
            console.log(err.toJSON(), " Archive Error");

        })
    }



    useEffect(() => {
        console.log("FLAG LIST: ", userFlags)
    }, [])



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
            <KeyboardAvoidingView
                style={styles.main}
            >

                    <ScrollView
                        keyboardShouldPersistTaps="always"
                        style={{}}
                        scrollEnabled={false}
                    >

                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <Text style={{ fontWeight: "600", fontSize: 25, paddingBottom: 12 }}>Change Name</Text>


                        </View>
                        <TextInput

                            style={{ backgroundColor: colors.lightGrayPurple, color: "black", borderRadius: 12, fontSize: 16, padding: 12, borderColor: "#7972BC", borderWidth: 1, marginBottom: 15 }}
                            placeholderTextColor={"gray"}

                            placeholder={"Contact List Name"}

                            onChangeText={(value) => setNewName(value)}
                            value={newName}
                            underlineColorAndroid="transparent"

                        />

                        <Pressable style={[styles.createButton,]} onPress={() => { handleChange() }} >
                            <Text style={{ color: "white", fontSize: 14 }}>Change Name</Text>

                        </Pressable>


                    </ScrollView>


            </KeyboardAvoidingView>




        </Modal >
    )
}

const styles = StyleSheet.create({

    main: {
        backgroundColor: colors.white,

        borderRadius: 20,

        padding: 20,
        flexDirection: "column",

    },
    backModal: {

        margin: 20,
        marginTop: 10

    },
    dropdown: {
        paddingVertical: 5,
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 8,
        width: '40%',

    },
    createButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 15,

        backgroundColor: "#0162E8",
    },

})

export default NewContactListName