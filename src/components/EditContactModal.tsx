import React, { useEffect, useCallback, useMemo, useRef, useState, useContext } from "react"
import { View, Text, Pressable, ScrollView, TouchableOpacity, useWindowDimensions, TextInput, Animated, Image, Share, DeviceEventEmitter, StyleSheet, Switch, KeyboardAvoidingView, FlatList, Alert } from 'react-native';
import { UserDataContext } from "../context/UserDataContext";
import Modal from "react-native-modal";
import colors from "../theme/colors";
import axios from "axios";

export const EditContactModal = (props) => {
    const { isVisible, setIsVisible, item, id } = props

    const { userData } = useContext(UserDataContext)
    const [flagList, setFlagList] = useState([])
    const [input, setInput] = useState(item[1])

    const deviceHeight = useWindowDimensions().height

    const deviceWidth = useWindowDimensions().width

    useEffect(() => {
        setInput(item[1])
    }, [isVisible])



    function handleUpdate(key: any) {

        let update = {
            [key]: input
        };

        fetch(`https://${process.env.EXPO_PUBLIC_LIVE}/contacts/${id}/meta`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': userData.access_token
            },
            body: JSON.stringify(update)
        }).then(response => {
            console.log("Response after update: ", response)
            Alert.alert(`Contact has been updated`, '', [
                { text: 'OK', onPress: () => setIsVisible(false) },
            ]);
        })
            .catch(err => {
                console.log(err, " :ERROR ADDING NOTES");
            });
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

                <Text style={{ fontWeight: "600", fontSize: 25, paddingBottom: 12 }}>Edit MetaData</Text>

                <TextInput
                    style={{ backgroundColor: colors.lightGrayPurple, color: "black", borderRadius: 12, fontSize: 16, padding: 12, borderColor: "#7972BC", borderWidth: 1, minWidth: "80%", marginBottom: 15 }}
                    placeholderTextColor={"gray"}
                    placeholder={"Nothing..."}

                    onChangeText={(value) => setInput(value)}
                    value={input}


                />


                <Pressable style={{
                    width: "40%",
                    backgroundColor: "#58bf61", flexDirection: "row", borderRadius: 30,
                    paddingHorizontal: 12, paddingVertical: 12, alignItems: "center", justifyContent: "center"

                }}
                    onPress={() => { handleUpdate(item[0]) }}>



                    <Text style={{ fontWeight: "500", fontSize: 16, color: "white" }}>Confirm</Text>



                </Pressable>
            </View>




            <View style={{ paddingBottom: 30, paddingTop: 30 }} />


        </Modal >
    )
}

const styles = StyleSheet.create({

    main: {
        backgroundColor: colors.white,

        borderRadius: 35,

        padding: 20,
        flexDirection: "column"

    },
    backModal: {

        margin: 20,
        marginTop: 50



    },

})

export default EditContactModal