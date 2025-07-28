'use client'

import { useState } from 'react'

interface SignupForm {
  username: string
  password: string
  firstName: string
  lastName: string
  avatarUrl: string
}

export default function SignupPage() {
  const [form, setForm] = useState<SignupForm>({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    avatarUrl: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
  
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
  
      const text = await res.text()
      const data = text ? JSON.parse(text) : {}
  
      console.log('🔍 Response status:', res.status)
      console.log('🧾 Response body:', data)
  
      if (!res.ok) throw new Error(data.error || 'Signup failed')
  
      alert('Signup successful!')
    } catch (err: any) {
      console.error('❌ Signup error:', err)
      alert(err.message || 'Something went wrong')
    }
  }
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-center text-blue-600">Create an Account</h2>
        {['username', 'password', 'firstName', 'lastName', 'avatarUrl'].map((field) => (
          <input
            key={field}
            type={field === 'password' ? 'password' : 'text'}
            name={field}
            placeholder={field}
            value={(form as any)[field]}
            onChange={handleChange}
            className="border border-gray-300 p-2 w-full rounded placeholder-gray-700 text-gray-900"
          />
        ))}
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Sign Up
        </button>
      </form>
    </div>
  )
}
