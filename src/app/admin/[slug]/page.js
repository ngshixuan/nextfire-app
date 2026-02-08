'use client'

import AuthCheck from "@/components/AuthCheck"
import { auth, db } from "@/lib/firebase/firebase-config"
import { doc, serverTimestamp, updateDoc } from "firebase/firestore"
import { useParams, useRouter } from "next/navigation" // useParams is needed for slug
import { useState } from "react"
import { useDocumentDataOnce } from "react-firebase-hooks/firestore"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import ReactMarkdown from "react-markdown"

export default function AdminPostEdit() {
    return (
        <AuthCheck>
            <PostManager />
        </AuthCheck>
    )
}

function PostManager() {
    const [preview, setPreview] = useState(false)

    // useParams to get the slug from the URL
    const params = useParams()
    const { slug } = params

    // Correctly create a document reference
    // Note: ensure users can only edit their own posts
    const postRef = doc(db, 'users', auth.currentUser.uid, 'posts', slug)

    // useDocumentDataOnce expects a document reference
    const [post] = useDocumentDataOnce(postRef)

    return (
        <main>
            {post && (
                <>
                    <section>
                        <h1>{post.title}</h1>
                        <p>ID: {post.slug}</p>

                        <PostForm postRef={postRef} defaultValues={post} preview={preview} />
                    </section>

                    <aside>
                        <h3>Tools</h3>
                        <button onClick={() => setPreview(!preview)}>
                            {preview ? 'Edit' : 'Preview'}
                        </button>
                        <button className="btn-blue">
                            <a href={`/${post.username}/${post.slug}`}>Live Link</a>
                        </button>
                    </aside>
                </>
            )}
        </main>
    )
}

function PostForm({ defaultValues, postRef, preview }) {
    const { register, handleSubmit, reset, watch, formState } = useForm({ defaultValues, mode: 'onChange' })
    const { isValid, isDirty } = formState;

    const updatePost = async ({ content, published }) => {
        await updateDoc(postRef, {
            content,
            published,
            updatedAt: serverTimestamp()
        })

        reset({ content, published })
        toast.success('Post updated successfully!')
    }

    return (
        <form onSubmit={handleSubmit(updatePost)}>
            {preview && (
                <div className="card">
                    <ReactMarkdown>{watch('content')}</ReactMarkdown>
                </div>
            )}

            <div className={preview ? 'hidden' : 'controls'}>

                <textarea
                    {...register('content', {
                        maxLength: { value: 20000, message: 'content is too long' },
                        minLength: { value: 10, message: 'content is too short' },
                        required: { value: true, message: 'content is required' }
                    })}
                ></textarea>

                {formState.errors.content && <p className="text-danger">{formState.errors.content.message}</p>}

                <fieldset>
                    <input
                        className="checkbox"
                        type="checkbox"
                        {...register('published')}
                    />
                    <label>Published</label>
                </fieldset>

                <button type="submit" className="btn-green" disabled={!isDirty || !isValid}>
                    Save Changes
                </button>
            </div>
        </form>
    )
}