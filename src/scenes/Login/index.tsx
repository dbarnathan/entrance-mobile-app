import React, { useEffect, useState, useContext, useLayoutEffect, useCallback } from 'react'
import { Text, View, ScrollView, StyleSheet, Pressable, useWindowDimensions, Image, FlatList, RefreshControl, Button, ActivityIndicator, Alert, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { TextInput } from 'react-native';
import { doc, onSnapshot, setDoc, query, collection, getDocs, where, getDoc, orderBy } from 'firebase/firestore';
import { colors, fontSize } from '../../theme'
import { UserDataContext } from '../../context/UserDataContext'
import { FlagContext } from '../../context/FlagContext'
import { ColorSchemeContext } from '../../context/ColorSchemeContext'
import axios from 'axios'
import styles from './styles'
import { StatusBar } from 'react-native'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { Keyboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login() {
    const navigation = useNavigation()
    const deviceHeight = useWindowDimensions().height;
    const deviceWidth = useWindowDimensions().width;
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false);
    const { userData, setUserData, getFlags, getChannels, getUnClaimed, getGodChannels, getContacts, getAllCampaigns, 
        getRecentCampaigns, getWorkspaceUsers, getUserSettings, getWorkspaceCampaigns, getUserGroups, getContactLists, getWorkspaceNumbers, getUserPermission} = useContext(UserDataContext)
    const { rerender } = useContext(FlagContext)
    const { scheme } = useContext(ColorSchemeContext)
    const [response, setResponse] = useState()

    const isDark = scheme === 'dark'
    const colorScheme = {
        content: isDark ? styles.darkContent : styles.lightContent,
        text: isDark ? colors.white : colors.primaryText
    }
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);

    useEffect(() => {
        const refreshToken = async () => {
            try {
              const res = await axios.post(
                'https://apiv2.entrancegrp.com/authentication/refresh-token',
                {
                  client_id: 'ecina1umoP4zkQqfUofvwisp7YYcxeGGRB',
                  refresh_token: 'mS_QucrNAu7qF7cBEcCOfmvEvN6TOFQ',
                },
                {
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer UhmIA1Tod4M9q63qRzthBJiBzvP4x58G',
                  },
                }
              );
              setResponse(res.data);
            } catch (err) {
        
              console.error(err);
            }
          };

    })

    

    const handleLogIn = async () => {
        console.log("log in: ", username.toLowerCase())
        setIsLoading(true)

        axios.post(`https://apiv2.entrancegrp.com/authentication/login`, { email: username.toLowerCase(), password: password }).then(async (response) => {
            const concatData = response.data.record

        
            try {
                console.log("Response: ", response.data.record)
                const jsonData = JSON.stringify(concatData);
                await AsyncStorage.setItem('token', jsonData);
                await AsyncStorage.setItem('clientId', JSON.stringify(response.data.record.client_id))
                setUserData({ ...response.data.record, ...{ access_token: response.data.record.access_token} })
          
                getChannels(response.data.record)
                getUnClaimed(response.data.record)
                getGodChannels(response.data.record)
                // getCampaigns(response.data.record)
                getFlags(response.data.record)
                getAllCampaigns(response.data.record)
                getRecentCampaigns(response.data.record)
                getWorkspaceUsers(response.data.record)
                getUserSettings(response.data.record)
                getWorkspaceCampaigns(response.data.record)
                getUserGroups(response.data.record)
                getContacts(response.data.record)
                getContactLists(response.data.record)
                getWorkspaceNumbers(response.data.record)
                getUserPermission(response.data.record)
                // getFlags()
                setIsLoading(false)
                console.log('Object added to AsyncStorage successfully!');
            } catch (error) {
                // console.error('Error adding object to AsyncStorage:', error);
                // Alert.alert('Error Adding object to Async Storage', "", [
                //     { text: 'OK', onPress: () => console.log('OK Pressed') },
                // ]);
                setIsLoading(false)
            }

        }).catch((err) => {
            // Alert.alert('Incorrect username or Password', err.message + "\n" + JSON.stringify(err.response.data) + "\n" + err.response.headers, [
            //     { text: 'OK', onPress: () => console.log('OK Pressed') },
            // ]);
            setIsLoading(false);
            console.log("Error Logging in: ", err.response);
            Alert.alert("Log in Information is incorrect")
            console.log(err.response.status);
            console.log(err.config)

        })
    }

    return (
        <KeyboardAvoidingView
            style={{ height: '100%', backgroundColor: "#8f9cc2" }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}

        >

            <StatusBar barStyle="light-content" backgroundColor="#283251" />
            <ScrollView >
                <View style={{ backgroundColor: "#283251", justifyContent: "center", paddingTop: 45, paddingLeft: 15 }}>
                    {/* <Text style={{ color: "#7972BC", fontSize: 22, fontWeight: "bold", alignItems: "flex-start" }}>Welcome Back!</Text> */}
                    <Image source={require('../../../assets/images/purpleE.png')} resizeMode='contain'
                        style={{ alignItems: "flex-start", height: deviceHeight * .1, width: deviceWidth * .15 }} />
                    <Image source={require('../../../assets/images/login.png')} resizeMode='contain'
                        style={{ alignSelf: "center", marginBottom: 20, height: deviceHeight * .32, width: deviceWidth * .6 }} />
                </View>
                <View style={{ backgroundColor: "#8f9cc2", height: "160%", marginBottom: 70 }}>
                    <View style={{ padding: 20, paddingTop: 32 }}>

                        <View style={{ gap: 12, paddingBottom: 25 }}>

                            <TextInput
                                style={{ backgroundColor: colors.lightGrayPurple, color: "black", borderRadius: 12, fontSize: 16, padding: 12, borderColor: "#7972BC", borderWidth: 1 }}
                                placeholderTextColor={"gray"}

                                placeholder={"Username"}

                                onChangeText={(value) => setUsername(value)}
                                value={username}
                                underlineColorAndroid="transparent"

                            />
                        </View>
                        <View style={{ gap: 12, paddingBottom: 25 }}>

                            <TextInput
                                style={{ backgroundColor: colors.lightGrayPurple, color: "black", borderRadius: 12, fontSize: 16, padding: 12, borderColor: "#7972BC", borderWidth: 1 }}
                                placeholderTextColor={"gray"}

                                placeholder={"Password"}
                                secureTextEntry={true}

                                onChangeText={(value) => setPassword(value)}
                                value={password}
                                underlineColorAndroid="transparent"

                            />
                        </View>
                        {
                            isLoading ? <Pressable style={[styles.button, { backgroundColor: "lightgray" }]}>
                                <ActivityIndicator />

                            </Pressable> :
                                <Pressable style={styles.button} onPress={() => { console.log("HELLO"); handleLogIn() }}>
                                    <Text style={{ color: "white", fontSize: 16 }}>Login </Text>

                                </Pressable>
                        }

                    </View>
                </View>
            </ScrollView>



        </KeyboardAvoidingView>
    )
}

