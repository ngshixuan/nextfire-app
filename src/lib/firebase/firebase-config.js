// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, limit } from "firebase/firestore";
import { getStorage } from "firebase/storage"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB3BH0aMCv-DcelJjO7D-l0kxfHTl2UdBg",
    authDomain: "nextfire-34bc4.firebaseapp.com",
    projectId: "nextfire-34bc4",
    storageBucket: "nextfire-34bc4.firebasestorage.app",
    messagingSenderId: "864155977788",
    appId: "1:864155977788:web:19c15e9b49e932c97e9b39"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();

export const db = getFirestore(app);
export const storage = getStorage()


export async function getUserWithUsername(username) {
    const q = query(
        collection(db, 'users'),
        where('username', '==', username),
        limit(1)
    );
    const userDoc = (await getDocs(q)).docs[0];
    return userDoc;
}

export function postToJSON(doc) {
    const data = doc.data();
    return {
        ...data,
        createdAt: data.createdAt.toMillis(),
        updatedAt: data.updatedAt.toMillis()
    }
}