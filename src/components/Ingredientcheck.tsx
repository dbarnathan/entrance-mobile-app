import React, { useRef, useContext, useEffect, useState } from 'react'
import { Text, View, ScrollView, StyleSheet, Dimensions, Image, useWindowDimensions, Pressable } from 'react-native'
import { ColorSchemeContext } from '../context/ColorSchemeContext'
import { getUser } from '../utils/firebaseFunctions';
import { colors, fontSize } from '../theme'
import { doc, onSnapshot, collection, query, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { AntDesign } from '@expo/vector-icons';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { useNavigation } from '@react-navigation/native';


export default function Ingredientcheck(props) {
    const deviceWidth = useWindowDimensions().width;
    const navigation = useNavigation();
    const { scheme } = useContext(ColorSchemeContext)
    const { ingredient, id } = props
    const isDark = scheme === 'dark'
    const [isChecked, setIsChecked] = useState(false)
    const colorScheme = {
        content: isDark ? styles.darkContent : styles.lightContent,
        text: isDark ? colors.white : colors.primaryText
    }



    return (
        <View style={[colorScheme.content, styles.plate]} >
            <BouncyCheckbox onPress={() => setIsChecked(!isChecked)} />
            <Pressable onPress={() => {
                navigation.navigate(
                    'SearchIngredient',
                    {
                        name: ingredient,
                        id: id
                    })
            }}>
                <Text style={[styles.contents, {color: colorScheme.text}]}>{ingredient}</Text>

            </Pressable>

        </View>
    )
}

const { height, width } = Dimensions.get('window')
const styles = StyleSheet.create({
    plate: {
        flexDirection: "row",
        
        flex: 1,
        margin: 5
    },
    animation: {
        width: width * 0.25,
        height: height * 0.25,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        fontSize: fontSize.large,
        marginBottom: 1,

    },
    contents: {
        fontSize: fontSize.medium,
        fontWeight: '500', 
        fontStyle: 'italic',
    },
    field: {
        fontSize: fontSize.middle,
        textAlign: 'center',
    },
});