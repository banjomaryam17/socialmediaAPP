'use client'
import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { avatarUrlFor } from '@/lib/avatar'

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
  comment_count: number
  is_liked: boolean  
  is_following: boolean
}

interface Comment {
  id: number
  text: string
  created_at: string
  username: string
  avatar_url?: string
}
interface SearchUser {
  id: number
  username: string
  avatar_url?: string
  is_following: boolean
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [postText, setPostText] = useState('')
  const [posts, setPosts] = useState<Post[]>([])
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  // Comments state (per post)
  const [openCommentsId, setOpenCommentsId] = useState<number | null>(null)
  const [comments, setComments] = useState<Record<number, Comment[]>>({})
  const [newCommentByPost, setNewCommentByPost] = useState<Record<number, string>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchUser[]>([])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchResults([]) // Close the dropdown
      }
    }
  
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

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

  // ------- Comments helpers -------
  const toggleComments = async (postId: number) => {
    setOpenCommentsId(prev => (prev === postId ? null : postId))
    // lazy-load comments on first open
    if (!comments[postId]) {
      await fetchComments(postId)
    }
  }

  const fetchComments = async (postId: number) => {
    try {
      const res = await fetch(`/api/posts/${postId}/comments`)
      const data = await res.json()
      if (res.ok) {
        setComments(prev => ({ ...prev, [postId]: data.comments }))
      }
    } catch (err) {
      console.error('❌ Fetch comments error:', err)
    }
  }

  const handleAddComment = async (postId: number) => {
    if (!user) return
    const text = (newCommentByPost[postId] || '').trim()
    if (!text) return

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, text })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add comment')

      // clear input & refresh that post's comments + posts (to update count)
      setNewCommentByPost(prev => ({ ...prev, [postId]: '' }))
      await fetchComments(postId)
      await fetchPosts()
    } catch (err) {
      console.error('❌ Comment error:', err)
    }
  }

  const toggleMenu = (postId: number) => {
    setMenuOpenId(menuOpenId === postId ? null : postId)
  }

  const handleLogout = () => {
    localStorage.removeItem('connectify_user')
    window.location.href = '/login'
  }
  const handleBlockUser = async (targetUserId: number) => {
    if (!user) return
    try {
      const res = await fetch(`/api/users/${targetUserId}/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      })
      if (res.ok) {
        alert('User blocked successfully')
        fetchPosts() // Refresh to hide their posts
      }
    } catch (err) {
      console.error('Block error:', err)
    }
  }
  
  const handleReportPost = async (postId: number) => {
    if (!user) return
    const reason = prompt('Why are you reporting this post?')
    if (!reason) return
    
    try {
      const res = await fetch(`/api/posts/${postId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, reason })
      })
      if (res.ok) {
        alert('Post reported successfully')
      }
    } catch (err) {
      console.error('Report error:', err)
    }
  }
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 text-gray-800">
      {/* Header */}
      <header className="bg-white shadow-md px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
  {/* Logo */}
  <div className="flex justify-between items-center w-full md:w-auto">
    <h1 className="text-2xl font-bold text-blue-600">Connectify</h1>
    
    {/* Mobile Logout/Links */}
    {!user ? (
      <div className="md:hidden flex items-center gap-2">
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
    ) : (
      <button
        onClick={handleLogout}
        className="md:hidden bg-red-500 text-white px-4 py-1 rounded-full text-sm hover:bg-red-600"
      >
        Logout
      </button>
    )}
  </div>

  {/* Search Bar */}
  {user && (
    <div className="relative w-full md:w-1/3" ref={searchRef}>
      <input
        type="text"
        placeholder="Search users..."
        value={searchQuery}
        onChange={async (e) => {
          const value = e.target.value
          setSearchQuery(value)
          if (value.length > 1) {
            const res = await fetch(`/api/users/search?q=${value}&viewer_id=${user.id}`)
            const data = await res.json()
            if (res.ok) setSearchResults(data.users)
          } else {
            setSearchResults([])
          }
        }}
        className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300"
      />

      {/* Search dropdown */}
      {searchResults.length > 0 && (
        <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {searchResults.map((u) => (
            <div
              key={u.id}
              className="flex justify-between items-center px-4 py-2 hover:bg-gray-50"
            >
              <div className="flex items-center space-x-2">
                <img
                  src={u.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.username)}`}
                  className="w-8 h-8 rounded-full"
                  alt="avatar"
                />
                <span className="text-sm text-gray-700">{u.username}</span>
              </div>
              <button
                onClick={() => {
                  handleFollowToggle(u.id, u.is_following)
                  setSearchResults([])
                }}
                className={`text-sm px-3 py-1 rounded-full ${
                  u.is_following
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                }`}
              >
                {u.is_following ? 'Unfollow' : 'Follow'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )}

  {/* Navigation */}
  <div className="hidden md:flex items-center gap-3">
    {user && (
      <>
        <button
          onClick={() => window.location.href = '/following'}
          className="bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm hover:bg-blue-200 transition"
        >
          Following
        </button>

        <button
          onClick={() => window.location.href = '/users'}
          className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm hover:bg-green-200 transition"
        >
          All Users
        </button>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-full text-sm hover:bg-red-600 transition"
        >
          Logout
        </button>
      </>
    )}
  </div>
</header>

      <main className="flex justify-center mt-10 px-4">
        <div className="w-full max-w-xl bg-white p-6 rounded-2xl shadow-lg space-y-6">
          {user && (
            <>
              <div className="flex items-center space-x-4">
                <Image
                  src={user?.avatarUrl || avatarUrlFor(user?.username || 'User', 48)}
                  alt="avatar"
                  width={48}
                  height={48}
                  className="rounded-full border shadow-sm"
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
              <div key={post.id} className="border rounded-lg p-4 shadow-sm relative space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Image
                      src={post.avatar_url || avatarUrlFor(post.username, 32)}
                      alt={`${post.username} avatar`}
                      width={32}
                      height={32}
                      className="rounded-full"
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
      onClick={() => {
        handleBlockUser(post.user_id)
        setMenuOpenId(null)
      }}
      className="block w-full px-4 py-2 text-sm hover:bg-gray-100"
    >
      Block User
    </button>
    <button
      onClick={() => {
        handleReportPost(post.id)
        setMenuOpenId(null)
      }}
      className="block w-full px-4 py-2 text-sm hover:bg-gray-100"
    >
      Report Post
    </button>
  </div>
)}
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-gray-800">{post.text}</p>

                <div className="flex items-center gap-4 text-sm">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="text-gray-700 hover:text-blue-600"
                  >
                    ❤️ {post.like_count}
                  </button>

                  <button
                    onClick={() => toggleComments(post.id)}
                    className="text-gray-600 hover:text-blue-600"
                  >
                    💬 {post.comment_count} Comments
                  </button>
                </div>

                {/* Comments drawer */}
                {openCommentsId === post.id && (
                  <div className="mt-3 bg-gray-50 rounded-lg p-3 space-y-2">
                    {(comments[post.id] || []).map(c => (
                      <div key={c.id} className="flex items-start space-x-2 text-sm">
                        <Image
                          src={c.avatar_url || avatarUrlFor(c.username, 24)}
                          alt={`${c.username} avatar`}
                          width={24}
                          height={24}
                          className="rounded-full flex-shrink-0"
                        />
                        <div className="flex-1">
                          <span className="font-medium text-gray-700">{c.username}</span>
                          <span className="text-gray-600 ml-2">{c.text}</span>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(c.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}

                    {user && (
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <Image
                          src={user.avatarUrl || avatarUrlFor(user.username, 24)}
                          alt="Your avatar"
                          width={24}
                          height={24}
                          className="rounded-full flex-shrink-0"
                        />
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          value={newCommentByPost[post.id] || ''}
                          onChange={(e) =>
                            setNewCommentByPost(prev => ({ ...prev, [post.id]: e.target.value }))
                          }
                          className="flex-1 border rounded-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="bg-blue-600 text-white rounded-full px-4 py-2 text-sm hover:bg-blue-700 transition"
                        >
                          Post
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}