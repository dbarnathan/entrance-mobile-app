import { firestore, } from "../firebase/config";
import { doc, onSnapshot, collection, query, getDoc, setDoc, deleteDoc, onVal, FieldValue } from 'firebase/firestore';



const follow = async ({ userData, data }) => {

    if (data.id == userData.id) {
        alert("You can't follow yourself");
    } else {
        try {

            const followRef = await doc(firestore, 'users', userData.id, 'following', data.id)
            const items = {
                avatar: data.avatar,
                name: data.name,
                id: data.id
            }
            await setDoc(followRef, items)
            console.log("New follow: ", followRef.id)
        } catch (e) {
            console.log("Error adding data: ", e)
        }
        try {
            const followRef = await doc(firestore, 'users', data.id)
            const docSnap = await getDoc(followRef)
            console.log("DOC SNAP: ", docSnap.data())
            if (docSnap.data().followers) {
                setDoc(followRef, { followers: docSnap.data().followers + 1 }, { merge: true })
            } else {
                setDoc(followRef, { followers: 1 }, { merge: true })
            }
        } catch (e) {
            console.log("Incrementing Follower Count Error: ", e)
        }

        try {

            const followRef = await doc(collection(firestore, 'followings'))
            const item = {
                user: userData.id,
                followedBy: data.id,
                timestamp: new Date()
            }

            await setDoc(followRef, item)
            console.log("User Followed was saved")
        } catch (e) {
            console.log("Error adding data: ", e)
        }

    }

}

const save = async ({ userData, data, id }) => {

    if (data.id == userData.id) {
        alert("Oops! You made this post");
    } else {
        try {

            const saveRef = await doc(collection(firestore, 'saved'))
            const item = {
                saver: userData.id,
                poster: data.id,
                post: id
            }

            await setDoc(saveRef, item)
            console.log("Ref was saved")
        } catch (e) {
            console.log("Error adding data: ", e)
        }

        const uPostRef = await doc(firestore, 'users', userData.id, 'saved', id)

        await setDoc(uPostRef, data)
    }

}

const unsave = async ({ userData, data, id }) => {

    if (data.id == userData.id) {
        alert("Oops! You made this post");
    } else {
        try {

            const uSaveRef = await doc(firestore, 'users', userData.id, 'saved', id)
            await deleteDoc(uSaveRef)
            console.log("Ref was deleted")
        } catch (e) {
            console.log("Error adding data: ", e)
        }

        const saveRef = await doc(firestore, 'saved', id)
        await deleteDoc(saveRef)
    }

}

const like = async ({ userData, data, id }) => {
    try {
        const likeRef = await doc(firestore, 'posts', id)
        const docSnap = await getDoc(likeRef)
        console.log("DOC SNAP: ", docSnap.data())
        if (docSnap.data().likeCount) {
            setDoc(likeRef, { likeCount: docSnap.data().likeCount + 1 }, { merge: true })
        } else {
            setDoc(likeRef, { likeCount: 1 }, { merge: true })
        }




    } catch (e) {
        console.log("Error adding data: ", e)
    }

    const uPostRef = await doc(firestore, 'users', userData.id, 'liked', id)

    await setDoc(uPostRef, data)

}

const unLike = async ({ userData, data, id }) => {
    try {
        const likeRef = await doc(firestore, 'posts', id)
        const docSnap = await getDoc(likeRef)
        console.log("DOC SNAP: ", docSnap.data())

        if (docSnap.data().likeCount) {
            setDoc(likeRef, { likeCount: docSnap.data().likeCount - 1 }, { merge: true })
        } else {
            setDoc(likeRef, { likeCount: 0 }, { merge: true })
        }





    } catch (e) {
        console.log("Error adding data: ", e)
    }

    const uPostRef = await doc(firestore, 'users', userData.id, 'liked', id)

    await deleteDoc(uPostRef, data)
    console.log("Ref was deleted")

}

const unfollow = async ({ userData, data }) => {

    try {

        const followRef = await doc(firestore, 'users', userData.id, 'following', data.id)
        await deleteDoc(followRef)
        console.log("Deleted Follower: ", followRef.id)
        //   navigation.goBack()
    } catch (e) {
        console.log("Error adding data: ", e)
    }

    try {
        const followRef = await doc(firestore, 'users', data.id)
        const docSnap = await getDoc(followRef)
        console.log("DOC SNAP: ", docSnap.data())
        if (docSnap.data().followers) {
            setDoc(followRef, { followers: docSnap.data().followers - 1 }, { merge: true })
        } else {
            setDoc(followRef, { followers: 1 }, { merge: true })
        }
    } catch (e) {
        console.log("Decrementing Follower Count Error: ", e)
    }

    try {

        const followRef = await doc(collection(firestore, 'followings'))

        await deleteDoc(followRef)
        console.log("User Followed was saved")
    } catch (e) {
        console.log("Error deleting data: ", e)
    }

}

const sendMessage = async ({ userData, newData, conversation, data }) => {
    try {
 
        if(conversation.length > 2){
            const messageRef = await doc(collection(firestore, 'messages', conversation, 'text'))
            await setDoc(messageRef, newData)

            const uMessageRef = await doc(collection(firestore, 'users', userData.id, 'messages', data.id, 'text'))
            await setDoc(uMessageRef, {...newData, ...{conversationId: conversation}})

            const oMessageRef = await doc(collection(firestore, 'users', data.id, 'messages', userData.id, 'text'))
            await setDoc(oMessageRef, {...newData, ...{conversationId: conversation}})

            return conversation
        }else{
            const messageRef = await doc(collection(firestore, 'messages'))
            await setDoc(doc(collection(messageRef, "text")), newData)

            const uMessageRef = await doc(collection(firestore, 'users', userData.id, 'messages', data.id, 'text'))
            await setDoc(uMessageRef, {...newData, ...{conversationId: messageRef.id}})

            const oMessageRef = await doc(collection(firestore, 'users', data.id, 'messages', userData.id, 'text'))
            await setDoc(oMessageRef, {...newData, ...{conversationId: messageRef.id}})

            return messageRef.id
        }
        
     
    } catch (e) {
        console.log("Error when adding Message: ", e)
    }

}

const addPost = async ({ userData, data }) => {
    const postRef = await doc(collection(firestore, 'posts'))
    // onVal(postRef, (snapshot) => {
    //     const data = snapshot.val()
    //     console.log("Data Snapshot: ", data)
    // })
    await setDoc(postRef, data)

    const uPostRef = await doc(collection(firestore, 'users', userData.id, 'posts'))
    await setDoc(uPostRef, data)
}

const getUser = async ({ data }) => {
    const currentUserRef = doc(firestore, "users", data.id)
    const docSnap = await getDoc(currentUserRef)
    let user = {}
    if (docSnap.exists()) {
        // console.log("Document Data: ", docSnap.data())
        return docSnap.data()

    } else {
        return "No such document"
    }
}

export { follow, unfollow, addPost, getUser, save, unsave, like, unLike, sendMessage }