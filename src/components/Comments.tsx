import React, { useEffect, useCallback } from "react"
import { View, Text, StyleSheet, Image, useWindowDimensions, Alert, Pressable, RefreshControl, FlatList, Touchable, } from 'react-native'
import { doc, onSnapshot, setDoc, query, collection, getDocs, where, getDoc, orderBy } from 'firebase/firestore';
import { Dispatch, useState, useContext } from "react";
import { SetStateAction } from "react";
import { colors, fontSize } from '../theme'
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { ColorSchemeContext } from '../context/ColorSchemeContext'
import Createcomment from "./Createcomment";
import { Avatar } from '@rneui/themed';
import Modal from "react-native-modal";
import { Ionicons } from '@expo/vector-icons';
import TimeAgo from 'react-native-timeago';
import { UserDataContext } from "../context/UserDataContext";
import { TouchableOpacity } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from '@react-native-masked-view/masked-view';

type ModalProps = {
    isVisible: boolean;
    setIsVisible: Dispatch<SetStateAction<boolean>>;
    numberOfLikes: number;
    comments: any[];
    id: string
};

const Comments = ({
    isVisible = false,
    setIsVisible,
    id,
    comments,
    numberOfLikes

}: ModalProps) => {
    const ref = React.useRef<FlatList>(null)

    const deviceHeight = useWindowDimensions().height;
    const deviceWidth = useWindowDimensions().width;
    const [showCreate, setShowCreate] = useState(false)
    const [refreshing, setRefreshing] = useState(false);
    const { userData } = useContext(UserDataContext)
    const [commentsList, setCommentsList] = useState([{}])
    const { scheme } = useContext(ColorSchemeContext)

    const isDark = scheme === 'dark'
    const colorScheme = {
        content: isDark ? styles.darkContent : styles.lightContent,
        text: isDark ? colors.white : colors.primaryText
    }

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        getComments();
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);

    const getComments = async () => {
        const usersRef = await collection(firestore, 'posts', id, 'comments')
        const q = query(usersRef, orderBy("createdAt", "desc"));
        let temp = []
        const querySnapshot = await getDocs(q);

        // console.log("THE SNAPSHOT: ", querySnapshot)
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            console.log("comment: ", doc.id, " => ", doc.data());
            temp.push({ id: doc.id, data: doc.data() })
            // setUserList([...userList, ...[doc.data()]])
        });

        setCommentsList(temp)
    }

    useEffect(() => {
        getComments();
    }, [isVisible])

    const Comment = ({ val: val }) => {
        console.log("Comment Value: ", val)
        const date = val?.createdAt?.toDate()
        return (
            <View style={{ flexDirection: "row", alignItems: "flex-start", width: deviceWidth, paddingRight: 60, marginVertical: 12 }}>
                <Avatar
                    size="small"
                    rounded
                    source={{ uri: val?.avatar }}
                />

                <View style={{ flexDirection: "column", marginLeft: 12 }}>
                    <Text style={{ color: colorScheme.text, fontSize: 12, }}>{val.name}</Text>
                    {val.image.length > 2 ? <View style={{ paddingTop: 10 }}><Image style={{ width: 140, height: 140, borderRadius: 20 }} source={{ uri: val.image }} /></View> : ""}

                    <Text style={[{ color: colorScheme.text, paddingTop: 5 }]} numberOfLines={3}>{val.text}</Text>
                    <View style={{ flexDirection: "row", gap: 10, paddingTop: 8, alignItems: "center" }}>
                        <Text style={{ color: colors.gray, fontSize: fontSize.small }}><TimeAgo time={date} /></Text>
                        <Text style={{ color: colorScheme.text }}>Reply</Text>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <FontAwesome name="heart-o" size={14} color={colorScheme.text} />
                            <Text style={{ color: colorScheme.text, fontSize: 14, paddingLeft: 4 }}>0</Text>
                        </View>
                    </View>
                </View>


            </View>
        )
    }

    return (

        <Modal
            propagateSwipe={true}
            animationIn="slideInUp"
            animationOut="bounceOutDown"
            animationInTiming={500}
            animationOutTiming={500}
            backdropTransitionInTiming={1000}
            backdropTransitionOutTiming={500}
            isVisible={isVisible}
            onBackdropPress={() => { setIsVisible(false) }}
            onSwipeComplete={() => { setIsVisible(false) }}
            style={[styles.backModal, { marginTop: deviceHeight / 5 }]}>

            <Createcomment isVisible={showCreate} setIsVisible={setShowCreate} id={id} />

            <Text style={[{ color: colorScheme.text, }, styles.title]}>Comments</Text>
            <View style={{ flexDirection: "row", gap: 14, paddingTop: 20, paddingBottom: 8 }}>
                <View style={{ alignItems: "flex-start", flexDirection: "row", gap: 8 }}>
                    <Text style={{ color: colorScheme.text, fontSize: 16, paddingBottom: 8 }}>{numberOfLikes}</Text>
                    <FontAwesome name="heart" size={18} color={colorScheme.text} />
                </View>
                <View style={{ alignItems: "flex-start", flexDirection: "row", gap: 8 }}>
                    <Text style={{ color: colorScheme.text, fontSize: 16, paddingBottom: 8 }}>{comments?.length}</Text>
                    <Ionicons name="chatbubble-ellipses-outline" size={20} color={colorScheme.text} />
                </View>
            </View>
            <View style={{ backgroundColor: colors.gray, borderTopColor: colors.gray, borderRadius: 12, height: 1 }} />
            <MaskedView
                style={{ flex: 1, height: 20 }}
                maskElement={<LinearGradient style={{  flex: 1 }} colors={['white', 'transparent']} start={{x: 0.5, y: .8}} end={{x: 0.5, y: 1}}/>}
            >
                <FlatList

                    ref={ref}
                    
                    contentContainerStyle={{ flexGrow: 4 }}
                    scrollEnabled={true}
                    style={[, styles.main,]}
                    data={commentsList}
                    keyExtractor={(item) => item?.id + (Math.random() * 9999)}
                    renderItem={({ index, item }) => <Comment key={item?.id} val={item?.data} />}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }

                />
            </MaskedView>


            <View style={{ paddingVertical: 0, paddingBottom: 0 }}>
                <Pressable style={{ borderColor: colorScheme.text, borderWidth: 1, borderRadius: 28, padding: 10, flexDirection: "row", gap: 12, alignItems: "center" }} onPress={() => { setShowCreate(true) }}>
                    <Avatar
                        size="small"
                        rounded

                        source={{ uri: userData.avatar }}
                    />
                    <Text style={{ color: colors.gray, fontSize: 16, fontWeight: '500' }}>Tell Them What you Think</Text>
                </Pressable>
            </View>

        </Modal>

    )
};

const styles = StyleSheet.create({
    backModal: {
        justifyContent: "flex-end",
        margin: 0,
        backgroundColor: colors.dark,
        borderTopRightRadius: 35,
        borderTopLeftRadius: 35,

        padding: 20
    },
    main: {
        flex: 1,


    },
    card: {

    },
    title: {
        fontWeight: "600",
        fontSize: fontSize.large,
        textAlign: "center",
    },
    lightContent: {
        backgroundColor: '#e6e6fa'
    },
    darkContent: {
        backgroundColor: '#696969'
    },
})

export default Comments;
