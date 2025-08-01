'use client'

import { useState } from 'react'

interface LoginForm {
  username: string
  password: string
}

export default function LoginPage() {
  const [form, setForm] = useState<LoginForm>({ username: '', password: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      const text = await res.text()
      const data = text ? JSON.parse(text) : {}

      if (!res.ok) throw new Error(data.error || 'Login failed')

      alert('Login successful!')
    } catch (err: any) {
      alert(err.message || 'Something went wrong')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-center text-blue-600">Login</h2>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          className="border border-gray-300 p-2 w-full rounded placeholder-gray-700 text-gray-900"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="border border-gray-300 p-2 w-full rounded placeholder-gray-700 text-gray-900"
        />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Login
        </button>
      </form>
    </div>
  )
}
