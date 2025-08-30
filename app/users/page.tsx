'use client'

import { useEffect, useState } from 'react'

interface User {
  id: number
  username: string
  avatar_url?: string
  follower_count: number
  following_count: number
  post_count: number
  is_following: boolean
}

interface ViewerUser {
  id: number
  username: string
  avatar_url?: string
}

export default function UsersPage() {
  const [viewer, setViewer] = useState<ViewerUser | null>(null)
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('connectify_user')
    if (stored) {
      const parsed = JSON.parse(stored) as ViewerUser
      setViewer(parsed)
      fetchUsers(parsed.id)
    }
  }, [])

  const fetchUsers = async (viewerId: number) => {
    try {
      const res = await fetch(`/api/users?viewer_id=${viewerId}`)
      const data = await res.json()
      if (res.ok) setUsers(data.users)
    } catch (err) {
      console.error('Failed to fetch users', err)
    }
  }

  const handleFollowToggle = async (targetUserId: number, isFollowing: boolean) => {
    if (!viewer) return

    try {
      const route = isFollowing ? 'unfollow' : 'follow'
      const res = await fetch(`/api/users/${targetUserId}/${route}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: viewer.id })
      })

      if (res.ok) fetchUsers(viewer.id)
    } catch (err) {
      console.error('⌐ Follow/Unfollow Error:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-blue-600 mb-6">All Users</h1>
      <div className="space-y-4">
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
            <div className="flex items-center space-x-3">
              <img
                src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}`}
                className="w-10 h-10 rounded-full"
                alt="avatar"
              />
              <div>
                <p className="font-semibold text-gray-800">{user.username}</p>
                <p className="text-sm text-gray-500">
                  {user.post_count} posts · {user.follower_count} followers · {user.following_count} following
                </p>
              </div>
            </div>
            {viewer?.id !== user.id && (
              <button
                onClick={() => handleFollowToggle(user.id, user.is_following)}
                className={`text-sm px-4 py-1 rounded-full ${
                  user.is_following
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                }`}
              >
                {user.is_following ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}