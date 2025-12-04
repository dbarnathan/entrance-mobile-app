import React, { useEffect, useCallback, useMemo, useRef, useState, useContext } from "react"
import { View, Text, Pressable, ScrollView, TouchableOpacity, useWindowDimensions, TextInput, Animated, Image, Share, DeviceEventEmitter, StyleSheet, Switch, KeyboardAvoidingView, FlatList } from 'react-native';

import Modal from "react-native-modal";
import colors from "../theme/colors";
import axios from "axios";
import { UserDataContext } from "../context/UserDataContext";

export const FlagModal = (props) => {
    const { isVisible, setIsVisible, link, data, flagProp, changeFlagProp } = props

    const {userData} = useContext(UserDataContext)
    const [flagList, setFlagList] = useState([])

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
            <View style={[styles.main, { marginTop: deviceHeight * .55, }]}>

                <Text style={{ fontWeight: "600", fontSize: 25, paddingBottom: 12 }}>Set Flag</Text>

                <FlatList
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
                />
            </View>




            <Pressable style={{
                height: 60, alignSelf: "center", width: "70%", position: "absolute",
                backgroundColor: colors.grayLight, flexDirection: "row", borderRadius: 30,
                alignItems: "center", justifyContent: "center", paddingHorizontal: 12, bottom: 45,

            }}
                onPress={() => { console.log("Flag Removed") }}>

                <View style={{ flexDirection: "row", alignItems: "center", gap: 9 }}>

                    <Text style={{ fontWeight: "600", fontSize: 16, }}>Remove Flag</Text>
                </View>


            </Pressable>
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
        justifyContent: "flex-end"
    },
    backModal: {

        margin: 0,
        marginTop: 50



    },

})

export default FlagModal