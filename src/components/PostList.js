'use client';

import PostFeed from './PostFeed';
import Loader from './Loader';
import { db, postToJSON } from '@/lib/firebase/firebase-config';
import { collectionGroup, query, where, orderBy, limit, startAfter, getDocs, Timestamp } from 'firebase/firestore';
import { useState } from 'react';

const LIMIT = 1;

export default function PostList({ initialPosts }) {
    const [posts, setPosts] = useState(initialPosts);
    const [loading, setLoading] = useState(false);
    const [postsEnd, setPostsEnd] = useState(false);

    const getMorePosts = async () => {
        setLoading(true);
        const last = posts[posts.length - 1];

        const cursor = typeof last.createdAt === 'number'
            ? Timestamp.fromMillis(last.createdAt)
            : last.createdAt;

        const nextQuery = query(
            collectionGroup(db, 'posts'),
            where('published', '==', true),
            orderBy('createdAt', 'desc'),
            startAfter(cursor),
            limit(LIMIT)
        );

        const newDocs = await getDocs(nextQuery);
        const newPosts = newDocs.docs.map(postToJSON);

        setPosts((posts) => [...posts, ...newPosts]);
        setLoading(false);

        if (newDocs.empty || newDocs.docs.length < LIMIT) {
            setPostsEnd(true);
        }
    };

    return (
        <>
            <PostFeed posts={posts} />
            {!loading && !postsEnd && <button onClick={getMorePosts}>Load more</button>}

            <Loader show={loading} />

            {postsEnd && 'You have reached the end!'}
        </>
    );
}
