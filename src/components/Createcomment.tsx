import React, { useEffect, useCallback, useRef } from "react"
import { View, Text, StyleSheet, Image, useWindowDimensions, Alert, Pressable, RefreshControl, FlatList, TextInput, Keyboard, Platform, ScrollView, TouchableOpacity } from 'react-native'

import { doc, onSnapshot, setDoc, query, collection, getDocs, where, getDoc, orderBy } from 'firebase/firestore';
import { Dispatch, useState, useContext } from "react";
import { SetStateAction } from "react";
import { colors, fontSize } from '../theme'

import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { UserDataContext } from "../context/UserDataContext";
import { Entypo } from '@expo/vector-icons';
import { ColorSchemeContext } from '../context/ColorSchemeContext'
import * as ImageManipulator from 'expo-image-manipulator'
import { Avatar } from '@rneui/themed';
import { showToast } from '../utils/ShowToast'
import Modal from "react-native-modal";
import * as ImagePicker from 'expo-image-picker'
import Button from "./Button";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { FlagContext } from "../context/FlagContext";

type ModalProps = {
    isVisible: boolean;
    setIsVisible: Dispatch<SetStateAction<boolean>>;
    id: string;
};

const Createcomment = ({
    isVisible = false,
    setIsVisible,
    id

}: ModalProps) => {

    const deviceHeight = useWindowDimensions().height;
    const deviceWidth = useWindowDimensions().width;
    const inputRef = useRef(null);
    const { userData } = useContext(UserDataContext)
    const [refreshing, setRefreshing] = useState(false);
    const [progress, setProgress] = useState('')
    const {rerender, setRerender} = useContext(FlagContext)
    const [text, setText] = useState('')
    const [image, setImage] = useState("")
    const { scheme } = useContext(ColorSchemeContext)

    const isDark = scheme === 'dark'
    const colorScheme = {
        content: isDark ? styles.darkContent : styles.lightContent,
        text: isDark ? colors.white : colors.primaryText
    }

    useEffect(() => {
        inputRef?.current?.focus()
    }, [isVisible])

    const ImageChoiceAndUpload = async () => {
        try {
            if (Platform.OS === 'ios') {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
                if (status !== 'granted') {
                    alert("Permission is required for use.");
                    return;
                }
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: false,
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: false
            });
            if (!result.canceled) {
                setImage(result.assets[0].uri)

            }
        } catch (e) {
            console.log('error', e.message);
            alert("The size may be too much.");
        }
    }

    const handlePost = async () => {

        if (image.length > 5) {
            let actions = [];
            actions.push({ resize: { width: 300 } });
            const manipulatorResult = await ImageManipulator.manipulateAsync(
                image,
                actions,
                {
                    compress: 0.4,
                },
            );
            const localUri = await fetch(manipulatorResult.uri);
            const localBlob = await localUri.blob();
            const filename = userData.id + new Date().getTime()
            const storageRef = ref(storage, `comments/${userData.id}/` + filename)
            const uploadTask = uploadBytesResumable(storageRef, localBlob)
            uploadTask.on('state_changed',
                (snapshot) => {
                    let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setProgress(parseInt(progress) + '%')
                },
                (error) => {
                    console.log(error);
                    alert("Upload failed.");
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        setProgress('')
                        try {
                            setDoc(doc(collection(firestore, 'posts', id, 'comments')), {
                                text: text,
                                avatar: userData.avatar,
                                name: userData.fullName,
                                image: downloadURL,
                                createdAt: new Date(),
                                user: userData.id
                            });
                            setDoc(doc(collection(firestore, 'users', userData.id, 'comments')), {
                                text: text,
                        
                                image: downloadURL,
                                createdAt: new Date(),
                                user: userData.id,
                                post: id

                            }),
                                showToast({
                                    title: 'Comment Posted',
                                    body: 'Comment Posted',
                                    isDark
                                })
                     


                        } catch (e) {

                        }

                    });
                }
            );
        } else {
            try {
                setDoc(doc(collection(firestore, 'posts', id, 'comments')), {
                    text: text,
                    avatar: userData.avatar,
                    name: userData.fullName,
                    image: "",
                    createdAt: new Date(),
                    user: userData.id
                });
                setDoc(doc(collection(firestore, 'users', userData.id, 'comments')), {
                    text: text,
                
                    image: "",
                    createdAt: new Date(),
                    user: userData.id,
                    post: id

                }),
                    showToast({
                        title: 'Comment Posted',
                        body: 'Comment Posted',
                        isDark
                    })
             
            } catch (e) {
                console.log("Comment Error: ", e)
            }

        }
        setRerender(!rerender)
        setImage("")
        setText("")
        setIsVisible(false)

    }

    return (

        <Modal isVisible={isVisible} onBackdropPress={() => { Keyboard.dismiss(); setIsVisible(false) }} style={[styles.backModal, { height: deviceHeight }]} backdropOpacity={0.92}>

            <KeyboardAwareScrollView bounces={false} keyboardShouldPersistTaps={'always'} keyboardDismissMode="on-drag" style={styles.card}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", paddingBottom: 12 }}>
                    <Entypo name="cross" size={28} color="white" onPress={() => { Keyboard.dismiss(); setIsVisible(false) }} />
                    <Text style={[{ color: colorScheme.text }, styles.title]}>Make a Comment</Text>
                    <Text>{""}</Text>
                </View>
                <TextInput
                    ref={inputRef}
                    placeholder={`Let the kitchen conversations begin!`}
                    placeholderTextColor={colors.gray}
                    editable
                    multiline
                    maxLength={160}
                    onChangeText={text => setText(text)}
                    value={text}
                    style={{ color: colorScheme.text, fontSize: 20, paddingBottom: 5 }}
                />
                {
                    image.length > 2 ? <TouchableOpacity onLongPress={() => ImageChoiceAndUpload()}>
                        <Image source={{ uri: image }} style={{
                            width: 300,
                            height: 400,
                            borderRadius: 20,
                        }} />
                    </TouchableOpacity> : ""
                }
                <View style={{ flexDirection: "row", justifyContent: "space-between", paddingBottom: 82, alignItems: 'center' }}>
                    {image.length > 2 ? <Feather name="delete" size={24} color={colors.gray} onPress={() => setImage("")} /> : <MaterialIcons name="add-photo-alternate" size={34} color={colors.gray} style={{ flex: 1, paddingTop: 20 }} onPress={ImageChoiceAndUpload} />}
                    <Button
                        label='Post'
                        textColor={{ fontWeight: "600" }}
                        buttonStyle={{ borderRadius: 22, height: 38 }}
                        color={colors.lightPurple}
                        onPress={handlePost}
                    />

                </View>

            </KeyboardAwareScrollView >
        </Modal>

    )
};

const styles = StyleSheet.create({
    backModal: {
        flex: 1,
        marginTop: 30

    },
    title: {
        fontWeight: "600",
        fontSize: fontSize.large
    },
    main: {
        flex: 1,
        marginTop: 10,

    },
    card: {
        padding: 20,
        paddingHorizontal: 6,
        paddingTop: 40,

    },
    lightContent: {
        backgroundColor: '#e6e6fa'
    },
    darkContent: {
        backgroundColor: '#696969'
    },
})

export default Createcomment;
