import React, { useEffect, useState, useContext, useLayoutEffect, useCallback, useRef } from 'react'
import { Text, View, ScrollView, StyleSheet, Pressable, useWindowDimensions, Keyboard, TouchableOpacity, Image, Switch, Platform } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { TextInput } from 'react-native';
import { UserDataContext } from '../../../context/UserDataContext';
import { colors, fontSize } from '../../../theme'
import { ColorSchemeContext } from '../../../context/ColorSchemeContext'
import axios from 'axios'
import styles from './styles'
import { Entypo, Feather } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useRoute } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function MessageManager() {
    const navigation = useNavigation()
    const deviceHeight = useWindowDimensions().height;
    const deviceWidth = useWindowDimensions().width;
    
    const { userData, getWorkspaceUsers, userGroups } = useContext(UserDataContext)
    const { scheme } = useContext(ColorSchemeContext)
    const [selected, setSelected] = useState("")

    const [campaignFilterPhrase, setCampaignFilterPhrase] = useState("")
    const [messageKeywords, setMessageKeywords] = useState("")
    const [emailAdmin, setEmailAdmin] = useState(false)


    const [campaignName, setCampaignName] = useState("")

    const [filterList, setFilterList] = useState([])
    const [keywordList, setKeywordList] = useState([])

    const [canCreate, setCanCreate] = useState(false)

    useEffect(() => {
        axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/incoming-message-keywords`, { headers: { 'Authorization': userData.access_token } }).then((response) => {
            let stringMessage = ""
            let temp = keywordList
            const updatedKeywords = response.data.records || [];
            setKeywordList((prevList) => [...prevList, ...updatedKeywords]);
            // setMessageKeywords(stringMessage)


        }).catch((err) => {
            console.log(err, " :ERROR SENDING TEST MESSAGE");

        })
    }, [])

    useEffect(() => {
        let temp = keywordList

        console.log("NEEEWW: ", keywordList)

        setKeywordList(temp)
    }, [setKeywordList])


    useEffect(() => {


        navigation.getParent()?.setOptions({
            tabBarStyle: {
                display: "none"
            }
        });
    }, [])


    useEffect(() => {
        console.log("SELECTED: ", selected)
        if (campaignName.length > 2 && selected) {
            setCanCreate(true)
        }

    }, [campaignName, selected])

    const handleFiltering = () => {
        let temp = filterList
        temp.push(campaignFilterPhrase)
        setCampaignFilterPhrase("")
    }

    const handleKeyword = () => {
        let temp = keywordList
        temp.push(messageKeywords)
        axios.post(`https://${process.env.EXPO_PUBLIC_LIVE}/incoming-message-keywords`, { keyword: messageKeywords }, { headers: { 'Authorization': userData.access_token } }).then((response) => {
            console.log("Successfully updated keywords !!: ", response.data)

        }).catch((err) => {
            console.log(err.response.data, ":ERROR SENDING KEYWORD");

        })
        setMessageKeywords("")
    }


    const handleDelete = ({ item }) => {
        let temp = filterList
        temp = temp.filter((i) => i !== item)
        setFilterList(temp)

        axios.delete(`https://${process.env.EXPO_PUBLIC_LIVE}/incoming-message-keywords`, { params: { keyword: item } }, { headers: { 'Authorization': userData.access_token } }).then((response) => {
            let stringMessage = ""
            let temp = keywordList
            response.data.records.forEach((ele) => {
                temp.push(ele)
            })
            // setKeywordList(temp)
            // setMessageKeywords(stringMessage)


        }).catch((err) => {
            console.log(err, " :ERROR SENDING TEST MESSAGE");

        })
        Toast.show({
            type: 'success',
            text1: 'Updated',
            text2: 'Successfully deleted filter phrase!'
        });
    }

    const handleDeleteKey = ({ item }) => {
        let temp = keywordList
        temp = temp.filter((i) => i !== item)
        setKeywordList(temp)
        Toast.show({
            type: 'success',
            text1: 'Updated',
            text2: 'Successfully deleted keyword!'
        });
    }


    const FilteredItem = ({ item }) => {
        return (
            <Pressable style={{ backgroundColor: colors.green, padding: 8, borderRadius: 8, paddingHorizontal: 18, maxWidth: 230 }} onPress={() => handleDelete({ item })}>
                <Text style={{ fontWeight: "500", color: "white" }} numberOfLines={1} ellipsizeMode='tail'>{item}</Text>
            </Pressable>
        )
    }

    const KeywordItem = ({ item }) => {
        return (
            <Pressable style={{ backgroundColor: colors.green, padding: 8, borderRadius: 8, paddingHorizontal: 18, maxWidth: 230 }} onPress={() => handleDeleteKey({ item })}>
                <Text style={{ fontWeight: "500", color: "white" }} numberOfLines={1} ellipsizeMode='tail'>{item}</Text>
            </Pressable>
        )
    }




    return (
        <>
            <View style={{ backgroundColor: "white" }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 10, paddingTop: 3, paddingBottom: 0 }}>
                    <Feather name="chevron-left" size={30} color="black" />
                </TouchableOpacity>
                <View style={{ paddingHorizontal: 20, paddingBottom: 5 }}>
                    <Text style={{ fontSize: 25, fontWeight: "600" }}>Message Manager</Text>
                    <Text style={{ color: colors.grayLight }}>Manage Campaign Filters and Incoming Message Keywords</Text>
                </View>

            </View>
            <KeyboardAwareScrollView bounces={false} keyboardShouldPersistTaps={'always'} keyboardDismissMode="on-drag" style={styles.card} showsVerticalScrollIndicator={false}>
                <View style={{
                    flexDirection: "row", alignItems: "flex-start", justifyContent: "flex-start",
                    shadowColor: "#000000",
                    shadowOpacity: 0.3033,
                    shadowRadius: 2.5,
                    shadowOffset: {
                        height: 3,
                        width: 1
                    },
                    elevation: 5,
                }}>
                    <View style={{ borderRadius: 12, backgroundColor: "white", margin: 10, padding: 12, flex: 1 }}>



                        <View style={{ justifyContent: "space-between", marginBottom: 10 }}>
                            <View style={{ marginBottom: 10 }}>
                                <Text style={{ fontWeight: "500", fontSize: 14, paddingBottom: 5 }}>Filtering</Text>
                            </View>
                            <View style={{ marginBottom: 10 }}>
                                <Text style={{ color: colors.black, fontWeight: "500", fontSize: 18 }}>Campaign Text Filters</Text>
                            </View>
                            <View style={{ marginBottom: 13 }}>
                                <Text style={{ color: colors.grayLight, paddingBottom: 5 }}>Here you can include words that you DO NOT want users saying in a message.</Text>
                                <Text style={{ color: colors.grayLight }}>If a match is detected it will not allow the user to send the campaign.</Text>
                            </View>
                            <View style={{ gap: 5, flexDirection: "row", flexWrap: "wrap" }}>
                                {
                                    filterList.map((item) => (
                                        <FilteredItem item={item} />
                                    ))
                                }
                            </View>

                            <View style={{ flexDirection: "row", gap: 12, alignItems: "flex-end", marginTop: 5 }}>
                                <TextInput
                                    style={{ backgroundColor: colors.lightGrayPurple, color: "black", borderRadius: 12, fontSize: 16, padding: 12, borderColor: "#7972BC", borderWidth: 1, width: "65%", marginTop: 10 }}
                                    placeholderTextColor={"gray"}
                                    placeholder={"max (128 characters)"}
                                    maxLength={128}
                                    onChangeText={(value) => setCampaignFilterPhrase(value)}
                                    value={campaignFilterPhrase} />
                                <Pressable style={[styles.updateButton, { backgroundColor: "#0162E8", paddingVertical: 9 }]} onPress={() => { handleFiltering() }}>


                                    <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>Add</Text>

                                </Pressable>

                            </View>


                            {/* 
                            <Switch
                                trackColor={{ false: '#767577', true: '#81b0ff' }}
                                thumbColor={item.select ? '#f5dd4b' : '#f4f3f4'}
                                ios_backgroundColor="#3e3e3e"
                                onValueChange={(value) => handleSettingChange(value, item.setSelection, item.property)}
                                value={item.select}
                                style={{
                                    transform: [{ scaleX: Platform.OS == "ios" ? .75 : 1 }, { scaleY: Platform.OS == "ios" ? .75 : 1 }] // Change the scale as needed
                                }}
                            />
                            <TextInput
                                style={{ backgroundColor: colors.lightGrayPurple, color: "black", borderRadius: 12, fontSize: 16, padding: 12, borderColor: "#7972BC", borderWidth: 1, width: "65%", marginTop: 10 }}
                                placeholderTextColor={"gray"}
                                placeholder={"10"}
                                maxLength={11}
                                keyboardType={"phone-pad"}
                                onChangeText={(value) => handleSettingChange(value, item?.setSelection, item.property)}
                                value={item.select}


                            /> */}

                            {/* <View style={{ borderBottomColor: "#BFBFBF", borderBottomWidth: 1, width: "100%", marginTop: 10 }}></View> */}

                        </View>



                    </View>

                </View>

                <View style={{
                    flexDirection: "row", alignItems: "flex-start", justifyContent: "flex-start",
                    shadowColor: "#000000",
                    shadowOpacity: 0.3033,
                    shadowRadius: 2.5,
                    shadowOffset: {
                        height: 3,
                        width: 1
                    },
                    elevation: 5,
                }}>
                    <View style={{ borderRadius: 12, backgroundColor: "white", margin: 10, padding: 12, flex: 1 }}>


                        <View style={{ justifyContent: "space-between", marginBottom: 10 }}>
                            <View style={{ marginBottom: 10 }}>
                                <Text style={{ fontWeight: "500", fontSize: 14, paddingBottom: 5 }}>Keywords</Text>
                            </View>
                            <View style={{ marginBottom: 10 }}>
                                <Text style={{ color: colors.black, fontWeight: "500", fontSize: 18 }}>Incoming Message Keywords</Text>
                            </View>
                            <View style={{ marginBottom: 5 }}>
                                <Text style={{ color: colors.grayLight, paddingBottom: 5 }}>Add and remove incoming message keywords and setup notifications when incoming messages contain keywords</Text>
                            </View>
                            <View style={{ gap: 5, flexDirection: "row", flexWrap: "wrap" }}>
                                {
                                    keywordList.map((item) => (
                                        <KeywordItem item={item} />
                                    ))
                                }
                            </View>

                            <View style={{ flexDirection: "row", gap: 12, alignItems: "flex-end" }}>
                                <TextInput
                                    style={{ backgroundColor: colors.lightGrayPurple, color: "black", borderRadius: 12, fontSize: 16, padding: 12, borderColor: "#7972BC", borderWidth: 1, width: "65%", marginTop: 10 }}
                                    placeholderTextColor={"gray"}
                                    placeholder={"max (128 characters)"}
                                    maxLength={128}
                                    onChangeText={(value) => setMessageKeywords(value)}
                                    value={messageKeywords} />
                                <Pressable style={[styles.updateButton, { backgroundColor: "#0162E8", paddingVertical: 9 }]} onPress={() => { handleKeyword() }}>


                                    <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>Add</Text>

                                </Pressable>

                            </View>

                            <View style={{ paddingBottom: 5, paddingTop: 15 }}>
                                <Text style={{ paddingBottom: 5 }}>Email admin on incoming message keywords</Text>
                                <Switch
                                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                                    thumbColor={emailAdmin ? '#f5dd4b' : '#f4f3f4'}
                                    ios_backgroundColor="#3e3e3e"
                                    onValueChange={(value) => setEmailAdmin(value)}
                                    value={emailAdmin}
                                    style={{
                                        transform: [{ scaleX: Platform.OS == "ios" ? .75 : 1 }, { scaleY: Platform.OS == "ios" ? .75 : 1 }] // Change the scale as needed
                                    }}
                                />
                            </View>

                            {/* 
                       
                            <TextInput
                                style={{ backgroundColor: colors.lightGrayPurple, color: "black", borderRadius: 12, fontSize: 16, padding: 12, borderColor: "#7972BC", borderWidth: 1, width: "65%", marginTop: 10 }}
                                placeholderTextColor={"gray"}
                                placeholder={"10"}
                                maxLength={11}
                                keyboardType={"phone-pad"}
                                onChangeText={(value) => handleSettingChange(value, item?.setSelection, item.property)}
                                value={item.select}


                            /> */}

                            {/* <View style={{ borderBottomColor: "#BFBFBF", borderBottomWidth: 1, width: "100%", marginTop: 10 }}></View> */}

                        </View>



                    </View>

                </View>


                <View style={{ marginBottom: deviceHeight * .2 }} ></View>

            </KeyboardAwareScrollView>


        </>


    )
}

