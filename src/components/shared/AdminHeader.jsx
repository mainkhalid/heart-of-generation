import React from 'react'
import { UserButton, useUser } from '@clerk/clerk-react'

export const AdminHeader = () => {
  const { user, isLoaded } = useUser()

  if (!isLoaded) {
    return (
      <div className="bg-red-600 text-white">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold">Heart of Generation Foundation</h1>
          <span className="text-sm opacity-80">Loading...</span>
        </div>
      </div>
    )
  }

  const username =
    user?.username ||
    user?.firstName ||
    user?.fullName ||
    user?.primaryEmailAddress?.emailAddress ||
    'User'

  const role =
    user?.publicMetadata?.role || user?.privateMetadata?.role || 'User'

  return (
    <div className="bg-red-600 text-white">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold">Heart of Generation Foundation</h1>
          {role && (
            <span className="bg-red-500 text-xs px-2 py-1 rounded">
              {role}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <span>Welcome, {username}</span>
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'w-8 h-8',
              },
            }}
            afterSignOutUrl="/admin"
          />
        </div>
      </div>
    </div>
  )
}
