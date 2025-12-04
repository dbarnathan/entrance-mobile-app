import React, { useEffect, useState, useContext, useLayoutEffect, useCallback } from 'react'
import { Text, View, ScrollView, StyleSheet, Pressable, useWindowDimensions, Image, FlatList, RefreshControl, Button, ActivityIndicator, Alert, TouchableOpacity, Platform, SafeAreaView } from 'react-native'
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
export default function Opening() {
    const navigation = useNavigation()
    const deviceHeight = useWindowDimensions().height;
    const deviceWidth = useWindowDimensions().width;
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false);
    const { userData, setUserData, getFlags } = useContext(UserDataContext)
    const { rerender } = useContext(FlagContext)
    const { scheme } = useContext(ColorSchemeContext)

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



    return (
        <TouchableOpacity style={{ backgroundColor: "#FAF0DC", height: "100%" }} onPress={() => { Keyboard.dismiss() }} activeOpacity={1.0} >
            {
                Platform.OS === "ios" ?
                    <SafeAreaView style={Platform.OS == "ios" ? { flex: .01, backgroundColor: "#FAF0DC" } : { flex: 0.06 }}>
                        <StatusBar barStyle="dark-content" backgroundColor="#FAF0DC" />
                    </SafeAreaView> : <StatusBar barStyle="dark-content" backgroundColor="#FAF0DC"/>
            }
            <View style={{ backgroundColor: "#FAF0DC", justifyContent: "space-between", height: '85%', flexDirection: "column", alignItems: "center" }}>
                <View>
                    <Text style={{ color: "#0C4141", fontSize: 45, textAlign: "left", fontWeight: '600', marginTop: 20 }}>A Business with two-way SMS</Text>
                    <Image source={require('../../../assets/images/landing.png')} resizeMode='contain'
                        style={{ justifyContent: "center", alignItems: "center", paddingBottom: 20, marginTop: -25, height: deviceHeight * .5, width: deviceWidth * .9 }} />
                </View>
                <View style={{ width: "100%", alignItems: "center", gap: 70}}>
                    <Pressable style={styles.button} onPress={() => { navigation.navigate("Login") }}>
                        <Text style={{ color: colors.darkPurple, fontSize: 18, fontWeight: "600" }}>Continue</Text>
                    </Pressable>
                    <Text>@2024 Entrance Group LLC</Text>
                </View>


            </View>
            {/* <View style={{ backgroundColor: "#8f9cc2", height: "100%" }}>
                <View style={{ padding: 20, paddingTop: 32 }}>

                    <Pressable style={styles.button} onPress={() => { navigation.navigate("Login") }}>
                        <Text style={{ color: "white", fontSize: 16 }}>Continue</Text>

                    </Pressable>




                </View>
            </View> */}




        </TouchableOpacity>
    )
}

