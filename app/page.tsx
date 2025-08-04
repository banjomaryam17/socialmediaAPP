// app/page.tsx

'use client'

import { useEffect, useState } from 'react'

interface User {
  username: string
  avatar_url: string
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Simulate logged-in user fetch
    const storedUser = localStorage.getItem('connectify_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    } else {
      window.location.href = '/login' // redirect if not logged in
    }
  }, [])

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow-md p-6 space-y-4">
        <div className="flex items-center gap-4">
          <img src={user.avatar_url} alt="avatar" className="w-12 h-12 rounded-full" />
          <h1 className="text-xl font-semibold">Welcome, {user.username} 👋</h1>
        </div>

        {/* Placeholder: New post form */}
        <form className="space-y-2">
          <textarea placeholder="What's on your mind?" className="w-full border p-2 rounded" />
          <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
            Post
          </button>
        </form>

        {/* Placeholder: Feed */}
        <div className="border-t pt-4">
          <p className="text-gray-600 text-sm">No posts yet.</p>
        </div>
      </div>
    </div>
  )
}
