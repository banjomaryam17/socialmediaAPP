'use client'

import { useEffect, useState } from 'react'
import { saveAs } from 'file-saver'
import ExcelJS from 'exceljs'

interface User {
  id: number
  username: string
  avatar_url?: string
}

export default function FollowingPage() {
  const [user, setUser] = useState<User | null>(null)
  const [following, setFollowing] = useState<User[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('connectify_user')
    if (stored) {
      const parsed = JSON.parse(stored)
      setUser(parsed)
      fetchFollowing(parsed.id)
    }
  }, [])

  const fetchFollowing = async (userId: number) => {
    const res = await fetch(`/api/users/${userId}/following`)
    const data = await res.json()
    if (res.ok) setFollowing(data.following)
  }

  const exportToExcel = async (): Promise<void> => {
    try {
     
      const workbook: ExcelJS.Workbook = new ExcelJS.Workbook()
      const worksheet: ExcelJS.Worksheet = workbook.addWorksheet('Following')

    
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Username', key: 'username', width: 30 },
        { header: 'Avatar URL', key: 'avatar_url', width: 50 }
      ]
      following.forEach((user: User) => {
        worksheet.addRow({
          id: user.id,
          username: user.username,
          avatar_url: user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}`
        })
      })

      // Style the header row with full type safety
      const headerRow: ExcelJS.Row = worksheet.getRow(1)
      headerRow.font = { bold: true }
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6F3FF' }
      } satisfies ExcelJS.Fill

      // Generate buffer and save file
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      saveAs(blob, 'following_list.xlsx')
    } catch (error: unknown) {
      console.error('Error exporting to Excel:', error)
      alert('Failed to export to Excel. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">People You Follow</h1>

      {following.length === 0 ? (
       <p className="text-gray-500">You&apos;re not following anyone yet.</p>
      ) : (
        <div className="space-y-4">
          {following.map((user) => (
            <div key={user.id} className="flex items-center space-x-4 bg-white p-3 rounded shadow-sm">
              <img
                src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}`}
                alt="avatar"
                className="w-10 h-10 rounded-full border"
              />
              <span className="text-gray-700 font-medium">{user.username}</span>
            </div>
          ))}

          <button
            onClick={exportToExcel}
            className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Export to Excel
          </button>
        </div>
      )}
    </div>
  )
}