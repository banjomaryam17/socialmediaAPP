'use client'

import { useEffect, useState } from 'react'

interface User {
  id: number
  username: string
  avatarUrl?: string
}

interface Post {
  id: number
  text: string
  created_at: string
  username: string
  avatar_url?: string
  like_count: number
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [postText, setPostText] = useState('')
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    const storedUser = localStorage.getItem('connectify_user')
    if (storedUser) setUser(JSON.parse(storedUser))
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts')
      const data = await res.json()
      if (res.ok) setPosts(data.posts)
    } catch (err) {
      console.error('Failed to fetch posts:', err)
    }
  }

  const handlePost = async () => {
    if (!postText.trim() || !user) return

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, text: postText })
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to post')

      setPostText('')
      fetchPosts()
    } catch (err) {
      console.error('❌ Post error:', err)
      alert('Post failed!')
    }
  }

  const handleLike = async (postId: number) => {
    if (!user) return

    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Like failed')

      fetchPosts()
    } catch (err) {
      console.error('❌ Like error:', err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('connectify_user')
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 text-gray-800">
      {/* Header */}
      <header className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">Connectify</h1>
        {user && (
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:underline"
          >
            Logout
          </button>
        )}
      </header>

      {/* Main card */}
      <main className="flex justify-center mt-10">
        <div className="w-full max-w-xl bg-white p-6 rounded-2xl shadow-lg space-y-4">
          {user && (
            <div className="flex items-center space-x-4">
              <img
                src={user.avatarUrl || 'https://via.placeholder.com/40'}
                alt="avatar"
                className="w-12 h-12 rounded-full border shadow-sm"
              />
              <h2 className="text-lg font-semibold text-gray-700">
                Welcome, <span className="text-blue-600">{user.username}</span> 👋
              </h2>
            </div>
          )}

          {/* Post input */}
          <textarea
            placeholder="What's on your mind?"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
            rows={3}
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
          />
          <button
            onClick={handlePost}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Post
          </button>

          {/* Posts */}
          {posts.length === 0 ? (
            <p className="text-center text-sm text-gray-500">No posts yet.</p>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="border-t pt-4">
                <div className="flex items-center space-x-3 mb-2">
                  <img
                    src={post.avatar_url || 'https://via.placeholder.com/32'}
                    alt="avatar"
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {post.username}
                  </span>
                  <span className="text-xs text-gray-500 ml-auto">
                    {new Date(post.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-800">{post.text}</p>
                <button
                  onClick={() => handleLike(post.id)}
                  className="text-sm text-blue-500 mt-2 hover:underline"
                >
                  ❤️ Like ({post.like_count})
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
