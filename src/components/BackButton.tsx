import { Pressable, Text, View } from 'react-native'
import { Tag } from '../utils/Tags';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const BackButton = () => {
    const navigation = useNavigation()
    return (
        <View style={{ flexDirection: "row", gap: 5, padding: 8, paddingTop: 0 }}>
            <Pressable style={{ position: "absolute", height: 70, width: 90, top: -20, left: -20 }} onPress={() => { navigation.goBack() }}></Pressable>

            <FontAwesome5 name="chevron-left" size={22} color="black" />


        </View>
    )
}



export default BackButton