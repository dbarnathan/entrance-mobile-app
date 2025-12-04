import React, { useEffect, useState, useContext, useLayoutEffect, useCallback, useRef } from 'react'
import { Text, View, ScrollView, StyleSheet, Pressable, useWindowDimensions, Image, FlatList, RefreshControl, TouchableOpacity, } from 'react-native'
import { doc, onSnapshot, setDoc, query, collection, getDocs, where, getDoc, orderBy } from 'firebase/firestore';
import { colors, fontSize } from '../../theme'
import { UserDataContext } from '../../context/UserDataContext'
import { FlagContext } from '../../context/FlagContext'
import { ColorSchemeContext } from '../../context/ColorSchemeContext'
import { sendNotification } from '../../utils/SendNotification'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import styles from './styles'
import { SelectCountry } from 'react-native-element-dropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Claim from '../../components/Claim';
const local_data = [
    {
        value: '1',
        lable: 'All',
        image: {
            uri: 'https://www.vigcenter.com/public/all/images/default-image.jpg',
        },
    },
    {
        value: '2',
        lable: 'Stops',
        image: {
            uri: 'https://www.vigcenter.com/public/all/images/default-image.jpg',
        },
    },
    {
        value: '3',
        lable: 'Archived',
        image: {
            uri: 'https://www.vigcenter.com/public/all/images/default-image.jpg',
        },
    },
];

export default function Claims() {

    const deviceHeight = useWindowDimensions().height;
    const deviceWidth = useWindowDimensions().width;
    const [refreshing, setRefreshing] = useState(false);

    const refreshRef = useRef(false)
    const { userData, isLoading,
        claimedList, getUnClaimed, currentClaimed, handleClaimedFilter, currentFilter, setCurrentFilter } = useContext(UserDataContext)

    const onRefresh = useCallback(() => {
        getUnClaimed(userData)
        setRefreshing(true);
        refreshRef.current = !refreshRef.current

        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);

    return (
        <View style={{}} >
            {
                isLoading ? <View style={{ position: "absolute", opacity: .5, backgroundColor: "white", height: deviceHeight, width: deviceWidth, zIndex: 5 }}></View> : ""
            }

            <View style={{ padding: 12, justifyContent: "space-between", flexDirection: "row", backgroundColor: "white", width: "100%" }}>

                <View style={{ flexDirection: "row", gap: 5, alignItems: "center", justifyContent: "space-between", }}>
                    <View >
                        <Text>Claims</Text>
                    </View>

                    <SelectCountry
                        style={styles.dropdown}
                        selectedTextStyle={styles.selectedTextStyle}
                        placeholderStyle={styles.placeholderStyle}
                        imageStyle={styles.imageStyle}
                        maxHeight={200}
                        value={currentFilter}
                        data={local_data}
                        valueField="value"
                        labelField="lable"
                        imageField="image"
                        placeholder="Select country"
                        searchPlaceholder="Search..."
                        onChange={e => {
                            console.log("E: ", e.lable)
                            handleClaimedFilter(e.value, claimedList)
                            setCurrentFilter(e.value);
                        }}
                    />

                </View>
            </View>
            <View style={{ height: '100%', paddingBottom: deviceHeight * .2 }}>
                {
                    currentClaimed.length > 0 ? <FlatList
                        style={{ marginTop: 5, flexGrow: 1 }}
                        data={currentClaimed}
                        renderItem={({ item, index }) => (
                            <Claim key={index} data={item} index={index} />
                        )}
                        extraData={refreshRef.current}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }

                    /> : <View style={{ alignItems: "center", paddingVertical: 5, justifyContent: "center", marginTop: deviceHeight * .2, gap: 15 }}>
                        <Image source={require('../../../assets/images/purpleE.png')} resizeMode='contain'
                            style={{ height: deviceHeight * .2, width: deviceWidth * .8, tintColor: colors.grayedOut }} />
                        <Text style={{ color: colors.grayLight, fontSize: 16 }}>Nothing to Claim is Available</Text>
                    </View>
                }

            </View>



        </View>
    )
}

