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
import { Dropdown } from 'react-native-element-dropdown';
import allStates from '../../../../assets/data/allStates';
import Toast from 'react-native-toast-message';

export default function DLC() {

    const { setUserData, userData, workspaceCampaigns, recentCampaigns, workspaceUsers, getWorkspaceCampaigns } = useContext(UserDataContext)
    const { scheme } = useContext(ColorSchemeContext)

    const [search, setSearch] = useState('')
    const [searchResult, setSearchResult] = useState([])

    const [billing, setBilling] = useState([])

    const [companyName, setCompanyName] = useState("");
    const [ein, setEin] = useState("");
    const [entityType, setEntityType] = useState("");
    const [verticals, setVerticals] = useState("");
    const [businessEmail, setBusinessEmail] = useState("");
    const [website, setWebsite] = useState("");
    const [businessNumber, setBusinessNumber] = useState("");
    const [streetAddress, setStreetAddress] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [applicationLink, setApplicationLink] = useState("");
    const [formSubmissionLink, setFormSubmissionLink] = useState("");
    const [sampleMessage1, setSampleMessage1] = useState("");
    const [sampleMessage2, setSampleMessage2] = useState("");
    const [sampleMessage3, setSampleMessage3] = useState("");

    const [isFocus1, setIsFocus1] = useState(false)
    const [isFocus2, setIsFocus2] = useState(false)

    const [selectedEntity, setSelectedEntity] = useState("Private Company")
    const [selectedVertical, setSelectedVertical] = useState("Non-profit Orginization")

    const [businessWarning, setBusinessWarning] = useState(false)
    const [comapanyWarning, setComapanyWarning] = useState(false)

    const [entityTypes, setEntityTypes] = useState([
        { label: "Private Company", value: "Private Company" },
        { label: "Publicly Traded Company", value: "Publicly Traded Company" },
        { label: "Charity/Non Profit", value: "Charity/Non Profit" },
        { label: "Sole Proprietorship", value: "Sole Proprietorship" },
        { label: "Government", value: "Government" },

    ])

    const [vertical, setVertical] = useState(
        [
            { label: "Non-profit Organization", value: "Ngo" },
            { label: "Legal", value: "Legal" },
            { label: "Energy and Utilities", value: "Energy" },
            { label: "Postal and Delivery", value: "Postal" },
            { label: "Retail and Consumer Products", value: "Retail" },
            { label: "Gambling and Lottery", value: "Gambling" },
            { label: "Education", value: "Education" },
            { label: "Financial Services", value: "Financial" },
            { label: "Insurance", value: "Insurance" },
            { label: "Political", value: "Political" },
            { label: "Select...", value: "Select" },
            { label: "Government Services and Agencies", value: "Government" },
            { label: "Healthcare and Life Sciences", value: "Healthcare" },
            { label: "Information Technology Services", value: "Technology" },
            { label: "Agriculture", value: "Agriculture" },
            { label: "Hospitality and Travel", value: "Hospitality" },
            { label: "Real Estate", value: "RealEstate" },
            { label: "Construction, Materials, and Trade Services", value: "Construction" },
            { label: "Professional Services", value: "Professional" },
            { label: "Media and Communication", value: "Communication" },
            { label: "Entertainment", value: "Entertainment" },
            { label: "Manufacturing", value: "Manufacturing" },
            { label: "Transportation or Logistics", value: "Transportation" },
            { label: "HR, Staffing or Recruitment", value: "HumanResources" }
        ])

    const [selectedState, setSelectedState] = useState("")

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

    const basicInfo = [
        { title: "Company Name", input: companyName, setInput: setCompanyName },
        { title: "EIN", input: ein, setInput: setEin },
        { title: "Entity Type", input: entityType, setInput: setEntityType },
        { title: "Verticals", input: verticals, setInput: setVerticals },
        { title: "Business Email", input: businessEmail, setInput: setBusinessEmail },
        { title: "Website", input: website, setInput: setWebsite },
        { title: "Business Number", input: businessNumber, setInput: setBusinessNumber }
    ];

    const businessAddress = [
        { title: "Street", input: streetAddress, setInput: setStreetAddress },
        { title: "City", input: city, setInput: setCity },
        { title: "State", input: state, setInput: setState },
        { title: "Postal Code", input: postalCode, setInput: setPostalCode }
    ];

    const links = [
        { title: "Application Link", input: applicationLink, setInput: setApplicationLink },
        { title: "Form Submission Link", input: formSubmissionLink, setInput: setFormSubmissionLink }
    ];

    const sampleMessage = [
        { title: "Sample Message 1", input: sampleMessage1, setInput: setSampleMessage1 },
        { title: "Sample Message 2", input: sampleMessage2, setInput: setSampleMessage2 },
        { title: "Sample Message 3", input: sampleMessage3, setInput: setSampleMessage3 }
    ];

    const submitEvent = () => {
        if (companyName.length < 3) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please enter company name'

            });
            setComapanyWarning(true)
        } else if (ein.length != 9) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'EIN must be 9 characters'
            });
        } else if (!businessEmail.includes("@") && !businessEmail.includes(".com")) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please enter a valid email'
            });
        } else if (streetAddress.length < 5 && city.length < 2 && state.length < 2 && postalCode.length < 5) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please enter a valid business Address'
            });
            setBusinessWarning(true)
        } else {
            axios.post(`https://${process.env.EXPO_PUBLIC_LIVE}/tendlc`, {
                companyName: companyName,
                ein: ein,
                entityType: entityType,
                vertical: vertical,
                email: businessEmail,
                website: website,
                phone: businessNumber,
                street: streetAddress,
                city: city,
                state: state,
                postalCode: postalCode,
                application_link: applicationLink,
                optInLink: formSubmissionLink,
                sample1: sampleMessage1,
                sample2: sampleMessage2,
                sample3: sampleMessage3
            }, { headers: { 'Authorization': userData.access_token } }).then((response) => {
                console.log("Successfully Added Business")

            }).catch((err) => {
                console.log(err, " :ERROR REMOVING GROUP");

            })
        }


    }

    return (
        <TouchableWithoutFeedback style={{}} onPress={() => { Keyboard.dismiss() }}>
            <>



                <View style={{ padding: 12, marginTop: -12, paddingBottom: 8, justifyContent: "space-between", flexDirection: "row", backgroundColor: "white", alignItems: "center" }}>

                    <View style={{ flexDirection: "row", gap: 5, padding: 0, }}>
                        <Pressable style={{ position: "absolute", height: 70, width: 90, top: -15, left: -15 }} onPress={() => { navigation.goBack() }}></Pressable>

                        <FontAwesome5 name="chevron-left" size={22} color="black" />


                    </View>
                    <View style={{}}>
                        <Text style={{ fontSize: 18, fontWeight: "500" }}>10DLC</Text>
                    </View>
                    <View style={{ paddingTop: 0, paddingRight: 12, alignItems: "center" }}>

                    </View>
                    <View style={{ position: "absolute", top: 0, right: 10, flex: 1 }}>
                        <Image source={require('../../../../assets/images/purpleE.png')} resizeMode='contain'
                            style={{ alignSelf: "flex-start", height: deviceHeight * .05, width: deviceWidth * .08, }} />
                    </View>
                </View>
                <KeyboardAwareScrollView bounces={false} keyboardShouldPersistTaps={'always'} keyboardDismissMode="on-drag" style={{ backgroundColor: "white", height: "100%", }}
                    resetScrollToCoords={null}
                    enableOnAndroid={true}
                    extraScrollHeight={0}>


                    <View style={{ padding: 18, gap: 25 }}>
                        <View>
                            <View style={{ flexDirection: 'row', }}>
                                <Text style={{ fontWeight: "600", fontSize: 20, paddingBottom: 16 }}>Basic Information</Text>

                            </View>
                            <View style={{ flexDirection: 'row', gap: 12, paddingBottom: 10, flexWrap: "wrap" }}>

                                {
                                    basicInfo.slice(0, 6).map((item, index) => (
                                        <View style={{ width: "48%" }}>
                                            <Text style={{ color: colors.primaryText, fontSize: 14, fontWeight: "500" }}>{item.title}</Text>
                                            {
                                                item.title === "Entity Type" ?
                                                    <Dropdown
                                                        style={[styles.dropdown, isFocus2 && { borderColor: 'blue' }]}
                                                        data={entityTypes}
                                                        selectedTextStyle={{ fontSize: 14 }}
                                                        inputSearchStyle={{ fontSize: 12 }}
                                                        itemTextStyle={{ fontSize: 12 }}
                                                        maxHeight={300}

                                                        labelField="label"
                                                        valueField="value"
                                                        placeholder={!isFocus2 ? 'Select item' : '...'}
                                                        searchPlaceholder="Search..."
                                                        value={selectedEntity}
                                                        onFocus={() => setIsFocus2(true)}
                                                        onBlur={() => setIsFocus2(false)}
                                                        onChange={item => {
                                                            setSelectedEntity(item.value);
                                                            setIsFocus2(false);
                                                        }}

                                                    /> : item.title === "Verticals" ?
                                                        <Dropdown
                                                            style={[styles.dropdown, isFocus1 && { borderColor: 'blue' }]}
                                                            data={vertical}
                                                            selectedTextStyle={{ fontSize: 14 }}
                                                            inputSearchStyle={{ fontSize: 12 }}
                                                            itemTextStyle={{ fontSize: 12 }}
                                                            maxHeight={300}
                                                            dropdownPosition='bottom'
                                                            labelField="label"
                                                            valueField="value"
                                                            placeholder={!isFocus1 ? 'Select item' : '...'}
                                                            searchPlaceholder="Search..."
                                                            value={selectedVertical}
                                                            onFocus={() => setIsFocus1(true)}
                                                            onBlur={() => setIsFocus1(false)}
                                                            onChange={item => {
                                                                setSelectedVertical(item.value);
                                                                setIsFocus1(false);
                                                            }}

                                                        /> :
                                                        <TextInput
                                                            style={{ backgroundColor: colors.lightGrayPurple, color: "black", borderRadius: 12, fontSize: 16, padding: 12, borderColor: "#7972BC", borderWidth: 1, marginTop: 10 }}
                                                            placeholderTextColor={"gray"}
                                                            placeholder={`Enter your ${item.title}`}
                                                            maxLength={item.title == "EIN" ? 9 : 128}
                                                            onChangeText={(value) => item.setInput(value)}
                                                            value={item.input} />
                                            }

                                        </View>

                                    ))
                                }
                                {
                                    basicInfo.slice(6, 7).map((item, index) => (
                                        <View style={{ width: "100%" }}>
                                            <Text style={{ color: colors.primaryText, fontSize: 14, fontWeight: "500" }}>{item.title}</Text>
                                            <TextInput
                                                style={{ backgroundColor: colors.lightGrayPurple, color: "black", borderRadius: 12, fontSize: 16, padding: 12, borderColor: "#7972BC", borderWidth: 1, marginTop: 10 }}
                                                placeholderTextColor={"gray"}
                                                placeholder={`Enter your ${item.title}`}
                                                maxLength={128}
                                                onChangeText={(value) => item.setInput(value)}
                                                value={item.input} />
                                        </View>

                                    ))
                                }
                            </View>
                        </View>
                        <View>
                            <View style={{ flexDirection: 'row', alignItems: "center", gap: 5, paddingBottom: 16 }}>
                                <Text style={{ fontWeight: "600", fontSize: 20,  }}>Business Address</Text>
                                {
                                    businessWarning &&
                                    <View style={{ height: 10, width: 10, borderRadius: 10, backgroundColor: colors.pink }}></View>
                                }

                            </View>
                            {
                                businessAddress.slice(0, 1).map((item, index) => (
                                    <View >
                                        <Text style={{ color: colors.primaryText, fontSize: 14, fontWeight: "500" }}>{item.title}</Text>

                                        <TextInput
                                            style={{ backgroundColor: colors.lightGrayPurple, color: "black", borderRadius: 12, fontSize: 16, padding: 12, borderColor: "#7972BC", borderWidth: 1, marginTop: 10 }}
                                            placeholderTextColor={"gray"}
                                            placeholder={`Enter your ${item.title}`}
                                            maxLength={128}
                                            onChangeText={(value) => {item.setInput(value); setBusinessWarning(false)}}
                                            value={item.input} />


                                    </View>

                                ))
                            }
                            <View style={{ flexDirection: 'row', gap: 12, paddingBottom: 10, paddingTop: 10, flexWrap: "wrap" }}>


                                {
                                    businessAddress.slice(1, 4).map((item, index) => (
                                        <View style={{ width: "48%" }}>
                                            <Text style={{ color: colors.primaryText, fontSize: 14, fontWeight: "500" }}>{item.title}</Text>
                                            {
                                                item.title == "State" ?
                                                    <Dropdown
                                                        style={[styles.dropdown, isFocus1 && { borderColor: 'blue' }]}
                                                        data={allStates}
                                                        selectedTextStyle={{ fontSize: 14 }}
                                                        inputSearchStyle={{ fontSize: 12 }}
                                                        itemTextStyle={{ fontSize: 12 }}
                                                        maxHeight={300}
                                                        dropdownPosition='bottom'
                                                        labelField="name"
                                                        valueField="name"
                                                        placeholder={!isFocus1 ? 'Select item' : '...'}
                                                        searchPlaceholder="Search..."
                                                        value={selectedState}
                                                        onFocus={() => setIsFocus1(true)}
                                                        onBlur={() => setIsFocus1(false)}
                                                        onChange={item => {
                                                            setSelectedState(item?.name);
                                                            setIsFocus1(false);
                                                        }}

                                                    /> :
                                                    <TextInput
                                                        style={{ backgroundColor: colors.lightGrayPurple, color: "black", borderRadius: 12, fontSize: 16, padding: 12, borderColor: "#7972BC", borderWidth: 1, marginTop: 10 }}
                                                        placeholderTextColor={"gray"}
                                                        placeholder={`Enter your ${item.title}`}
                                                        maxLength={128}
                                                        onChangeText={(value) => item.setInput(value)}
                                                        value={item.input} />
                                            }
                                        </View>

                                    ))
                                }
                            </View>
                        </View>
                        <View>
                            <View style={{ flexDirection: 'row', }}>
                                <Text style={{ fontWeight: "600", fontSize: 20, paddingBottom: 16 }}>Links</Text>

                            </View>
                            <View style={{ flexDirection: 'row', gap: 12, flexWrap: "wrap" }}>

                                {
                                    links.map((item, index) => (
                                        <View style={{ width: "48%" }}>
                                            <Text style={{ color: colors.primaryText, fontSize: 14, fontWeight: "500" }}>{item.title}</Text>
                                            <TextInput
                                                style={{ backgroundColor: colors.lightGrayPurple, color: "black", borderRadius: 12, fontSize: 16, padding: 12, borderColor: "#7972BC", borderWidth: 1, marginTop: 10 }}
                                                placeholderTextColor={"gray"}
                                                placeholder={`Enter your ${item.title}`}
                                                maxLength={128}
                                                onChangeText={(value) => item.setInput(value)}
                                                value={item.input} />
                                        </View>

                                    ))
                                }
                            </View>

                        </View>
                        <View>
                            <View style={{ flexDirection: 'row', }}>
                                <Text style={{ fontWeight: "600", fontSize: 20, paddingBottom: 16 }}>Sample Messages</Text>

                            </View>
                            <View style={{ flexDirection: 'row', gap: 12, paddingBottom: 10, flexWrap: "wrap" }}>

                                {
                                    sampleMessage.slice(0, 2).map((item, index) => (
                                        <View style={{ width: "48%" }}>
                                            <Text style={{ color: colors.primaryText, fontSize: 14, fontWeight: "500" }}>{item.title}</Text>
                                            <TextInput
                                                style={{ backgroundColor: colors.lightGrayPurple, color: "black", borderRadius: 12, fontSize: 16, padding: 12, borderColor: "#7972BC", borderWidth: 1, marginTop: 10 }}
                                                placeholderTextColor={"gray"}
                                                placeholder={`Enter your ${item.title}`}
                                                maxLength={128}
                                                onChangeText={(value) => item.setInput(value)}
                                                value={item.input} />
                                        </View>

                                    ))
                                }
                                {
                                    sampleMessage.slice(2, 3).map((item, index) => (
                                        <View style={{ width: "100%" }}>
                                            <Text style={{ color: colors.primaryText, fontSize: 14, fontWeight: "500" }}>{item.title}</Text>
                                            <TextInput
                                                style={{ backgroundColor: colors.lightGrayPurple, color: "black", borderRadius: 12, fontSize: 16, padding: 12, borderColor: "#7972BC", borderWidth: 1, marginTop: 10 }}
                                                placeholderTextColor={"gray"}
                                                placeholder={`Enter your ${item.title}`}
                                                maxLength={128}
                                                onChangeText={(value) => item.setInput(value)}
                                                value={item.input} />
                                        </View>

                                    ))
                                }
                            </View>
                        </View>
                    </View>

                    <Pressable style={[styles.logOut, { backgroundColor: "#0162E8", marginTop: 10, marginBottom: 30 }]} onPress={() => { submitEvent() }}>
                        <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>Submit</Text>
                    </Pressable>

                </KeyboardAwareScrollView>

            </>

        </TouchableWithoutFeedback>
    )
}