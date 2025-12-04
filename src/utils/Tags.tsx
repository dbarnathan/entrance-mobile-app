import { ColorValue } from "react-native"

export type Tag = {name : string, color : ColorValue}

const tags: Tag[] = [
    {name: "American Cuisine", color: "#FF00FF"},
    {name: "Japanese Cuisine", color: "#4938FF"},
    {name: "Bad Food", color: "#28400F"},
    {name: "Even Worse Food", color: "#289000"},
    {name: "good food", color: "#489834"},
    {name: "i lied the food sucks", color: "#FF40EE"}
]

export default tags