import React, { useEffect, useState, useContext, useLayoutEffect, useCallback } from 'react'
import { Text, View, ScrollView, StyleSheet, Pressable, useWindowDimensions, Image, FlatList, RefreshControl, Button, ActivityIndicator, Alert, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView, Switch } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { TextInput } from 'react-native';
import { colors, fontSize } from '../../../theme'
import { UserDataContext } from '../../../context/UserDataContext'
import { FlagContext } from '../../../context/FlagContext'
import { ColorSchemeContext } from '../../../context/ColorSchemeContext'
import axios from 'axios'
import styles from './styles'
import { Entypo, Feather } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import * as DocumentPicker from "expo-document-picker";
import Papa from "papaparse";
import * as FileSystem from "expo-file-system";
import * as XLSX from 'xlsx';
import { useRoute } from '@react-navigation/native';


export default function ViewList() {
    const navigation = useNavigation()

    const deviceHeight = useWindowDimensions().height;
    const deviceWidth = useWindowDimensions().width;

    const [refreshing, setRefreshing] = useState(false);
    const { userData, getCampaigns, contacts, getContacts } = useContext(UserDataContext)

    const [filePicked, setFilePicked] = useState(false);
    const [fileUri, setFileUri] = useState(null);
    const [csvData, setCsvData] = useState([]);
    const [isLoading, setIsLoading] = useState(false)

    const [importedContacts, setImportedContacts] = useState([])

    const route = useRoute()

    const { list } = route.params

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);

    // const typeList = [
    //     { label: "Single Blast", id: "SINGLE_BLAST" }, { label: "Burst", id: "BURST" }, { label: "Hook", id: "HOOK" }, { label: "Scheduled", id: "SCHEDULED" }, { label: "Personal", id: "PERSONAL" }
    // ]

    useEffect(() => {
        setIsLoading(true)
        axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/contact-lists/${list?.id}/contacts?lastid=0&order=ASC&limit=100`, { headers: { 'Authorization': userData.access_token } }).then((response) => {
            console.log("Successfully GOT Imported Contacts !!: ", response.data)

            setImportedContacts(response.data.records)
            setIsLoading(false)

        }).catch((err) => {
            console.log(err.response, " :ERROR GETTING CONTACTS");

        })
    }, [])

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


    const handleImportContact = (parsed) => {
        console.log("Importing xlsx: ", parsed[0].first_name)
        axios.post(`https://${process.env.EXPO_PUBLIC_LIVE}/contact-lists/${list?.id}/imports`, { contacts: parsed, import_name: `contacts_${parsed[0].first_name}` }, { headers: { 'Authorization': userData.access_token } }).then((response) => {
            console.log("Successfully Imported Contact !!: ", response.data)

        }).catch((err) => {
            console.log(err.response.data, ":ERROR IMPORTING CONTACT");

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
        console.log("Picking a function called");

        try {
            const result = await DocumentPicker.getDocumentAsync({ type: ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'] });
            if (result.canceled === false) {
                console.log("Result Assets: ", result.assets)
                const fileUri = result.assets[0].uri;
                const fileType = result.assets[0].name.split('.').pop();
                const fileName = result.assets[0].name;

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

                    // const fileBlob = new Blob([atob(fileData)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    // const formData = new FormData();
                    // formData.append('contacts', fileBlob);

                    // console.log("Parsed XLSX Data into FORM DATA:", formData);
                    let temp = handleParse(excelData)


                    // console.log("filtered Values: ", temp)

                    handleImportContact(temp);
                    setFilePicked(true);
                    getContacts(userData)


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
                            getContacts()

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

    const formatPhoneNumber = (e) => {
        let formattedNumber;
        const length = e?.length;

        // Filter non numbers
        const regex = () => e.replace(/[^0-9\.]+/g, "");
        // Set area code with parenthesis around it
        const areaCode = () => `(${regex().slice(0, 3)})`;

        // Set formatting for first six digits
        const firstSix = () => `${areaCode()} ${regex().slice(3, 6)}`;

        // Dynamic trail as user types
        const trailer = (start) => `${regex().slice(start,
            regex()?.length)}`;
        if (length < 3) {
            // First 3 digits
            formattedNumber = regex();
        } else if (length === 4) {
            // After area code
            formattedNumber = `${areaCode()} ${trailer(3)}`;
        } else if (length === 5) {
            // When deleting digits inside parenthesis
            formattedNumber = `${areaCode().replace(")", "")}`;
        } else if (length > 5 && length < 9) {
            // Before dash
            formattedNumber = `${areaCode()} ${trailer(3)}`;
        } else if (length >= 10) {
            // After dash
            formattedNumber = `${firstSix()}-${trailer(6)}`;
        }


        return formattedNumber

    };

    const Contact = ({ item }) => {
        // console.log("Campaign Component: ", item)
        const [isStopped, setIsStopped] = useState(item.stop)
        const [isExtra, setIsExtra] = useState(false)

        const handleStopped = () => {
            const config = {
                method: 'patch',
                url: `https://${process.env.EXPO_PUBLIC_LIVE}/contacts/${item.id}`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': userData.access_token
                },
                data: {
                    stop: !isStopped
                }
            };

            axios(config).then(async (response) => {
                console.log(response.data.record, " : Channel DATA")
                setIsStopped(!isStopped)
                Toast.show({
                    type: 'success',
                    text2: `Campaign ${item.number} has been ${isStopped ? 'un-stopped' : 'stopped'}`
                });

                getContacts()
                // Alert.alert(`Campaign ${item.number} has been ${isStopped? 'un-stopped' : 'stopped'}`, '', [
                //   { text: 'OK', onPress: () => getWorkspaceCampaigns(userData, showArchived) },
                // ]);
            }).catch((err) => {
                console.log(err.toJSON(), " Archive Error");

            })
        }

        const options = {
            weekday: 'numeric',
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
        };



        return (
            <Pressable style={{
                alignItems: "center", gap: 9, backgroundColor: colors.lightGrayPurple,
                borderRadius: 12, marginVertical: 5, paddingVertical: 10, paddingHorizontal: 5,
            }} onPress={() => setIsExtra(!isExtra)}
            >
                <View style={{ justifyContent: "space-between", flexDirection: "row", alignItems: 'center', width: "100%" }}>
                    <View style={{ flexDirection: 'row', alignItems: "center", gap: 8 }}>

                        <View style={{ padding: 10, paddingVertical: 11.5, borderRadius: 20, backgroundColor: "#DFDFDF", alignItems: "center" }} >
                            <Text style={{ color: "black", fontSize: 14, fontWeight: "500" }}>+1 {formatPhoneNumber(item?.meta?.number?.slice(1))}</Text>
                        </View>
                        <View style={{ flexDirection: "column", gap: 5, alignItems: "center" }}>

                            <View style={{ flexDirection: "column", gap: 5, alignItems: "flex-start" }}>
                                <Text style={{ fontWeight: "500", fontSize: 14, color: colors.black }}>{item?.meta?.first} {item?.meta?.last}</Text>
                                <Text style={{ fontWeight: "500", fontSize: 12, color: colors.grayLight }}>#{item?.id}</Text>

                            </View>
                        </View>
                    </View>
                    <View style={{}}>


                    </View>
                    <View style={{ padding: 12, flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <Pressable style={{ padding: 12, backgroundColor: colors.pink, borderRadius: 10 }} onPress={() => { handleStopped() }}>
                            <Feather name="trash" size={10} color="white" />
                        </Pressable>
                        <Entypo name="chevron-thin-down" size={18} color="black" />
                    </View>
                </View>
                <View style={{width: "100%"}}>
                    {
                        isExtra &&
                        <View>
                            <Text style={{ fontWeight: "500", paddingVertical: 5 }}>Meta Data</Text>
                            {
                                item?.meta?.order_id &&
                                <View style={{ flexDirection: "row" }}>
                                    <Text style={{ color: colors.grayLight }}>order_id: </Text>
                                    <Text style={{ color: colors.black }}>{item?.meta?.order_id}</Text>
                                </View>
                            }
                            {
                                item?.meta?.date &&
                                <View style={{ flexDirection: "row" }}>
                                    <Text style={{ color: colors.grayLight }}>date: </Text>
                                    <Text style={{ color: colors.black }}>{item?.meta?.date}</Text>
                                </View>
                            }
                            {
                                item?.meta?.company &&
                                <View style={{ flexDirection: "row" }}>
                                    <Text style={{ color: colors.grayLight }}>company: </Text>
                                    <Text style={{ color: colors.black }}>{item?.meta?.company}</Text>
                                </View>
                            }

                            {
                                item?.meta?.message &&
                                <View style={{ flexDirection: "row" }}>
                                    <Text style={{ color: colors.grayLight }}>message: </Text>
                                    <Text style={{ color: colors.black, flexWrap: "wrap", width: "82%"  }}>{item?.meta?.message}</Text>
                                </View>

                            }
                        </View>


                    }
                </View>
            </Pressable>
        )
    }


    return (
        <KeyboardAvoidingView
            style={{ height: '100%', backgroundColor: "white", flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}

        >
            <View>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 10, paddingTop: 3 }}>
                    <Feather name="chevron-left" size={30} color="black" />
                </TouchableOpacity>
            </View>
            {
                isLoading ?
                    <View style={{ alignItems: "center", justifyContent: "center" }}>
                        <ActivityIndicator size={170} style={{ height: 100, width: 100 }} />
                    </View> :
                    <View style={{ flex: 1 }}>
                        <View style={{ justifyContent: "space-between", flexDirection: "row", paddingHorizontal: 20 }}>
                            <View style={{}}>
                                <Text style={{ fontSize: 25, fontWeight: "600" }}>View {list.name}</Text>
                                <Text style={{ color: colors.grayLight }}>List of User Contacts</Text>
                            </View>
                            <Pressable style={{
                                backgroundColor: "#0162E8", padding: 10, borderRadius: 20,
                                shadowColor: "#000000",
                                shadowOpacity: 0.3033,
                                shadowRadius: 2.5,
                                shadowOffset: {
                                    height: 3,
                                    width: 1
                                },
                                alignItems: "center",
                                justifyContent: "center",
                                elevation: 3,
                                height: 37
                            }} onPress={() => { pickDocument() }}>
                                <Entypo name="plus" size={18} color="white" />
                            </Pressable>
                        </View>
                        <ScrollView style={{ width: deviceWidth, padding: 12 }} nestedScrollEnabled={true}
                            refreshControl={
                                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                            }>
                            <View style={{ height: "160%", marginBottom: 70, }}>
                                {

                                    importedContacts.map((item, index) => (
                                        <Contact item={item} />
                                    ))
                                }

                            </View>
                        </ScrollView>
                    </View>

            }

        </KeyboardAvoidingView>
    )
}

