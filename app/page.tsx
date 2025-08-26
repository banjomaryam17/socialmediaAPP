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
  user_id: number
  username: string
  avatar_url?: string
  like_count: number
  is_following: boolean
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [postText, setPostText] = useState('')
  const [posts, setPosts] = useState<Post[]>([])
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('connectify_user')
    if (storedUser) setUser(JSON.parse(storedUser))
  }, [])

  useEffect(() => {
    if (user) fetchPosts()
  }, [user])

  const fetchPosts = async () => {
    try {
      const res = await fetch(`/api/posts?viewer_id=${user?.id}`)
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

  const handleFollowToggle = async (targetUserId: number, currentlyFollowing: boolean) => {
    if (!user) return
    try {
      const route = currentlyFollowing ? 'unfollow' : 'follow'
      const res = await fetch(`/api/users/${targetUserId}/${route}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      })
  
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Follow/unfollow failed')
  
      // ✅ REFRESH POSTS TO GET UPDATED FOLLOWING STATUS
      await fetchPosts()
    } catch (err) {
      console.error('❌ Follow/unfollow error:', err)
    }
  }
  

  const toggleMenu = (postId: number) => {
    setMenuOpenId(menuOpenId === postId ? null : postId)
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
        {user ? (
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-1 rounded-full text-sm hover:bg-red-600"
          >
            Logout
          </button>
        ) : (
          <div className="flex gap-3">
            <a
              href="/login"
              className="bg-white border border-blue-600 text-blue-600 px-4 py-1 rounded-full text-sm hover:bg-blue-50"
            >
              Login
            </a>
            <a
              href="/signup"
              className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm hover:bg-blue-700"
            >
              Signup
            </a>
          </div>
        )}
      </header>

      <main className="flex justify-center mt-10 px-4">
        <div className="w-full max-w-xl bg-white p-6 rounded-2xl shadow-lg space-y-6">
          {user && (
            <>
              <div className="flex items-center space-x-4">
                <img
                  src={user.avatarUrl}
                  alt="avatar"
                  className="w-12 h-12 rounded-full border shadow-sm"
                />
                <h2 className="text-lg font-semibold text-gray-700">
                  Welcome, <span className="text-blue-600">{user.username}</span>
                </h2>
              </div>

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
            </>
          )}

          {/* Posts */}
          {posts.length === 0 ? (
            <p className="text-center text-sm text-gray-500">No posts yet.</p>
          ) : (
            posts.map((post) => (
              
              <div key={post.id} className="border rounded-lg p-4 shadow-sm relative space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={post.avatar_url}
                      alt="avatar"
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-sm font-medium text-gray-700">{post.username}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(post.created_at).toLocaleString()}
                    </span>
                  </div>

                  {user && user.id !== post.user_id && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleFollowToggle(post.user_id, post.is_following)}
                        className={`text-sm px-3 py-1 rounded-full ${
                          post.is_following
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {post.is_following ? 'Following' : 'Follow'}
                      </button>

                      {/* Meatball menu */}
                      <div className="relative">
                        <button
                          onClick={() => toggleMenu(post.id)}
                          className="text-gray-500 hover:text-gray-800 text-xl"
                        >
                          ⋯
                        </button>
                        {menuOpenId === post.id && (
                          <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow z-10">
                            <button
                              onClick={() => handleFollowToggle(post.user_id, true)}
                              className="block w-full px-4 py-2 text-sm hover:bg-gray-100"
                            >
                              Unfollow
                            </button>
                            <button className="block w-full px-4 py-2 text-sm hover:bg-gray-100">
                              Block
                            </button>
                            <button className="block w-full px-4 py-2 text-sm hover:bg-gray-100">
                              Report
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-gray-800">{post.text}</p>

                <div className="text-sm">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="text-gray-700 hover:text-blue-600"
                  >
                    ❤️ {post.like_count}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
