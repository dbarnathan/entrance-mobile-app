import React, { useEffect, useState, useContext, useLayoutEffect, useCallback, useRef } from 'react'
import { Text, View, ScrollView, StyleSheet, Pressable, useWindowDimensions, Image, FlatList, RefreshControl, Button, ActivityIndicator, Alert, TouchableOpacity, Platform, SafeAreaView, Switch, KeyboardAvoidingView } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { TextInput } from 'react-native';
import { doc, onSnapshot, setDoc, query, collection, getDocs, where, getDoc, orderBy } from 'firebase/firestore';
import { colors, fontSize } from '../../theme'
import { UserDataContext } from '../../context/UserDataContext'
import { FlagContext } from '../../context/FlagContext'
import { ColorSchemeContext } from '../../context/ColorSchemeContext'
import axios from 'axios'
import styles from './styles'
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5, FontAwesome6, Ionicons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { PieChart } from 'react-native-gifted-charts';
import Feather from '@expo/vector-icons/Feather';
import { Dropdown } from 'react-native-element-dropdown';
import EditTemplateModal from '../../components/EditTemplateModal';
import * as ImageManipulator from 'expo-image-manipulator';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as DocumentPicker from "expo-document-picker";
import Papa from "papaparse";
import * as FileSystem from "expo-file-system";
import * as XLSX from 'xlsx';
import AntDesign from '@expo/vector-icons/AntDesign';
import SelectContactList from '../../components/SelectContactList';
import Entypo from '@expo/vector-icons/Entypo';
import { useFocusEffect } from '@react-navigation/native';
import ShowAllContactsModal from '../../components/ShowAllContactsModal';

export default function ViewCampaign() {
    const navigation = useNavigation()
    const deviceHeight = useWindowDimensions().height;
    const deviceWidth = useWindowDimensions().width;
    const route = useRoute()


    const { userData, workspaceUsers, userSettings, setUserSettings, userGroups, setUserGroups } = useContext(UserDataContext)
    const [isEnabled, setIsEnabled] = useState(userSettings.add_email_meta)
    const [phoneNumber, setPhoneNumber] = useState("")
    const [message, setMessage] = useState("")
    const [campaign, setCampaign] = useState({})
    const [image, setImage] = useState("")
    const [isFocus, setIsFocus] = useState(false);
    const [isFocus2, setIsFocus2] = useState(false)
    const [selectTemplate, setSelectTemplate] = useState("1")

    const [selectGroup, setSelectGroup] = useState("")

    const [forwardNumber, setForwardNumber] = useState("")


    const [templates, setTemplates] = useState([])

    const [isStop, setIsStop] = useState(false)
    const [isYes, setIsYes] = useState(false)

    const [isFilterMaster, setIsFilterMaster] = useState(false)
    const [isFIlterChannels, setIsFilterChannels] = useState(false)
    const [isDisabled, setIsDisabled] = useState(false)
    const [isTime, setIsTime] = useState(false)

    const [fileUri, setFileUri] = useState(null);
    const [csvData, setCsvData] = useState([]);
    const [filePicked, setFilePicked] = useState(false);

    const [currentGroups, setCurrentGroups] = useState([])

    const [userPermissions, setUserPermissions] = useState([])
    const [removedUsers, setRemovedUsers] = useState([])
    const [refreshing, setRefreshing] = useState(false)

    const [contactLists, setContactLists] = useState([])

    const [visibleContact, setVisibleContact] = useState(false)

    const [isLoading, setIsLoading] = useState(false)

    const [contactLoading, setContactLoading] = useState(false)

    const [showAllContacts, setShowAllContacts] = useState(false)

    const [pieData, setPieData] = useState([
        {
            value: 47,
            color: '#009FFF',
            gradientCenterColor: '#006DFF',
            focused: true,
        },
        { value: 40, color: '#93FCF8', gradientCenterColor: '#3BE9DE' },
        { value: 16, color: '#BDB2FA', gradientCenterColor: '#8F80F3' },
        { value: 3, color: '#FFA5BA', gradientCenterColor: '#FF7F97' },
    ]);

    const [showTemplate, setShowTemplate] = useState(false)

    const data = [
        { label: 'Select Template', value: '1' },
        { label: 'Item 2', value: '2' },
    ];

    const [loadingForward, setLoadingForward] = useState(false)

    const hookMessage = 'You can integrate this hook into your internal systems easily using the following instructions. \nIf you have any questions feel free to reach out to our support team.'
    const [smsJSON, setSMS] = useState('{\n"number": "15555555555" \n${var that is in message}: "testVar"\n}')



    const { campaign_id } = route.params


    useEffect(() => {
        navigation.getParent()?.setOptions({
            tabBarStyle: {
                display: "none"
            }
        });
        return () => navigation.getParent()?.setOptions({
            tabBarStyle: {
                display: "inline"
            }
        });
    }, [])

    useEffect(() => {
        console.log("CAMPAIGN: ", campaign)
    }, [])

    const handleRefresh = () => {
        console.log("handling Refresh; Is LOADING...", isLoading)
        setRefreshing(true);
        loadCampaign()

        // Simulate a network request
        setTimeout(() => {
            setRefreshing(false);
            console.log("Refresh False")
        }, 2000);
    }

    const loadCampaign = async () => {
        // setIsLoading(true)
        console.log("Loading Campaign")
        axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/campaigns/${campaign_id}`, {
            headers: {
                'Authorization': userData.access_token
            }
        }).then((response) => {
            console.log("Campaigns from view: ", response.data.record)

            setCampaign(response.data.record)

            let temp1 = []

            for (let key in response.data.record.added_user_groups) {
                if (response.data.record.added_user_groups.hasOwnProperty(key)) {
                    console.log("KEY: ", key);  // This will log "243"
                    userGroups.forEach((val) => {
                        if (val.id == key) {
                            temp1.push(val)
                        }
                    }) // This will log true
                }
            }

            console.log("Groups from View: ", temp1)

            setCurrentGroups(temp1)

            let temp = [
                {
                    value: response.data.record.response ? response.data.record.response : .01,
                    color: "#23C03D",
                    gradientCenterColor: '#0c8721',
                    focused: true,
                },
                { value: response.data.record.sent ? response.data.record.sent : 0.1, color: '#93FCF8', gradientCenterColor: '#3BE9DE' },
                { value: response.data.record.stop ? response.data.stop : 0.1, color: '#dfeff5', gradientCenterColor: '#9bb9c4' },


            ]

            setPieData(temp)
            axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/media?source=${response.data.record.media_url}`, {
                headers: {
                    'Authorization': userData.access_token
                }
            }).then((response) => {
                console.log("Converted Image: ", response.data)
                setImage(response.data.url)
            }).catch((err) => {
                console.log(err, " :ERROR GETTING IMAGE")
            })





            setMessage(response.data.record.text_message)
            setIsStop(response.data.record.add_stop_message)
            setForwardNumber(response.data.record.forward_number)

        }).catch((err) => {
            console.log(err.toJSON());
        })

        setContactLoading(true)

        axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/campaigns/${campaign_id}/contacts`,
            {
                headers: {
                    'Authorization': userData.access_token
                }
            }
        ).then((res) => {
            console.log("DATA FROM CONTACT: ", res.data.records)
            setContactLists(res.data.records)

            setTimeout(() => {
                setContactLoading(false)
            }, 1000)
        }).catch((err) => {
            console.log("Error getting contacts LISTS: ", err.toJSON());
        })

        // setContactLoading(false)

        axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/campaigns/${campaign_id}/permissions`, { headers: { 'Authorization': userData.access_token } }).then(async (response) => {
            console.log("Users who have permissions: ", response.data.records)


            const temp = await Promise.all(
                response.data.records.map((ele) =>
                    axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/users/${ele.user_id}`, {
                        headers: { 'Authorization': userData.access_token }
                    }).then((response) => response.data.record)
                )
            );


            let temp2 = []
            let tempWorkspace = workspaceUsers


            console.log("User Permissions: ", temp, " Workspace Users: ", tempWorkspace);

            workspaceUsers.forEach((user, index) => {

                temp.forEach((val) => {
                    console.log(" \n Workspace Val: ", user, " \n ", val)
                    if (user.id == val.id) {
                        tempWorkspace = tempWorkspace.filter(item => item.id !== val.id);
                    }
                })
            })

            setRemovedUsers(tempWorkspace)
            setUserPermissions(temp);

        }).catch((err) => {
            console.log(err, " :ERROR GETTING TEMPLATES");

        })
    }

    useFocusEffect(
        useCallback(() => {
            axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/campaigns/${campaign_id}/contacts`,
                {
                    headers: {
                        'Authorization': userData.access_token
                    }
                }
            ).then((res) => {
                console.log("DATA FROM CONTACT: ", res.data.records)
                setContactLists(res.data.records)

                setTimeout(() => {
                    setIsLoading(false)
                }, 1000)
            }).catch((err) => {
                console.log("Error getting contacts LISTS: ", err.toJSON());
            })
        }, [])

    )

    useEffect(() => {
        setIsLoading(true)
        loadCampaign()
        setTimeout(() => {
            setIsLoading(false)


        }, 1000)
    }, [])

    useEffect(() => {
        console.log("CURRENT CONTACT LIST: ", contactLists)

    }, [contactLists, setContactLists])

    const handleMessage = (val) => {
        setTimeout(() => {
            axios.patch(`https://${process.env.EXPO_PUBLIC_LIVE}/campaigns/${campaign_id}`, { text_message: message }, { headers: { 'Authorization': userData.access_token } }).then((response) => {

                Toast.show({
                    type: 'success',
                    text1: 'Updated',
                    text2: 'Successfully updated text message template. 👋'
                });
            }).catch((err) => {
                console.log(err, " :ERROR ADDING NEW TEXT");

            })
        }, 2000)

        setMessage(val)
    }

    const handleSMS = (val) => {
        setSMS(val)
    }

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: false,
            aspect: [4, 3],
            quality: 1,

        });

        console.log(result);

         // Extract the image file
         const { uri, type, fileName } = result.assets[0];
         const fileType = type || 'image/jpeg'; // Fallback to default type if not provided
         const fileNameFallback = fileName || uri.split('/').pop(); // Use file name from URI if not provided
 
         // Create FormData and append the image
         const formData = new FormData();
         formData.append('media', {
             uri,
             name: fileNameFallback,
             type: fileType,
         });

        if (!result.canceled) {
      
            console.log("Attached Media: ", formData.uri)
            axios.post(`https://${process.env.EXPO_PUBLIC_LIVE}/campaigns/${campaign_id}/attach-media`, formData, { headers: { 'Authorization': userData.access_token } }).then((response) => {

                console.log("Successfully attached media")
                setImage(result.assets[0].uri);
                Toast.show({
                    type: 'success',
                    text1: 'Updated',
                    text2: 'Updated image Successfully. 👋'
                });
            }).catch((err) => {
                console.log(err.response.data, " :ERROR ATTACHING NEW MEDIA");

            })

        }
    };

    const handleSendTest = async () => {
        axios.post(`https://${process.env.EXPO_PUBLIC_LIVE}/campaigns/${campaign_id}/test`, { number: phoneNumber, }, { headers: { 'Authorization': userData.access_token } }).then((response) => {
            console.log("Successfully sent test message")
            Toast.show({
                type: 'success',
                text1: 'Updated',
                text2: 'Successfully sent test message. 👋'
            });
        }).catch((err) => {
            console.log(err.response.data, " :ERROR SENDING TEST MESSAGE");

        })
    }

    const handleSendMessage = () => {
        axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/campaigns/${campaign_id}/send`, { headers: { 'Authorization': userData.access_token } }).then((response) => {

            console.log("Successfully sent test message")

            Toast.show({
                type: 'success',
                text1: 'Updated',
                text2: 'Message Sent Successfully. 👋'

            });
            navigation.goBack()

        }).catch((err) => {
            console.log(err, " :ERROR SENDING TEST MESSAGE");

        })
    }

    const handlePopGroup = async (idx) => {
        currentGroups.splice(idx, 1);
        axios.delete(`https://${process.env.EXPO_PUBLIC_LIVE}/user-groups/${campaign_id}/remove-user-group`, { params: { group_id: currentGroups[currentGroups.length - 1]?.id } }, { headers: { 'Authorization': userData.access_token } }).then((response) => {
            console.log("Successfully removed group")
            Toast.show({
                type: 'success',
                text1: 'Updated',
                text2: 'Successfully removed group. 👋'
            });
        }).catch((err) => {
            console.log(err, " :ERROR REMOVING GROUP");

        })
    }

    const handleForwardNumber = () => {
        setLoadingForward(true);
        axios.patch(`https://${process.env.EXPO_PUBLIC_LIVE}/campaigns/${campaign_id}`, { forward_number: forwardNumber }, { headers: { 'Authorization': userData.access_token } }).then((response) => {
            console.log("Successfully updated forward number")
            Toast.show({
                type: 'success',
                text1: 'Updated',
                text2: 'Successfully updated forward number. 👋'
            });
            setLoadingForward(false);
        }).catch((err) => {
            console.log(err, " :ERROR UPDATING FORWARD")
        })
    }



    const toggleStopSwitch = async () => {
        axios.patch(`https://${process.env.EXPO_PUBLIC_LIVE}/campaigns/${campaign_id}`, { add_stop_message: !isStop }, { headers: { 'Authorization': userData.access_token } }).then((response) => {


        }).catch((err) => {
            console.log(err, " :ERROR ADDING NEW TEXT");

        })
        setIsStop(!isStop)
    }

    const toggleYesSwitch = async () => {
        axios.patch(`https://${process.env.EXPO_PUBLIC_LIVE}/campaigns/${campaign_id}`, { auto_response_on_yes: !isYes }, { headers: { 'Authorization': userData.access_token } }).then((response) => {
            console.log("Succsessfully Updated")

        }).catch((err) => {
            console.log(err, " :ERROR ADDING NEW TEXT");

        })
        setIsYes(!isYes)
    }

    const updateCampaign = ({ property, setHook, hook }) => {
        axios.patch(`https://${process.env.EXPO_PUBLIC_LIVE}/campaigns/${campaign_id}`, property, { headers: { 'Authorization': userData.access_token } }).then((response) => {
            console.log("Successfully updated")

        }).catch((err) => {
            console.log(err, " :ERROR UPDATING CAMPAIGN");

        })

        setHook(!hook)
    }

    const handleRemoveUsers = (index) => {
        axios.delete(`https://${process.env.EXPO_PUBLIC_LIVE}/campaigns/${campaign_id}/permissions/users?user_id=${userPermissions[index].id}`, { headers: { 'Authorization': userData.access_token } }).then((response) => {
            console.log("Successfully removed group")

        }).catch((err) => {
            console.log(err, " :ERROR REMOVING GROUP");

        })
        setRemovedUsers([...removedUsers, userPermissions[index]])
        setUserPermissions(userPermissions.filter((_, i) => i !== index))
    }

    const handleAddUser = (index) => {
        axios.post(`https://${process.env.EXPO_PUBLIC_LIVE}/campaigns/${campaign_id}/permissions/users`, { user_id: removedUsers[index].id }, { headers: { 'Authorization': userData.access_token } }).then((response) => {
            console.log("Successfully removed group")

        }).catch((err) => {
            console.log(err, " :ERROR REMOVING GROUP");

        })
        setUserPermissions([...userPermissions, removedUsers[index]])
        setRemovedUsers(removedUsers.filter((_, i) => i !== index))
    }

    const handleImportContact = (parsed) => {
        console.log("Parsed csv JSON: ", parsed)
        setIsLoading(true)
        setContactLoading(true)
        axios.post(`https://${process.env.EXPO_PUBLIC_LIVE}/campaigns/${campaign_id}/contacts`, { contacts: parsed }, { headers: { 'Authorization': userData.access_token } }).then((response) => {
            console.log("Successfully Uploaded contact: ", response)

            Toast.show({
                type: 'success',
                text1: 'Updated',
                text2: 'Successfully uploaded contacts. 👋'
            });


            loadCampaign()
            setTimeout(() => {
                setIsLoading(false)
            }, 1000)
            axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/campaigns/${campaign_id}/contacts`,
                {
                    headers: {
                        'Authorization': userData.access_token
                    }
                }
            ).then((res) => {
                console.log("DATA FROM CONTACT: ", res.data.records)
                setContactLists(res.data.records)

                setTimeout(() => {
                    setContactLoading(false)
                }, 1000)
            }).catch((err) => {
                console.log("Error getting contacts LISTS: ", err.toJSON());
            })


        }).catch((err) => {
            console.log(err, " :ERROR REMOVING GROUP");

        })

    }

    const handleRemoveContacts = () => {
        console.log("Campaign ID: ", campaign_id, "AUTH TOKEN: ", userData.access_token)
        axios.post(`https://${process.env.EXPO_PUBLIC_LIVE}/campaigns/${campaign_id}/contacts/delete`, { headers: { 'Authorization': userData.access_token } }).then((response) => {
            console.log("Successfully Uploaded contact: ", response)

            Toast.show({
                type: 'success',
                text1: 'Updated',
                text2: 'Successfully Removed contacts. 🗑️'
            });


            loadCampaign()
            axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/campaigns/${campaign_id}/contacts`,
                {
                    headers: {
                        'Authorization': userData.access_token
                    }
                }
            ).then((res) => {
                console.log("DATA FROM CONTACT: ", res.data.records)
                setContactLists(res.data.records)

                setTimeout(() => {
                    setIsLoading(false)
                }, 1000)
            }).catch((err) => {
                console.log("Error getting contacts LISTS: ", err.toJSON());
            })


        }).catch((err) => {
            console.log(err.response.data, " :ERROR REMOVING CONTACTS");

        })
    }

    const handleParse = (excelList) => {
        const oldKeys = {
            First: ['First', 'FirstName', 'Name', 'full_name'],
            Last: ['Last', 'LastName', 'Surname', 'full_name'],
            Num: ['phone_number', 'Phone', 'number2', 'number']
        };

        let temp = []
        temp = excelList.map(row => {
            const resolveKey = (row, possibleKeys) => {
                // Find the first key in possibleKeys that exists in the row
                for (let key of possibleKeys) {
                    if (key in row) {
                        return row[key];
                    }
                }
                return undefined; // Return undefined if no match found
            };

            const first_name = resolveKey(row, oldKeys.First);
            const last_name = resolveKey(row, oldKeys.Last);
            let number = resolveKey(row, oldKeys.Num)

            number = number.toString()

            const { First, Last, Num, ...rest } = row; // Ignore old keys from further processing

            return { first_name, last_name, number, ...rest };
        });

        temp = temp.map(item => {
            return { ...item, number: String(item.number) }
        })

        return temp
    }

    const pickDocument = async () => {
        console.log("Pick document function called");

        try {
            const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });
            if (result.canceled === false) {
                console.log("Result Assets: ", result.assets)
                const fileUri = result.assets[0].uri;
                const fileType = result.assets[0].name.split('.').pop();

                if (fileType == "xlsx") {
                    const fileData = await FileSystem.readAsStringAsync(fileUri, {
                        encoding: FileSystem.EncodingType.Base64, // Read file as Base64 to handle XLSX
                    });

                    const binaryData = atob(fileData); // Decode base64 to binary string
                    const workbook = XLSX.read(binaryData, { type: 'binary' });
                    const sheetName = workbook.SheetNames[0]; // Get the first sheet
                    const worksheet = workbook.Sheets[sheetName];
                    const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 0 }); // Convert sheet to JSON

                    console.log("Parsed XLSX Data:", excelData);
                    let temp = handleParse(excelData)


                    console.log("filtered Values: ", temp)

                    handleImportContact(temp);
                    setFilePicked(true);
                    loadCampaign()

                    setVisibleContact(false);



                } else {
                    setFileUri(result.assets[0].uri);
                    const fileData = await readFile(result.assets[0].uri);
                    if (fileData) {
                        const parsedData = Papa.parse(fileData, {
                            header: true, // This treats the first row as the header
                            skipEmptyLines: true, // Optional: skips empty lines in the CSV
                        });
                        if (parsedData.errors.length > 0) {
                            console.error("Error parsing CSV:", parsedData.errors);
                        } else {

                            console.log("Old PARSED: ", parsedData.data);
                            // for (let key in row) {
                            //     if (key == "First") {
                            //         console.log("INDEX: ", row.First)
                            //         newObj = {
                            //             first: row.First, last: row.Last,
                            //             company: row.company, number: row.number, message: row.message
                            //         }
                            //     } else if (key == "first name") {
                            //         newObj = {
                            //             first: row.first_name, last: row.last_name,
                            //             company: row.company, number: row.number, message: row.message
                            //         }
                            //     }

                            // }

                            let temp = handleParse(parsedData.data)


                            console.log("Parsed CSV Data:", temp);
                            setCsvData(temp);
                            handleImportContact(temp);
                            setFilePicked(true);
                            loadCampaign()
                            setVisibleContact(false);
                        }
                    } else {
                        console.error("Failed to read file data");
                    }
                }

            }
        } catch (error) {
            console.error("Error picking document:", error);
        }
    };

    const readFile = async (uri) => {
        console.log("Reading file");
        try {
            const response = await fetch(uri);
            const fileData = await response.text();
            // console.log("FILE DATA: ", fileData)
            return fileData;
        } catch (error) {
            return null;
        }
    };


    return (
        <>
            {
                isLoading && !refreshing ?
                    <View style={{ alignItems: "center", justifyContent: "center" }}>
                        <ActivityIndicator size={90} style={{ height: 100, width: 100 }} />
                    </View> :
                    <>
                        <EditTemplateModal isVisible={showTemplate} setIsVisible={setShowTemplate} item={templates} />
                        <SelectContactList isVisible={visibleContact} setIsVisible={setVisibleContact} item={campaign} pickFile={pickDocument} />
                        <ShowAllContactsModal isVisible={showAllContacts} setIsVisible={setShowAllContacts} item={contactLists} campaignName={campaign?.name}/>
                        <View style={{ padding: 12, marginTop: -15, paddingBottom: 0, justifyContent: "space-between", flexDirection: "row", backgroundColor: "white", alignItems: "center" }}>

                            <View style={{ flexDirection: "row", gap: 5, padding: 8, alignItems: "center" }}>
                                <Pressable style={{ position: "absolute", height: 70, width: 90, top: -15, left: -15 }} onPress={() => { navigation.goBack() }}></Pressable>

                                <FontAwesome5 name="chevron-left" size={22} color="black" />

                            </View>
                            <View style={{}}>
                                <Text style={{ fontSize: 18, fontWeight: "500" }}>{campaign?.name}</Text>
                            </View>
                            <View style={{ alignItems: "flex-start", }}>
                                <Image source={require('../../../assets/images/purpleE.png')} resizeMode='contain'
                                    style={{ alignSelf: "flex-start", height: deviceHeight * .05, width: deviceWidth * .08, }} />
                                {/* <Pressable style={{ position: "absolute", height: 70, width: 70, top: -40, right: -10 }} onPress={() => { navigation.navigate("ContactStack", { data: channelData }) }}></Pressable>
    <FontAwesome6 name="ellipsis-vertical" size={18} color="gray" /> */}
                            </View>
                        </View>
                        {
                            campaign?.status == "ready" &&
                            <View style={{ padding: 15, position: "absolute", bottom: 25, right: 25, zIndex: 3 }}>

                                <Pressable style={[styles.sendButton]} onPress={() => { handleSendMessage() }}>
                                    <FontAwesome name="send" size={24} color="white" />
                                    {/* <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>Send </Text> */}
                                </Pressable>
                            </View>
                        }

                        <KeyboardAwareScrollView keyboardShouldPersistTaps={'always'} keyboardDismissMode="on-drag" style={{ backgroundColor: "#FAF0DC", height: "100%", }}
                            resetScrollToCoords={null}
                            enableOnAndroid={true}
                            showsVerticalScrollIndicator={false}

                            extraScrollHeight={0}
                            refreshControl={<RefreshControl
                                refreshing={refreshing}
                                onRefresh={handleRefresh}
                                colors={['#ff6347']} // Android: Refresh indicator color
                                tintColor="#ff6347" // iOS: Refresh indicator color
                            />}
                        >
                            {
                                campaign.status == "sent" &&
                                <View style={{ margin: 5 }}>
                                    <View style={{
                                        flexDirection: "row", padding: 5,
                                        backgroundColor: "white", borderRadius: 12,
                                        shadowColor: "#000000",
                                        shadowOpacity: 0.3033,
                                        shadowRadius: 2.5,
                                        shadowOffset: {
                                            height: 3,
                                            width: 1
                                        },
                                        elevation: 5,
                                        gap: 3
                                    }}>
                                        <AntDesign name="staro" size={50} color={colors.green} />
                                        <View style={{ borderRightWidth: 2.5, borderRightColor: "black", borderRadius: 12, marginVertical: 5, opacity: 0.5 }}></View>
                                        <View style={{ gap: 5, padding: 8 }}>
                                            <Text style={{ fontWeight: "500", fontSize: 14 }}>Blast Message Sent!</Text>
                                            <Text style={{ color: colors.gray, fontSize: 12 }}>Your message has been sent to all contacts</Text>
                                        </View>
                                    </View>

                                </View>
                            }
                            {
                                campaign?.response == 0 ? "" :
                                    <View style={{ alignItems: "center", marginVertical: 10 }}>

                                        <PieChart
                                            data={pieData}
                                            donut
                                            showGradient
                                            sectionAutoFocus
                                            radius={90}
                                            innerRadius={60}
                                            innerCircleColor={'#232B5D'}
                                            centerLabelComponent={() => {
                                                return (
                                                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                                        <Text
                                                            style={{ fontSize: 22, color: 'white', fontWeight: 'bold' }}>
                                                            %{isNaN(((campaign?.delivered * 100) / campaign?.sent).toFixed(1)) ? '-' : ((campaign?.delivered * 100) / campaign?.sent).toFixed(1)}
                                                        </Text>
                                                        <Text style={{ fontSize: 14, color: 'white' }}>Delivered</Text>
                                                    </View>
                                                );
                                            }}
                                        />
                                    </View>
                            }


                            <View style={{
                                flexDirection: "row",
                                alignItems: "center", justifyContent: "center",
                                shadowColor: "#000000",
                                shadowOpacity: 0.3033,
                                shadowRadius: 2.5,
                                shadowOffset: {
                                    height: 3,
                                    width: 1
                                },
                                elevation: 5,
                            }}>
                                <Pressable style={{
                                    flexDirection: "column", padding: 10, marginVertical: 5,
                                    backgroundColor: campaign?.type == "HOOK" ? "#c9daf5" :
                                        campaign?.type == "SINGLE_BLAST" ? "#f5f4c9"
                                            : campaign?.type == "RETARGET" ? "#f5cdc9" : "#f5cdc9", borderRadius: 10
                                }}

                                >
                                    <View>
                                        <View style={{ flexDirection: "row", alignItems: "center", gap: 9, justifyContent: "center", padding: 10 }}>
                                            <View style={{ flexDirection: "column", alignItems: "center" }}>
                                                <Text style={{ fontSize: 26, fontWeight: "600" }}>{campaign?.sent}</Text>
                                                <Text style={{ fontWeight: '500' }}>Sent</Text>
                                            </View>
                                            <View style={{ flexDirection: "column", alignItems: "center" }}>
                                                <Text style={{ fontSize: 26, fontWeight: "600" }}>{campaign?.delivered}</Text>
                                                <Text style={{ fontWeight: '500' }}>Delivered</Text>
                                            </View>
                                            <View style={{ flexDirection: "column", alignItems: "center" }}>
                                                <Text style={{ fontSize: 26, fontWeight: "600" }}>{campaign?.response}</Text>
                                                <Text style={{ fontWeight: '500' }}>Responded</Text>
                                            </View>
                                            <View style={{ flexDirection: "column", alignItems: "center" }}>
                                                <Text style={{ fontSize: 26, fontWeight: "600" }}>{campaign?.stop}</Text>
                                                <Text style={{ fontWeight: '500' }}>Stop</Text>
                                            </View>
                                        </View>
                                        <View style={{ flexDirection: "row", alignItems: "center", gap: 9, justifyContent: "center", padding: 10 }}>
                                            <View style={{ flexDirection: "column", alignItems: "center" }}>
                                                <Text style={{ fontSize: 26, fontWeight: "600" }}>{campaign?.spam}</Text>
                                                <Text style={{ fontWeight: '500' }}>Spam</Text>
                                            </View>
                                            <View style={{ flexDirection: "column", alignItems: "center" }}>
                                                <Text style={{ fontSize: 26, fontWeight: "600" }}>{campaign?.total_segments}</Text>
                                                <Text style={{ fontWeight: '500' }}>Segments</Text>
                                            </View>
                                        </View>

                                    </View>
                                    <Text style={{ color: colors.gray, fontSize: 10, fontWeight: "500" }}>{new Date(campaign?.created_at).getMonth() + "/" + new Date(campaign?.created_at).getDate() + "/" + new Date(campaign?.created_at).getFullYear()}</Text>
                                    <Text style={{ fontWeight: "500" }} >{campaign?.type}</Text>
                                </Pressable>


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
                                    <View style={{ marginBottom: 25 }}>
                                        <Text style={{ fontWeight: "600", fontSize: 16, paddingBottom: 1 }}>{campaign.status == "sent" ? "Image" : "Include Image"}</Text>
                                        {campaign.status != "sent" && <Text style={{ color: colors.grayLight, fontSize: 14, }}>Select or Remove image from campaign</Text>}
                                    </View>
                                    {
                                        campaign?.media_url ? <View style={{ alignItems: "center" }}>
                                            <Image source={{ uri: image }} style={{ width: "53%", height: 190, borderRadius: 15, marginBottom: 12 }} />
                                        </View> :
                                            <View style={{ borderRadius: 15, borderWidth: 1, borderStyle: "dashed", borderColor: colors.grayLight, padding: 10, justifyContent: "center", alignItems: "center", marginBottom: 20, marginHorizontal: 100 }}>
                                                <Feather name="image" size={24} color={colors.grayLight} />
                                            </View>
                                    }
                                    {
                                        campaign.status != "sent" &&
                                        <Pressable style={[styles.updateButton, { backgroundColor: "#0162E8" }]} onPress={() => { pickImage() }}>
                                            <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>Choose File</Text>
                                        </Pressable>
                                    }

                                    {
                                        isEnabled && campaign.status != "sent" ?
                                            <>
                                                <Text style={{ color: colors.primaryText, fontSize: 14, paddingTop: 5 }}>Always Replace Email Meta</Text>
                                                <Text style={{ color: colors.grayLight, fontSize: 14 }}>Enable this to add email to contact's meta</Text>

                                            </> : ""
                                    }

                                </View>

                            </View>


                            {
                                campaign.status != "sent" &&
                                <>
                                    {
                                        campaign.type == "HOOK" ?
                                            <View style={{
                                                flexDirection: "row",
                                                alignItems: "flex-start",
                                                justifyContent: "flex-start",
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
                                                    <View style={{ marginBottom: 10 }}>
                                                        <Text style={{ fontWeight: "600", fontSize: 16, paddingBottom: 18 }}>Setting Up Your Hook Campaign</Text>
                                                        <Text style={{ color: colors.gray, fontSize: 14, paddingBottom: 10 }}>Thanks for setting up a Hook Campaign!</Text>
                                                        <Text style={{ color: colors.gray, fontSize: 14, paddingBottom: 10 }}>{hookMessage}</Text>
                                                        <Text style={{ color: colors.gray, fontSize: 14, paddingBottom: 10 }}>First you can send a POST Request to {'\n'}<Text style={{ color: colors.grayLight, fontSize: 13 }}>https://entrancegrp.com/api/hooks/campaigns/{campaign?.id}</Text></Text>
                                                        <Text style={{ color: colors.gray, fontSize: 14, paddingBottom: 10 }}>You need to set your Authorization type to API Key and use the following Key Value Pairs.</Text>

                                                    </View>
                                                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                                                        <View style={{ borderBottomColor: "#BFBFBF", borderBottomWidth: 1, width: "100%" }}></View>
                                                    </View>
                                                    <Text style={{ color: colors.gray, fontSize: 14, paddingBottom: 10, marginTop: 10 }}>When sending us customer information to send an SMS all that is needed is to send JSON in the below form</Text>

                                                    <TextInput
                                                        style={{ backgroundColor: colors.lightGray, color: "black", borderRadius: 12, fontSize: 16, padding: 12, borderColor: "#7972BC", borderWidth: 1, width: "100%" }}
                                                        placeholderTextColor={"gray"}
                                                        placeholder={"{message}"}
                                                        multiline={true}
                                                        numberOfLines={4}
                                                        onChangeText={(value) => { handleSMS(value) }}
                                                        value={smsJSON} />





                                                </View>
                                            </View> :
                                            <View style={{
                                                flexDirection: "row",
                                                alignItems: "flex-start",
                                                justifyContent: "flex-start",
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
                                                    <View style={{ marginBottom: 20 }}>
                                                        <Text style={{ fontWeight: "600", fontSize: 16 }}>Campaign Options & Upload Contacts</Text>
                                                        <Text style={{ color: colors.grayLight, fontSize: 14, }}>Use the options to choose additional settings for your campaign before you upload.</Text>
                                                    </View>
                                                    <View style={{ flexDirection: "column", gap: 10, paddingBottom: 15, justifyContent: "space-between" }}>

                                                        {/* <Pressable style={[styles.downloadButton, { backgroundColor: "#0162E8", }]} onPress={() => { setShowTemplate(true) }}>
                                        <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>Download</Text>
                                    </Pressable> */}
                                                        {
                                                            contactLists.length != 0 || !contactLoading ?
                                                                <>
                                                                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                                                        <View style={{ flexDirection: "row" }}>
                                                                            <Text>Added contacts: </Text>
                                                                            <Text style={{ fontWeight: "500" }}>{contactLists.length}</Text>
                                                                        </View>
                                                                        <Text style={{ color: colors.grayLight }}>Tap to View All</Text>
                                                                    </View>
                                                                    <Pressable onPress={()=> setShowAllContacts(true)}>
                                                                        {
                                                                            contactLists.slice(0, 3).map((contact) => (
                                                                                <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: 5, paddingVertical: 10,  borderBottomWidth: 1, borderBottomColor: colors.grayLight, flexWrap: "wrap" }}>
                                                                                    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 5, paddingTop: 5 }}>
                                                                                        <FontAwesome5 name="user-circle" size={20} color={colors.grayLight} />
                                                                                        <View style={{ flexDirection: "column", gap: 5, }}>
                                                                                            <Text style={{ fontWeight: "600", fontSize: 16 }}>{contact?.first_name ? contact?.first_name : contact?.first} {contact?.last_name ? contact?.last_name : contact?.last}</Text>
                                                                                            {/* <Text style={{ color: colors.grayLight, flex: 1 }}>{contact.message}</Text> */}
                                                                                        </View>
                                                                                    </View>

                                                                                </View>
                                                                            ))
                                                                        }

                                                                    </Pressable>
                                                                    <Pressable style={{ backgroundColor: colors.pink, padding: 5, borderRadius: 5, alignItems: "center", justifyContent: "center" }} onPress={() => { handleRemoveContacts() }}>
                                                                        <Text style={{ color: "white", fontSize: 12, fontWeight: "600", alignSelf: "center" }}>Remove</Text>
                                                                    </Pressable>
                                                                </> :
                                                                <View style={{ alignItems: "center", }}>
                                                                    <ActivityIndicator size="large" color="black" />
                                                                </View>
                                                        }

                                                        <Pressable style={{
                                                            borderRadius: 15, borderWidth: 1, borderStyle: "dashed", borderColor: colors.grayLight, padding: 10, justifyContent: "center",
                                                            alignItems: "center", marginBottom: 20, marginTop: 15, marginHorizontal: 80, gap: 12
                                                        }} onPress={() => setVisibleContact(true)}>
                                                            <Feather name="upload-cloud" size={44} color={colors.grayLight} />
                                                            <Text style={{ textAlign: "center", color: colors.grayLight }}>Upload campaign xlsx sheet</Text>
                                                        </Pressable>




                                                        <Text style={{ fontWeight: "600", fontSize: 16 }}>Options</Text>
                                                        <View>

                                                            <Text style={{ color: colors.gray, fontSize: 14, fontWeight: "500", margin: 7, marginHorizontal: 4 }}>Forward Number Override</Text>
                                                            <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>

                                                                <TextInput
                                                                    style={{ backgroundColor: colors.lightGrayPurple, color: "black", borderRadius: 12, fontSize: 16, padding: 12, borderColor: "#7972BC", borderWidth: 1, width: "65%" }}
                                                                    placeholderTextColor={"gray"}
                                                                    placeholder={"e.g. +1 555 555 5555"}
                                                                    maxLength={11}
                                                                    value={forwardNumber}
                                                                    onChangeText={(value) => { setForwardNumber(value) }}
                                                                    keyboardType={"phone-pad"} />
                                                                <Pressable style={[styles.updateButton, { backgroundColor: forwardNumber?.length >= 10 ? "#0162E8" : "#A4ACC0" }]} onPress={() => { handleForwardNumber() }}>
                                                                    {
                                                                        loadingForward ? <ActivityIndicator size="small" color="white" /> :
                                                                            <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>Save</Text>
                                                                    }
                                                                </Pressable>
                                                            </View>
                                                            <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginTop: 30 }}>
                                                                <View style={{ width: "70%" }}>
                                                                    <Text style={{ fontWeight: "600", fontSize: 16 }}>Filter Master</Text>
                                                                    <Text style={{ color: colors.grayLight }}>Filter out master list numbers</Text>
                                                                </View>
                                                                <Switch
                                                                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                                                                    thumbColor={isFilterMaster ? '#f5dd4b' : '#f4f3f4'}
                                                                    ios_backgroundColor="#3e3e3e"
                                                                    onValueChange={() => updateCampaign({ property: { filter_against_master: !isFilterMaster }, setHook: setIsFilterMaster, hook: isFilterMaster })}
                                                                    style={{
                                                                        transform: [{ scaleX: Platform.OS == "ios" ? .75 : 1.5 }, { scaleY: Platform.OS == "ios" ? .75 : 1.5 }] // Change the scale as needed
                                                                    }}
                                                                    value={isFilterMaster}
                                                                />

                                                            </View>
                                                            <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginTop: 20 }}>
                                                                <View style={{ width: "70%" }}>
                                                                    <Text style={{ fontWeight: "600", fontSize: 16 }}>Filter Channels</Text>
                                                                    <Text style={{ color: colors.grayLight }}>Filter out contacts that already have assigned channels.</Text>
                                                                </View>
                                                                <Switch
                                                                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                                                                    thumbColor={isFIlterChannels ? '#f5dd4b' : '#f4f3f4'}
                                                                    ios_backgroundColor="#3e3e3e"
                                                                    onValueChange={() => updateCampaign({ property: { filter_against_channels: !isFIlterChannels }, setHook: setIsFilterChannels, hook: isFIlterChannels })}
                                                                    style={{
                                                                        transform: [{ scaleX: Platform.OS == "ios" ? .75 : 1.5 }, { scaleY: Platform.OS == "ios" ? .75 : 1.5 }] // Change the scale as needed
                                                                    }}
                                                                    value={isFIlterChannels}
                                                                />

                                                            </View>
                                                            <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginTop: 20 }}>
                                                                <View style={{ width: "70%" }}>
                                                                    <Text style={{ fontWeight: "600", fontSize: 16 }}>Disable Campaign Claims</Text>
                                                                    <Text style={{ color: colors.grayLight }}>Campaign level disable claims for round-robin assignment of claims.</Text>
                                                                </View>
                                                                <Switch
                                                                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                                                                    thumbColor={isDisabled ? '#f5dd4b' : '#f4f3f4'}
                                                                    ios_backgroundColor="#3e3e3e"
                                                                    onValueChange={() => updateCampaign({ property: { disable_claims: !isDisabled }, setHook: setIsDisabled, hook: isDisabled })}
                                                                    style={{
                                                                        transform: [{ scaleX: Platform.OS == "ios" ? .75 : 1.5 }, { scaleY: Platform.OS == "ios" ? .75 : 1.5 }] // Change the scale as needed
                                                                    }}
                                                                    value={isDisabled}
                                                                />

                                                            </View>
                                                            <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginTop: 20 }}>
                                                                <View style={{ width: "70%" }}>
                                                                    <Text style={{ fontWeight: "600", fontSize: 16 }}>Time Zone Scheduling</Text>
                                                                    <Text style={{ color: colors.grayLight }}>This setting allows you to schedule SMS campaigns to be sent at optimal times across different time zones, from East to West.</Text>
                                                                </View>
                                                                <Switch
                                                                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                                                                    thumbColor={isTime ? '#f5dd4b' : '#f4f3f4'}
                                                                    ios_backgroundColor="#3e3e3e"
                                                                    onValueChange={() => updateCampaign({ property: { is_adjusted_time_zone: !isTime }, setHook: setIsTime, hook: isTime })}
                                                                    style={{
                                                                        transform: [{ scaleX: Platform.OS == "ios" ? .75 : 1.5 }, { scaleY: Platform.OS == "ios" ? .75 : 1.5 }] // Change the scale as needed
                                                                    }}
                                                                    value={isTime}
                                                                />

                                                            </View>
                                                        </View>

                                                    </View>


                                                </View>
                                            </View>
                                    }
                                </>
                            }


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
                                    {
                                        campaign?.status == "sent" ?
                                            <View style={{ marginBottom: 25 }}>
                                                <Text style={{ fontWeight: "600", fontSize: 16 }}>Sent Blast Message</Text>
                                            </View> :
                                            <View style={{ marginBottom: 25 }}>
                                                <Text style={{ fontWeight: "600", fontSize: 16 }}>Edit Your Text Message</Text>
                                                <Text style={{ color: colors.grayLight, fontSize: 14, }}>Make sure to interpolate your variables like (name). The name should match your xlsx column headers.</Text>
                                            </View>
                                    }


                                    {
                                        campaign?.status != "sent" &&
                                        <View style={{ flexDirection: "row", gap: 10, paddingBottom: 15, justifyContent: "space-between" }}>
                                            <Dropdown
                                                style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
                                                data={data}
                                                selectedTextStyle={{ fontSize: 12 }}
                                                inputSearchStyle={{ fontSize: 12 }}
                                                itemTextStyle={{ fontSize: 12 }}
                                                maxHeight={300}
                                                labelField="label"
                                                valueField="value"
                                                placeholder={!isFocus ? 'Select item' : '...'}

                                                searchPlaceholder="Search..."
                                                value={selectTemplate}
                                                onFocus={() => setIsFocus(true)}
                                                onBlur={() => setIsFocus(false)}
                                                onChange={item => {
                                                    setSelectTemplate(item.value);
                                                    setIsFocus(false);
                                                }}

                                            />

                                            <Pressable style={[styles.updateButton, { backgroundColor: "#0162E8", margin: 7, marginHorizontal: 4 }]} onPress={() => { setShowTemplate(true) }}>
                                                <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>Edit Templates</Text>
                                            </Pressable>


                                        </View>
                                    }

                                    {

                                        campaign.status == "sent" ?
                                            <View style={{ backgroundColor: colors.lightGrayPurple, borderRadius: 12, padding: 12, borderColor: "#7972BC", borderWidth: 1, width: "100%" }}>
                                                <Text style={{ color: "gray", fontSize: 16, }}>{message}</Text>
                                            </View> :
                                            <TextInput
                                                style={{ backgroundColor: colors.lightGrayPurple, color: "black", borderRadius: 12, fontSize: 16, padding: 12, borderColor: "#7972BC", borderWidth: 1, width: "100%" }}
                                                placeholderTextColor={"gray"}
                                                placeholder={"{message}"}
                                                multiline={true}

                                                numberOfLines={4}
                                                onChangeText={(value) => { handleMessage(value) }}
                                                value={message} />

                                    }


                                    {
                                        campaign?.status != "sent" &&
                                        <>
                                            <View style={{ justifyContent: "center", flexDirection: "row", marginTop: 15, alignItems: "center" }}>
                                                <Text style={{ fontWeight: "500", flex: 1, marginVertical: 10 }}>Add 'Reply STOP to Opt-Out' to your message.</Text>
                                                <Switch
                                                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                                                    thumbColor={isStop ? '#f5dd4b' : '#f4f3f4'}
                                                    ios_backgroundColor="#3e3e3e"
                                                    onValueChange={toggleStopSwitch}
                                                    style={{
                                                        transform: [{ scaleX: Platform.OS == "ios" ? .75 : 1.5 }, { scaleY: Platform.OS == "ios" ? .75 : 1.5 }] // Change the scale as needed
                                                    }}
                                                    value={isStop}
                                                />
                                            </View>
                                            <View style={{ flexDirection: "column", marginTop: 15, alignItems: "flex-start", justifyContent: "flex-start" }}>
                                                <Text style={{ fontWeight: "600", fontSize: 16 }}>Test Your Message</Text>
                                                <View style={{ flexDirection: "row", alignItems: "center", gap: 12, justifyContent: "center" }}>
                                                    <TextInput
                                                        style={{ backgroundColor: colors.lightGrayPurple, color: "black", borderRadius: 12, fontSize: 16, padding: 12, borderColor: "#7972BC", borderWidth: 1, width: "65%", marginTop: 10 }}
                                                        placeholderTextColor={"gray"}
                                                        placeholder={"e.g. +1 555 555 5555"}
                                                        maxLength={11}
                                                        keyboardType={"phone-pad"}
                                                        onChangeText={(value) => setPhoneNumber(value)}
                                                        value={phoneNumber}


                                                    />

                                                    <Pressable style={[styles.updateButton, { backgroundColor: phoneNumber?.length >= 10 ? "#0162E8" : "#A4ACC0" }]} onPress={() => { console.log("Hello"); handleSendTest() }}>
                                                        <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>Send</Text>
                                                    </Pressable>
                                                </View>
                                            </View>
                                        </>
                                    }

                                </View>

                            </View>

                            {
                                campaign.status != "sent" &&
                                <View style={{
                                    flexDirection: "row",
                                    alignItems: "flex-start",
                                    justifyContent: "flex-start",
                                    shadowColor: "#000000",
                                    shadowOpacity: 0.3033,
                                    shadowRadius: 2.5,
                                    shadowOffset: {
                                        height: 3,
                                        width: 1
                                    },
                                    elevation: 5,
                                }}>
                                    <View style={{
                                        justifyContent: "center", flexDirection: "row", marginTop: 15, alignItems: "center",
                                        borderRadius: 12, backgroundColor: "white", margin: 10, padding: 12, flex: 1
                                    }}>
                                        <Text style={{ fontWeight: "500", flex: 1, marginVertical: 10, fontSize: 15 }}>Auto Response On Yes.</Text>
                                        <Switch
                                            trackColor={{ false: '#767577', true: '#81b0ff' }}
                                            thumbColor={isYes ? '#f5dd4b' : '#f4f3f4'}
                                            ios_backgroundColor="#3e3e3e"
                                            onValueChange={toggleYesSwitch}
                                            style={{
                                                transform: [{ scaleX: Platform.OS == "ios" ? .75 : 1.5 }, { scaleY: Platform.OS == "ios" ? .75 : 1.5 }] // Change the scale as needed
                                            }}
                                            value={isYes}
                                        />
                                    </View>
                                </View>
                            }



                            <View style={{
                                flexDirection: "row",
                                alignItems: "flex-start",
                                justifyContent: "flex-start",
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
                                    <View style={{ marginBottom: 20 }}>
                                        <Text style={{ fontWeight: "600", fontSize: 16 }}>Campaign Permissions</Text>
                                        <Text style={{ color: colors.grayLight, fontSize: 14, }}>Add and remove workspace users from claiming or being assigned new contacts from this campaign</Text>
                                    </View>
                                    <View style={{ flexDirection: "row", gap: 10, paddingBottom: 15, justifyContent: "space-between" }}>
                                        <View>

                                            <Text style={{ color: "black", fontSize: 16, fontWeight: "600", margin: 7, marginHorizontal: 4 }}>User Groups</Text>
                                            {
                                                currentGroups.map((item, index) => (
                                                    <Pressable style={{ backgroundColor: "#E8B212", borderRadius: 15, alignItems: "center" }} onPress={() => { handlePopGroup(index) }}>
                                                        <Text style={{ color: "black", fontSize: 13, fontWeight: "500", margin: 7, marginHorizontal: 4 }}>{item.name}</Text>
                                                    </Pressable>

                                                ))
                                            }
                                        </View>

                                        <Dropdown
                                            style={[styles.dropdown, isFocus2 && { borderColor: 'blue' }]}
                                            data={userGroups}
                                            selectedTextStyle={{ fontSize: 12 }}
                                            inputSearchStyle={{ fontSize: 12 }}
                                            itemTextStyle={{ fontSize: 12 }}
                                            containerStyle={{ padding: 0 }}
                                            maxHeight={300}
                                            labelField="name"
                                            valueField="id"
                                            placeholder={!isFocus2 ? 'Select item' : '...'}

                                            searchPlaceholder="Search..."
                                            value={selectGroup}
                                            onFocus={() => setIsFocus(true)}
                                            onBlur={() => setIsFocus(false)}
                                            onChange={item => {
                                                setSelectGroup(item?.id);
                                                setIsFocus(false);
                                            }}
                                            dropdownPosition="top"

                                        />




                                    </View>
                                    <View style={{ flexDirection: "column", gap: 10, paddingBottom: 15, display: "flex" }}>
                                        <Text style={{ color: "black", fontSize: 13, fontWeight: "500", margin: 7, marginHorizontal: 4, marginBottom: 3 }}>Added Users</Text>
                                        <View style={{ flexDirection: "row", gap: 8, flex: 1, flexWrap: "wrap" }}>
                                            {
                                                userPermissions.map((item, index) => (
                                                    <Pressable style={{ backgroundColor: "#23C03D", padding: 12, borderRadius: 12 }} onPress={() => handleRemoveUsers(index)}>
                                                        <Text style={{ color: "white", fontWeight: "500", fontSize: 13, }}>{item.firstname} {item.lastname}</Text>
                                                    </Pressable>
                                                ))
                                            }

                                        </View>

                                        <Text style={{ color: "black", fontSize: 13, fontWeight: "500", margin: 7, marginHorizontal: 4 }}>Removed Users</Text>
                                        <View style={{ flexDirection: "row", gap: 8, flex: 1, flexWrap: "wrap" }}>
                                            {
                                                removedUsers.map((item, index) => (
                                                    <Pressable style={{ backgroundColor: "#D13B5E", padding: 12, borderRadius: 12 }} onPress={() => handleAddUser(index)}>
                                                        <Text style={{ color: "white", fontWeight: "500", fontSize: 13, }}>{item.firstname} {item.lastname}</Text>
                                                    </Pressable>
                                                ))
                                            }
                                        </View>

                                    </View>

                                </View>
                            </View>



                            <View style={{ marginBottom: 30 }} />




                        </KeyboardAwareScrollView>
                    </>

            }
        </>



    )
}

