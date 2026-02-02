import PostContent from "@/components/PostContent";
import { db, getUserWithUsername, postToJSON } from "@/lib/firebase/firebase-config";
import { collectionGroup, doc, getDoc, getDocs } from "firebase/firestore";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
    const q = collectionGroup(db, 'posts');
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
        const { slug, username } = doc.data();
        return {
            username,
            slug,
        };
    });
}

export default async function PostPage({ params }) {
    const { username, slug } = await params;
    const userDoc = await getUserWithUsername(username);

    let post;
    let path;

    if (userDoc) {
        // Correct way to get subcollection ref in modular SDK is confusing without doc ref
        // userDoc is a QueryDocumentSnapshot. ref is a DocumentReference.
        // We can construct path manually or use subcollection
        // userRef -> collection('posts') -> doc(slug)
        const postRef = doc(db, userDoc.ref.path, 'posts', slug);
        const postSnap = await getDoc(postRef);

        if (postSnap.exists()) {
            post = postToJSON(postSnap);
            path = postRef.path;
        }
    }

    if (!post) {
        notFound();
    }

    return (
        <main>
            <section>
                <PostContent post={post} />
            </section>
            <aside>
                <p>
                    <strong>{post.heartCount || 0} 🤍</strong>
                </p>
            </aside>
        </main>
    )
}