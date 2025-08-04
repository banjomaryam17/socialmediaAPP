'use client'

import { useEffect, useState } from 'react'

interface User {
  id: number
  username: string
  avatarUrl?: string
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('connectify_user')
    if (storedUser) setUser(JSON.parse(storedUser))
  }, [])

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
          {/* Welcome section */}
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
          />

          <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition">
            Post
          </button>

          <div className="text-center text-sm text-gray-500 pt-4 border-t">
            No posts yet.
          </div>
        </div>
      </main>
    </div>
  )
}
