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
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';

export default function UserBlasts() {

    const deviceHeight = useWindowDimensions().height;
    const deviceWidth = useWindowDimensions().width;

    const [refreshing, setRefreshing] = useState(false);

    const [showFilter, setShowFilter] = useState(false)

    const refreshRef = useRef(false)
    const { userData, setUserData, unreadNumber, setUnreadNumber, getChannels, channelList,
        handleUpdateList, isLoading, setIsLoading, currentList,
        archiveChecked, godChecked, setArchiveChecked, setGodChecked, regList, setRegList, refreshChannel, userSettings, getGodChannels } = useContext(UserDataContext)
    // const { rerender } = useContext(FlagContext)
    const { scheme } = useContext(ColorSchemeContext)

    const isDark = scheme === 'dark'
    const route = useRoute()
    const navigate = useNavigation()

    const { user } = route.params



    const onRefresh = useCallback(() => {
        console.log("IS ARCHIVED: ", archiveChecked, "  IS GOD MODE: ", godChecked)
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
        console.log('headers.device_additional_info: ', "Device Brand: ", Device.brand, "\n", "Device Name: ", Device.deviceName, "\n", "Device Type: ", Device.deviceType, "\n", "Device Year Class: ", Device.deviceYearClass, "\n", "Device Model: ", Device.modelName, "\n", "Device OS: ", Device.osName, "\n", "Device OS Version: ", Device.osVersion, "\n", "Device Model Id", Device.modelId, "\n", "Device Height: ", deviceHeight, "\n", "Device Width: ", deviceWidth)
    }, [])




    return (
        <View style={{}} >
            {
                isLoading ? <View style={{ position: "absolute", opacity: .5, backgroundColor: "white", height: deviceHeight, width: deviceWidth, zIndex: 5 }}></View> : ""
            }

            <View style={{ padding: 12, justifyContent: "space-between", flexDirection: "column", backgroundColor: "white", }}>
                <View style={{ flexDirection: "row", gap: 5,  alignItems: "center", paddingBottom: 5, marginTop: -10 }}>
                    <Pressable style={{ position: "absolute", height: 70, width: 90, top: -15, left: -15 }} onPress={() => { navigate.goBack() }}></Pressable>

                    <FontAwesome5 name="chevron-left" size={22} color="black" />


                </View>

                <View>
                    <Text style={{ fontSize: 16, fontWeight: "500" }}>{user.firstname} {user.lastname}'s User Blast Campaigns</Text>

                </View>

            </View>
            <View style={{ height: '100%', marginBottom: 10 }}>
                <FlatList
                    style={{ marginTop: 5, flexGrow: 1, }}
                    data={currentList}
                    renderItem={({ item, index }) => (
                        <Channel key={index} data={item} />
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

