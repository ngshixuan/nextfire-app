'use client'

import { UserContext } from "@/lib/context";
import { auth, db, googleAuthProvider } from "@/lib/firebase/firebase-config";
import { signInWithPopup, signOut } from "firebase/auth";
import { collection, doc, getDoc, writeBatch } from "firebase/firestore";
import debounce from "lodash.debounce";
import { useCallback, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

const EnterPage = () => {
    const { user, username } = useContext(UserContext);

    const SignInButton = () => {
        const signInWithGoogle = async () => {
            await signInWithPopup(auth, googleAuthProvider);
        }

        return (
            <button className="btn-google" onClick={signInWithGoogle}>
                Sign in with Google
            </button>
        )
    }

    const SignOutButton = () => {
        return <button onClick={() => signOut(auth)}>Sign Out</button>
    }

    const UsernameForm = () => {
        const [formValue, setFormValue] = useState('');
        const [isValid, setIsValid] = useState(false);
        const [loading, setLoading] = useState(false);

        const { user, username } = useContext(UserContext);

        const onChange = (e) => {
            const val = e.target.value.toLowerCase();
            const re = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/;

            // Only set form value if length is < 3 OR it passes regex
            if (val.length < 3) {
                setFormValue(val);
                setLoading(false);
                setIsValid(false);
            }

            if (re.test(val)) {
                setFormValue(val);
                setLoading(true);
                setIsValid(false);
            }
        }

        useEffect(() => {
            checkUsername(formValue);
        }, [formValue]);

        const checkUsername = useCallback(
            debounce(async (username) => {
                if (username.length >= 3) {
                    //const ref = doc(firestore, `usernames/${username}`);
                    const ref = doc(collection(db, 'usernames'), username);
                    const snap = await getDoc(ref);
                    console.log('Firestore read executed!', snap.exists());
                    setIsValid(!snap.exists());
                    setLoading(false);
                }
            }, 500), [])

        const onSubmit = async (e) => {
            e.preventDefault();

            const userDoc = doc(collection(db, 'users'), user.uid);
            const usernameDoc = doc(collection(db, 'usernames'), formValue);

            try {
                const myBatch = writeBatch(db)
                myBatch.set(userDoc, { username: formValue, photoURL: user.photoURL, displayName: user.displayName })
                myBatch.set(usernameDoc, { uid: user.uid })

                await myBatch.commit()
                toast.success('Username created!')
            } catch (error) {
                toast.error('Failed to create username: ' + error.message)
                console.error('Batch write failed:', error);
            }
        }

        return (
            !username && (
                <section>
                    <h3>Choose Username</h3>
                    <form onSubmit={onSubmit}>
                        <input name="username" placeholder="username" value={formValue} onChange={onChange} />

                        <UsernameMessage username={formValue} isValid={isValid} loading={loading} />

                        <button type="submit" className="btn-green" disabled={!isValid}>
                            Choose
                        </button>

                        <h3>Debug State</h3>
                        <div>
                            Username: {formValue}
                            <br />
                            Loading: {loading.toString()}
                            <br />
                            Username Valid: {isValid.toString()}
                        </div>
                    </form>
                </section>
            )
        )
    }

    function UsernameMessage({ username, isValid, loading }) {
        if (loading) {
            return <p>Checking...</p>;
        } else if (isValid) {
            return <p className="text-success">{username} is available!</p>;
        } else if (username && !isValid) {
            return <p className="text-danger">That username is taken!</p>;
        } else {
            return <p></p>;
        }
    }

    return (
        <main>
            {user ? !username ? <UsernameForm /> : <SignOutButton /> : <SignInButton />}
        </main>
    )
}

export default EnterPage