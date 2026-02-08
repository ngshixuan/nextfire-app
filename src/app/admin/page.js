'use client';
import AuthCheck from "@/components/AuthCheck"
import PostFeed from "@/components/PostFeed"
import { UserContext } from "@/lib/context"
import { auth, db } from "@/lib/firebase/firebase-config"
import { collection, doc, orderBy, query, serverTimestamp, setDoc } from "firebase/firestore"
import kebabCase from "lodash.kebabcase"
import { useRouter } from "next/navigation"
import { useContext, useState } from "react"
import { useCollection } from 'react-firebase-hooks/firestore';
import toast from "react-hot-toast"


export default function AdminPostsPage() {
    return (
        <main>
            <AuthCheck>
                <PostLists />
                <CreateNewPost />
            </AuthCheck>
        </main>
    )
}

function PostLists() {
    const ref = collection(db, 'users', auth.currentUser.uid, 'posts')
    const postQuery = query(ref, orderBy('createdAt'))
    const [querySnapshot] = useCollection(postQuery)

    const posts = querySnapshot?.docs.map((doc) => doc.data())

    return (
        <>
            <h1>Manage your Posts</h1>
            <PostFeed posts={posts} admin />
        </>
    )
}

function CreateNewPost() {
    const router = useRouter()
    const { username } = useContext(UserContext)
    const [title, setTitle] = useState('')

    // Verify slug is URL safe
    const slug = encodeURI(kebabCase(title))

    // Validate length
    const isValid = title.length > 3 && title.length < 100;

    const createPost = async (e) => {
        e.preventDefault();
        const uid = auth.currentUser.uid;
        const ref = doc(db, 'users', uid, 'posts', slug)

        // Tip: give all fields a default value here
        const data = {
            title,
            slug,
            uid,
            username,
            published: false,
            content: '# hello world!',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            heartcount: 0,
        }

        await setDoc(ref, data);

        toast.success('Post created!')

        // Imperative navigation after doc is set
        router.push(`/admin/${slug}`)

    }

    return (
        <form onSubmit={createPost}>
            <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Awesome Article!"

            />
            <p>
                <strong>Slug:</strong> {slug}
            </p>
            <button type="submit" disabled={!isValid} className="btn-green">
                Create New Post
            </button>
        </form>
    );

}