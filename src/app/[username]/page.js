import { notFound } from "next/navigation";
import { getUserWithUsername, postToJSON } from "@/lib/firebase/firebase-config";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import UserProfile from "@/components/UserProfile"; // Fixed import path - assuming it was default export? Original file had default import
import PostFeed from "@/components/PostFeed"; // Fixed import path

export default async function UserProfilePage({ params }) {
    const { username } = await params;

    const userDoc = await getUserWithUsername(username);

    if (!userDoc) {
        notFound();
    }

    const user = userDoc.data();
    const postsQuery = query(
        collection(userDoc.ref, 'posts'),
        where('published', '==', true),
        orderBy('createdAt', 'desc'),
        limit(5)
    );

    const postsSnapshot = await getDocs(postsQuery);
    const posts = postsSnapshot.docs.map(postToJSON);

    return (
        <main>
            <UserProfile user={user} />
            <PostFeed posts={posts} />
        </main>
    );
}