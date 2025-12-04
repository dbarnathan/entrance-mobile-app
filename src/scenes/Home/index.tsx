import React, { useEffect, useState, useContext, useLayoutEffect, useCallback, useRef } from 'react'
import { Text, View, ScrollView, StyleSheet, Pressable, useWindowDimensions, Image, FlatList, RefreshControl, TouchableOpacity, Platform, } from 'react-native'
import { doc, onSnapshot, setDoc, query, collection, getDocs, where, getDoc, orderBy } from 'firebase/firestore';
import { colors, fontSize } from '../../theme'
import { UserDataContext } from '../../context/UserDataContext'
import { FlagContext } from '../../context/FlagContext'
import { ColorSchemeContext } from '../../context/ColorSchemeContext'
import { sendNotification } from '../../utils/SendNotification'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import styles from './styles'
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Channel from '../../components/Channel';
import Ionicons from '@expo/vector-icons/Ionicons';
import { socket } from '../../sockets/socket';
import FilterModal from '../../components/FilterModal';
import { FontAwesome } from '@expo/vector-icons';
import CreateMessageModal from '../../components/CreateMessageModal';
export default function Home() {

    const deviceHeight = useWindowDimensions().height;
    const deviceWidth = useWindowDimensions().width;

    const [refreshing, setRefreshing] = useState(false);

    const [showFilter, setShowFilter] = useState(false)

    const [createVisible, setCreateVisible] = useState(false)

    const refreshRef = useRef(false)
    const { userData, setUserData, unreadNumber, setUnreadNumber, getChannels, channelList,
        handleUpdateList, isLoading, setIsLoading, currentList,
        archiveChecked, godChecked, setArchiveChecked, setGodChecked, regList, setRegList, refreshChannel, userSettings, getGodChannels } = useContext(UserDataContext)
    // const { rerender } = useContext(FlagContext)
    const { scheme } = useContext(ColorSchemeContext)

    const isDark = scheme === 'dark'
    const colorScheme = {
        content: isDark ? styles.darkContent : styles.lightContent,
        text: isDark ? colors.white : colors.primaryText
    }

    useEffect(() => {
        console.log("ENV HOST: ", process.env.EXPO_PUBLIC_LIVE)
    }, [])




    const onRefresh = useCallback(() => {
    
        setArchiveChecked(false)
        setGodChecked(false)
        refreshChannel(godChecked, archiveChecked, userData)
        // getGodChannels(userData)
        setRefreshing(true);


        // getChannels()
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);

    useEffect(() => {
        if (refreshing) {
      

        }
    }, [currentList])

    useEffect(() => {
        socket.Subscribe('CHANNEL_EVENT', (data) => {
            console.log(
                "DATA FROM WEBSOCKET HOME: ", data
            )
            refreshChannel(godChecked, archiveChecked, userData)

        })
        socket.Subscribe('CLAIMED_CHANNEL', (data) => {
            console.log(
                "DATA FROM WEBSOCKET CHANNEL: ", data
            )
            refreshChannel(godChecked, archiveChecked, userData)

        })
    }, [])

    useEffect(() => {
        socket.Subscribe('MESSAGE_EVENT', async (data) => {
            console.log(
                "DATA FROM WEBSOCKET MESSAGE SCREEN: ", data
            )
            try {
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: "New Message from your client 📬",
                        body: 'Here is the notification body',
                        data: { data: data, test: { test1: 'more data' } },
                    },
                    trigger: { seconds: 1 },
                });
            } catch (e) {
                console.log("ERROR: ", e)
            }

        })
    }, [])

    useEffect(() => {
        console.log("S O C K E T: ", process.env.EXPO_PUBLIC_API_SOCKET_BETA)
        console.log('headers.device_additional_info: ', "Device Brand: ", Device.brand, "\n", "Device Name: ", Device.deviceName, "\n", "Device Type: ", Device.deviceType, "\n", "Device Year Class: ", Device.deviceYearClass, "\n", "Device Model: ", Device.modelName, "\n", "Device OS: ", Device.osName, "\n", "Device OS Version: ", Device.osVersion, "\n", "Device Model Id", Device.modelId, "\n", "Device Height: ", deviceHeight, "\n", "Device Width: ", deviceWidth)
    }, [])

    const handleViewArchive = () => {
        setUnreadNumber(0)
        if (archiveChecked) {
            handleUpdateList(godChecked, false, regList)
            setArchiveChecked(false)
        } else {
            handleUpdateList(godChecked, true, regList)
            setArchiveChecked(true)
        }

    }


    const handleGodView = () => {
        // setUnreadNumber(0)

        handleUpdateList(!godChecked, archiveChecked, regList)
        setGodChecked(!godChecked)

    }


    return (
        <View style={{}} >
            <View style={{ padding: 15, position: "absolute", bottom: Platform.OS == "ios" ? 70 : 80, right: 15, zIndex: 3 }}>

                <Pressable style={[styles.sendButton]} onPress={() => { setCreateVisible(true) }}>
                    <FontAwesome name="send" size={24} color="white" />
                    {/* <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>Send </Text> */}
                </Pressable>
            </View>
            <CreateMessageModal isVisible={createVisible} setIsVisible={setCreateVisible} />
            {
                isLoading ? <View style={{ position: "absolute", opacity: .5, backgroundColor: "white", height: deviceHeight, width: deviceWidth, zIndex: 5 }}></View> : ""
            }

            <View style={{ padding: 12, justifyContent: "space-between", flexDirection: "row", backgroundColor: "white", }}>


                <FilterModal isVisible={showFilter} setIsVisible={setShowFilter} />

                <View>
                    <Text style={{ fontSize: 16 }}>Welcome back <Text style={{ fontWeight: "600" }}>{userData.firstname}</Text></Text>
                    <View style={{ flexDirection: "row", gap: 9 }}>
                        <View style={{ flexDirection: "row", paddingTop: 5 }}>
                            <Text style={{ fontWeight: "600" }}>Channels: </Text>
                            <Text style={{ color: colors.gray }}>{godChecked ? channelList.length : currentList.length}</Text>
                        </View>
                        <View style={{ flexDirection: "row", paddingTop: 5 }}>
                            <Text style={{ fontWeight: "600" }}>Unread: </Text>
                            <Text style={{ color: colors.gray }}>{unreadNumber}</Text>
                        </View>
                    </View>
                </View>
                <View style={{ flexDirection: "row", gap: 5 }}>
                    {
                        userSettings.permission == "admin" &&

                            godChecked ? <Pressable style={[styles.button, { backgroundColor: colors.green }]} onPress={() => { handleGodView() }}>
                            <MaterialCommunityIcons name="eye" size={15} color="white" />
                        </Pressable> : <Pressable style={[styles.button, { backgroundColor: 'lightgray' }]} onPress={() => { handleGodView() }}>
                            <MaterialCommunityIcons name="eye-off" size={15} color="white" />
                        </Pressable>
                    }

                    {
                        archiveChecked ? <Pressable style={[styles.button, { backgroundColor: '#f36666' }]} onPress={() => { handleViewArchive() }}>
                            <MaterialCommunityIcons name="archive" size={15} color="white" />
                        </Pressable> : <Pressable style={[styles.button, { backgroundColor: 'lightgray' }]} onPress={() => { handleViewArchive() }}>
                            <MaterialCommunityIcons name="archive-off" size={15} color="white" />
                        </Pressable>
                    }
                    <View style={{ margin: 5 }}>
                        <Pressable style={{ position: 'absolute', height: 50, width: 60, right: -20, top: -12, alignSelf: "center", zIndex: 5 }} onPress={() => { setShowFilter(true) }}>
                        </Pressable>
                        <Ionicons name="filter" size={24} color="black" />

                    </View>

                </View>
            </View>
            <View style={{ height: '100%', marginBottom: 10 }}>
                <FlatList
                    style={{ marginTop: 5, flexGrow: 1, }}
                    data={[...(godChecked ? channelList : currentList), { key: 'spacer' }]}
                    renderItem={({ item, index }) => (
                        item.key == 'spacer' ? (
                            <View style={{ height: 70 }} /> // Invisible spacer
                        ) : (
                            <Channel key={index} data={item} />
                        )

                    )}
                    extraData={refreshRef.current}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }

                />
                <View style={{ marginBottom: 150 }} />
            </View>



        </View>
    )
}

