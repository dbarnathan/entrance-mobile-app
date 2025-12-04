import React, { useEffect, useCallback, useMemo, useRef, useState, useContext, } from "react"
import { View, Text, Pressable, ScrollView, TouchableOpacity, useWindowDimensions, Platform, TextInput, Animated, Image, Share, DeviceEventEmitter, StyleSheet, Switch, KeyboardAvoidingView, FlatList, Alert, Keyboard, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { UserDataContext } from "../context/UserDataContext";
import Modal from "react-native-modal";
import colors from "../theme/colors";
import axios from "axios";
import Toast from 'react-native-toast-message';
import ColorPickerModal from "./ColorPickerModal";
import { Dropdown } from "react-native-element-dropdown";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import CreateMessage from "./CreateMessage";
import CreateLead from "./CreateLead";


export const CreateMessageModal = (props) => {
    const { isVisible, setIsVisible, } = props
    const { userData, userFlags } = useContext(UserDataContext)

    const [selectedFlag, setSelectedFlag] = useState("")
    const [message, setMessage] = useState("")

    const [index, setIndex] = useState(0);

    const [validMessage, setValidMessage] = useState(false)


    const deviceHeight = useWindowDimensions().height
    const deviceWidth = useWindowDimensions().width

    const renderScene = SceneMap({
        first: CreateMessage,
        second: CreateLead,
    });

    const toTitleCase = (str) =>
        str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

    const renderTabBar = (props) => (
        <TabBar
            {...props}
            indicatorStyle={styles.indicator}
            style={styles.tabBar}
            labelStyle={styles.label}
            activeColor={colors.primary} // Active tab color
            inactiveColor={colors.black} // Inactive tab color
            renderLabel={({ route, focused, color }) => (
                <Text style={[styles.label, { color }]}>
                    {toTitleCase(route.title)}
                </Text>
            )}
        />
    );

    const routes = [
        { key: 'first', title: 'Entrance' },
        { key: 'second', title: 'Entrata' },
    ];

    useEffect(() => {
        console.log("FLAG LIST: ", selectedFlag)
    }, [selectedFlag])




    return (
        <Modal
            propagateSwipe={true}
            animationIn="slideInUp"
            animationInTiming={500}
            animationOutTiming={500}
            backdropTransitionInTiming={1000}
            backdropTransitionOutTiming={500}
            isVisible={isVisible}
            onBackdropPress={() => setIsVisible(false)} // Ensure this correctly updates visibility
            style={[styles.backModal]}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>


                <View style={{ backgroundColor: colors.white, borderRadius: 12, height: deviceHeight * .7 }}>
                    <TabView
                        navigationState={{ index, routes }}
                        renderScene={renderScene}
                        renderTabBar={renderTabBar}
                        onIndexChange={setIndex}
                        initialLayout={{ width: deviceWidth }}
                    />
                </View>
            </TouchableWithoutFeedback>

        </Modal>
    )
}

const styles = StyleSheet.create({

    main: {

        borderRadius: 20,

        padding: 20,
        flexDirection: "column",


    },
    tabBar: {
        backgroundColor: colors.white,
        elevation: 0, // Remove shadow
        borderBottomWidth: 1,
        borderBottomColor: colors.grayLight,
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10 
    },
    backModal: {

        margin: 20,
        marginTop: 50,
        justifyContent: 'center'

    },
    label: {
        fontSize: 14,
        fontWeight: '500',
    },
    indicator: {
        backgroundColor: colors.primary,
        height: 1.5,
        borderRadius: 22
    },
    dropdown: {
        paddingVertical: 5,
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 8,
        width: '40%',

    },

})

export default CreateMessageModal