import { db, postToJSON } from "@/lib/firebase/firebase-config";
import { collectionGroup, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import PostList from "@/components/PostList";

const LIMIT = 1;

export default async function Home() {
  const postsQuery = query(
    collectionGroup(db, 'posts'),
    where('published', '==', true),
    orderBy('createdAt', 'desc'),
    limit(LIMIT)
  );

  const postsSnapshot = await getDocs(postsQuery);
  const posts = postsSnapshot.docs.map(postToJSON);

  return (
    <main>
      <PostList initialPosts={posts} />
    </main>
  );
}

