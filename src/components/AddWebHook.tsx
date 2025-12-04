import React, { useEffect, useCallback, useMemo, useRef, useState, useContext } from "react"
import { View, Text, Pressable, ScrollView, TouchableOpacity, useWindowDimensions, TextInput, Animated, Image, Share, DeviceEventEmitter, StyleSheet, Switch, KeyboardAvoidingView, FlatList } from 'react-native';

import Modal from "react-native-modal";
import colors from "../theme/colors";
import axios from "axios";
import { UserDataContext } from "../context/UserDataContext";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export const AddWebHook = (props) => {
    const { isVisible, setIsVisible, link, data, flagProp, changeFlagProp } = props

    const { userData } = useContext(UserDataContext)
    const [flagList, setFlagList] = useState([])
    const [url, setUrl] = useState("")

    const deviceHeight = useWindowDimensions().height

    const deviceWidth = useWindowDimensions().width

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

    const Flag = ({ item }) => {
        console.log("Follow component: ", item)

        const [id, setId] = useState("")
        const [otherUser, setOtherUser] = useState()

        const handleUpdateFlag = () => {

            const config = {
                method: 'put',
                url: `https://${process.env.EXPO_PUBLIC_LIVE}/channels/${data.id}`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': userData.access_token
                },
                data: {
                    flag_id: item.id
                }
            };
            axios(config).then((response) => {
                setIsVisible(false)
                changeFlagProp(item)
                console.log(response.data.record, " : Channel DATA")

            }).catch((err) => {
                console.log(err);

            })

        }

        return (
            <Pressable style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 12, }}
                onPress={() => {
                    handleUpdateFlag()
                }}>
                <View style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: item.color_id }} />
                <Text style={{ fontWeight: "500", fontSize: 16, }}>{item.name}</Text>
            </Pressable>
        )
    }

    const handleAddUrl = () => {

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

            <View style={[styles.main, {}]}>

                <Text style={{ fontWeight: "600", fontSize: 25, paddingBottom: 12 }}>Manage Webhooks</Text>
                <Text style={{ color: colors.grayLight, }}>Add a webhook</Text>

                {/* <FlatList
                        data={flagList}
                        keyExtractor={(item) => item.name + Math.random() * 9999}
                        ItemSeparatorComponent={() => <View
                            style={{
                                padding: 4
                            }}
                        />}
                        scrollEnabled={true}
                        style={{
                            marginBottom: 30,
                        }}
                        renderItem={({ item, index }) => (
                            <Flag item={item} />
                        )}
                    /> */}
                <View style={{ flexDirection: "row", gap: 8, paddingBottom: 15 }}>
                    <TextInput
                        style={{ backgroundColor: colors.lightGrayPurple, color: "black", borderRadius: 12, fontSize: 16, padding: 12, borderColor: "#7972BC", borderWidth: 1, width: "70%", marginTop: 10 }}
                        placeholderTextColor={"gray"}
                        placeholder="Enter Valid Url"

                        onChangeText={(value) => setUrl(value)}
                        value={url} />
                    <Pressable style={[styles.updateButton, { backgroundColor: "#0162E8", paddingVertical: 0 }]} onPress={() => { handleAddUrl() }}>


                        <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>Save</Text>

                    </Pressable>

                </View>
                <View style={{ gap: 5 }}>



                    <View style={{ borderWidth: 1, borderColor: colors.lightPurple, borderRadius: 10, flexDirection: "row", justifyContent: "space-between", padding: 8 }}>
                        <Text style={{ fontWeight: "500", fontSize: 16, padding: 10 }}>https://www.example.com</Text>
                        <Pressable style={[styles.updateButton, { backgroundColor: colors.pink, paddingHorizontal: 8 }]} onPress={() => { handleAddUrl() }}>

                            <Text style={{ color: "white", fontSize: 11, fontWeight: "600" }}>Remove</Text>

                        </Pressable>
                    </View>
                    <View style={{ borderWidth: 1, borderColor: colors.lightPurple, borderRadius: 10, flexDirection: "row", justifyContent: "space-between", padding: 8 }}>
                        <Text style={{ fontWeight: "500", fontSize: 16, padding: 10 }}>https://www.example.com</Text>
                        <Pressable style={[styles.updateButton, { backgroundColor: colors.pink, paddingHorizontal: 8 }]} onPress={() => { handleAddUrl() }}>

                            <Text style={{ color: "white", fontSize: 11, fontWeight: "600" }}>Remove</Text>

                        </Pressable>
                    </View>
                </View>



            </View>





            <View style={{ paddingBottom: 30, paddingTop: 30 }} />


        </Modal >
    )
}

const styles = StyleSheet.create({

    main: {
        backgroundColor: colors.white,
        // alignItems: "flex-start",
        justifyContent: "flex-start",
        borderRadius: 20,

        padding: 20,
        flexDirection: "column"
    },

    backModal: {

        margin: 20,
        marginTop: 50

    },
    updateButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 6,
        paddingHorizontal: 32,
        borderRadius: 12,
        shadowColor: "#000000",
        shadowOpacity: 0.3033,
        shadowRadius: 2.5,
        shadowOffset: {
            height: 2,
            width: 1
        },

        elevation: 3,
        backgroundColor: '#E6D6FA',
    },

})

export default AddWebHook