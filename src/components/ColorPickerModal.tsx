import React, { useEffect, useCallback } from "react"
import { View, Text, StyleSheet, Image, useWindowDimensions, Alert, Pressable, RefreshControl, FlatList, Touchable, } from 'react-native'
import { Dispatch, useState, useContext } from "react";
import { SetStateAction } from "react";
import { colors, fontSize } from '../theme'
import { ColorSchemeContext } from '../context/ColorSchemeContext'
import Modal from "react-native-modal";
import { UserDataContext } from "../context/UserDataContext";
import ColorPicker, { Panel1, Swatches, Preview, HueCircular, Panel3 } from 'reanimated-color-picker';

type ModalProps = {
    isVisible: boolean;
    setIsVisible: Dispatch<SetStateAction<boolean>>;
    color: string;
    setSelectedColor: Dispatch<SetStateAction<string>>;
};

const ColorPickerModal = ({
    isVisible = false,
    setIsVisible,
    color = "#000000",
    setSelectedColor

}: ModalProps) => {
    const ref = React.useRef<FlatList>(null)

    const deviceHeight = useWindowDimensions().height;
    const deviceWidth = useWindowDimensions().width;

    const { userData } = useContext(UserDataContext)
    const { scheme } = useContext(ColorSchemeContext)


    const isDark = scheme === 'dark'
    const colorScheme = {
        content: isDark ? styles.darkContent : styles.lightContent,
        text: isDark ? colors.white : colors.primaryText
    }

    const onSelectColor = ({ hex }) => {
        // do something with the selected color.
        console.log(hex);
        setSelectedColor(hex);
    };

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
            style={[styles.backModal, { marginTop: deviceHeight * .35 }]}>

            <ColorPicker style={{ width: '100%',  }} value={color} onComplete={onSelectColor}>
                <Panel1 style={[styles.panelStyle, { top: deviceHeight * .33, }]} />
                <HueCircular style={styles.hueContainer} thumbShape='pill' />


                <View style={{ paddingVertical: 10 }}>

                </View>
                <Swatches />
            </ColorPicker>




        </Modal>

    )
};

const styles = StyleSheet.create({
    backModal: {
        justifyContent: "flex-end",
        margin: 0,
        backgroundColor: "white",
        borderTopRightRadius: 35,
        borderTopLeftRadius: 35,

        padding: 20,
        paddingBottom: 90
    },
    hueContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    panelStyle: {
        position: "absolute",
        height: "31%",
        width: "61%",
        zIndex: 2,
        alignSelf: 'center',

        borderRadius: 16,
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

export default ColorPickerModal;
