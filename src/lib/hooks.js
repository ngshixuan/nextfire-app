import { useAuthState } from 'react-firebase-hooks/auth'
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase/firebase-config";
import { doc, onSnapshot } from "firebase/firestore";

export function useUserData() {
    const [user] = useAuthState(auth);
    const [username, setUsername] = useState(null)

    useEffect(() => {
        let unsubscribe;

        if (user) {
            const ref = doc(db, 'users', user.uid);
            unsubscribe = onSnapshot(ref, (doc) => {
                setUsername(doc.data()?.username)
            })
        }
        else {
            setUsername(null)
        }

        return unsubscribe

    }, [user])

    return { user, username }
}