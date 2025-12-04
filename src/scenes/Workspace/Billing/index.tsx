import React, { useEffect, useContext, useState, useRef, useCallback } from 'react'
import { Alert, FlatList, Keyboard, Platform, Pressable, SafeAreaView, ScrollView, StatusBar, Switch, Text, TextInput, TouchableWithoutFeedback, View, useWindowDimensions, Image } from 'react-native';
import { UserDataContext } from '../../../context/UserDataContext';
import { ColorSchemeContext } from '../../../context/ColorSchemeContext'
import ScreenTemplate from '../../../components/ScreenTemplate';
import { FontAwesome, FontAwesome5, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';
import { colors, fontSize } from '../../../theme';
import styles from './styles';
import { useNavigation } from '@react-navigation/native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';
import axios from 'axios';
import uFuzzy from '@leeoniya/ufuzzy';
import { WorkspaceUsersEditModal } from '../../../components/WorkspaceUsersEditModal';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateModal from '../../../components/DateModal';

export default function Billing() {

    const { setUserData, userData, workspaceCampaigns, recentCampaigns, workspaceUsers, getWorkspaceCampaigns } = useContext(UserDataContext)
    const { scheme } = useContext(ColorSchemeContext)

    const [search, setSearch] = useState('')
    const [searchResult, setSearchResult] = useState([])

    const [billing, setBilling] = useState([])

    const [showEdit, setShowEdit] = useState(false)

    const [showBilling, setShowBilling] = useState(false)
    const [cardNumber, setCardNumber] = useState("")
    const [exp, setExp] = useState("")
    const [cvv, setCvv] = useState("")
    const [postalCode, setPostalCode] = useState("")

    const [dateVisible, setDateVisible] = useState(false)


    const isDark = scheme === 'dark'

    const deviceWidth = useWindowDimensions().width
    const deviceHeight = useWindowDimensions().height

    const navigation = useNavigation()

    const getSearchIndexes = useCallback((haystack: string[], needle: string): number[] => {

        if (needle.length < 1) return undefined

        const uf = new uFuzzy({
            intraMode: 1,
        })

        const result = uf.filter(haystack, needle)

        return [...result]

    }, [])

    const handleLogOut = async () => {
        await AsyncStorage.clear();
        setUserData('')
    }


    useEffect(() => {

        console.log("ENV: ", process.env.HOST_NAME)


        const searchCampaignIndexes = getSearchIndexes(workspaceCampaigns.map(item => item?.name), search)

        if (!searchCampaignIndexes) return;

        setSearchResult((previous) => {

            if (searchCampaignIndexes.length < 1) return previous

            const searchItems = searchCampaignIndexes.map((index) => workspaceCampaigns[index])

            return searchItems

        })

    }, [search, workspaceCampaigns, getSearchIndexes])

    useEffect(() => {
        axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/billing/usage`, {
            headers: {
                'Authorization': userData.access_token
            }
        }).then((response) => {
            console.log(response.data, " : Billing DATA")
            setBilling(response.data)
        })
    }, [])

    const options = {

        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    };

    const handleExp = (val) => {
        
        if (val.length >= 3 && !val.includes("/")) {
            let newVal = val.slice(0, 2) + "/" + val.slice(2);
            setExp(newVal)
        } else {
            setExp(val)
        }
    }

    const handleCard = (val) => {
        if(val.length > 3) {
            let newVal = val.replace(/\D/g, '')
            let newCard = newVal.match(/.{1,4}/g).join(' ')
            setCardNumber(newCard)
        }else{
            setCardNumber(val)
        }
 
   
    }


    return (
        <TouchableWithoutFeedback style={{}} onPress={() => { Keyboard.dismiss() }}>
            <>

                <WorkspaceUsersEditModal isVisible={showEdit} setIsVisible={setShowEdit} />



                <View style={{ padding: 12, marginTop: -12, paddingBottom: 8, justifyContent: "space-between", flexDirection: "row", backgroundColor: "white", alignItems: "center" }}>

                    <View style={{ flexDirection: "row", gap: 5, padding: 0, }}>
                        <Pressable style={{ position: "absolute", height: 70, width: 90, top: -15, left: -15 }} onPress={() => { navigation.goBack() }}></Pressable>

                        <FontAwesome5 name="chevron-left" size={22} color="black" />


                    </View>
                    <View style={{}}>
                        <Text style={{ fontSize: 18, fontWeight: "500" }}>Billing</Text>
                    </View>
                    <View style={{ paddingTop: 0, paddingRight: 12, alignItems: "center" }}>

                    </View>
                    <View style={{ position: "absolute", top: 0, right: 10, flex: 1 }}>
                        <Image source={require('../../../../assets/images/purpleE.png')} resizeMode='contain'
                            style={{ alignSelf: "flex-start", height: deviceHeight * .05, width: deviceWidth * .08, }} />
                    </View>
                </View>
                <KeyboardAwareScrollView bounces={false} keyboardShouldPersistTaps={'always'} keyboardDismissMode="on-drag" style={{ backgroundColor: "#FAF0DC", height: "100%", }}
                    resetScrollToCoords={null}
                    enableOnAndroid={true}
                    extraScrollHeight={0}>


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
                            <View style={{ flexDirection: 'row', justifyContent: "space-between" }}>
                                <Text style={{ fontWeight: "600", fontSize: 16, paddingBottom: 16 }}>Billing Overview</Text>

                            </View>
                            <Text style={{ color: colors.primaryText, fontSize: 14, fontWeight: "600" }}>Account Type: <Text>Special</Text></Text>

                            <View style={{ backgroundColor: colors.lightGrayPurple, padding: 12, marginTop: 10, borderRadius: 12, gap: 10 }}>
                                <Text style={{ color: colors.grayLight, fontSize: 17, fontWeight: "500" }}>Numbers</Text>
                                <View style={{ flexDirection: 'row', justifyContent: "space-between" }}>
                                    <Text style={{ color: colors.grayLight, fontSize: 15, fontWeight: "500" }}>Quantity:</Text>
                                    <Text style={{ color: colors.grayLight, fontSize: 15, fontWeight: "500" }}>{ }</Text>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: "space-between" }}>
                                    <Text style={{ color: colors.grayLight, fontSize: 15, fontWeight: "500" }}>Cost:</Text>
                                </View>
                                <Text style={{ color: colors.grayLight, fontSize: 15, fontWeight: "500" }}>Description:</Text>
                            </View>
                            <View style={{ backgroundColor: colors.lightGrayPurple, padding: 12, marginTop: 10, borderRadius: 12, gap: 10 }}>
                                <Text style={{ color: colors.grayLight, fontSize: 17, fontWeight: "500" }}>Current Period</Text>
                                <View style={{ flexDirection: 'row', justifyContent: "space-between" }}>
                                    <Text style={{ color: colors.grayLight, fontSize: 15, fontWeight: "500" }}>Start Date:</Text>
                                    <Text style={{ color: colors.grayLight, fontSize: 14, fontWeight: "500" }}>{new Date(billing?.start_date).toLocaleDateString("us-EN", options)}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: "space-between" }}>
                                    <Text style={{ color: colors.grayLight, fontSize: 15, fontWeight: "500" }}>End Date:</Text>
                                    <Text style={{ color: colors.grayLight, fontSize: 14, fontWeight: "500" }}>{new Date(billing?.start_date).toLocaleDateString("us-EN", options)}</Text>
                                </View>

                            </View>

                            <View style={{ backgroundColor: colors.lightGrayPurple, padding: 12, marginTop: 10, borderRadius: 12, gap: 10 }}>
                                <Text style={{ color: colors.grayLight, fontSize: 17, fontWeight: "500" }}>Current Usage</Text>
                                <View style={{ flexDirection: 'row', justifyContent: "space-between" }}>
                                    <Text style={{ color: colors.grayLight, fontSize: 15, fontWeight: "500" }}>Current Cost:</Text>
                                    <Text style={{ color: colors.grayLight, fontSize: 14, fontWeight: "500" }}>{billing?.cost_per_segment?.toFixed(3)}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: "space-between" }}>
                                    <Text style={{ color: colors.grayLight, fontSize: 15, fontWeight: "500" }}>Usage:</Text>
                                    <Text style={{ color: colors.grayLight, fontSize: 14, fontWeight: "500" }}>{billing?.segments}</Text>
                                </View>

                            </View>

                        </View>

                    </View>

{/* 
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
                            <View style={{ flexDirection: 'row', justifyContent: "space-between" }}>
                                <Text style={{ fontWeight: "600", fontSize: 16, paddingBottom: 16 }}>Billing Sources</Text>

                            </View>
                         
                            <Pressable style={styles.button} onPress={() => {  }}>
                                <Text style={{ color: colors.darkPurple, fontSize: 14, fontWeight: "600" }}>Add Payment Source</Text>
                            </Pressable>


                        </View>

                    </View> */}

                    {/* <Pressable style={[styles.logOut, { marginTop: 10, marginBottom: 30 }]} onPress={() => { handleLogOut() }}>
                        <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>Logout</Text>
                    </Pressable> */}



                </KeyboardAwareScrollView>

            </>

        </TouchableWithoutFeedback>
    )
}