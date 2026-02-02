import Link from "next/link"
import ReactMarkdown from 'react-markdown'

const PostContent = () => {
    const createdAt = typeof post?.createdAt === 'number' ? new Date(post, createdAt) : post.createdAt
    return (
        <div>
            <h1>{post?.title}</h1>
            <span className="text-sm">
                Written by{' '}
                <Link href={`/${post.username}`}>
                    <a className="text-info">@{post.username}</a>
                </Link>
            </span>
            <ReactMarkdown>{post?.content}</ReactMarkdown>
        </div>
    )
}

export default PostContent