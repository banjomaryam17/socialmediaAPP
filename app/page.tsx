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
      else console.error('Failed to load posts:', data.error)
    } catch (err) {
      console.error('❌ Fetch error:', err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('connectify_user')
    window.location.href = '/login'
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

      alert('Post successful!')
      setPostText('')
      fetchPosts()
    } catch (err) {
      console.error('❌ Post error:', err)
      alert('Post failed!')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 text-gray-800">
      {/* Header */}
      <header className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">Connectify</h1>
        {user && (
          <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">
            Logout
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex justify-center mt-10">
        <div className="w-full max-w-xl bg-white p-6 rounded-2xl shadow-lg space-y-4">
          {/* Welcome */}
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

          {/* Post box */}
          <textarea
            placeholder="What's on your mind?"
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
            rows={3}
          />
          <button
            onClick={handlePost}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Post
          </button>

          {/* Posts list */}
          <div className="pt-6 border-t space-y-4">
            {posts.length === 0 ? (
              <p className="text-sm text-center text-gray-500">No posts yet.</p>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="p-4 border rounded-lg shadow-sm bg-gray-50">
                  <div className="flex items-center mb-2 space-x-3">
                    <img
                      src={post.avatar_url || 'https://via.placeholder.com/32'}
                      alt="avatar"
                      className="w-8 h-8 rounded-full"
                    />
                    <p className="text-sm font-semibold text-gray-700">{post.username}</p>
                    <span className="text-xs text-gray-400">{new Date(post.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-gray-800">{post.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
