'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect } from 'react'

export default function UserSync() {
  const { user, isLoaded } = useUser()

  useEffect(() => {
    console.log('UserSync useEffect triggered:', { isLoaded, user: !!user })
    if (isLoaded && user) {
      console.log('UserSync: Starting sync for user:', user.id)
      // Sync user data to database
      syncUserToDatabase()
    }
  }, [user, isLoaded])

  const syncUserToDatabase = async () => {
    try {
      console.log('Syncing user to database:', {
        email: user?.emailAddresses[0]?.emailAddress,
        name: user?.fullName,
        id: user?.id
      })

      const response = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user?.emailAddresses[0]?.emailAddress,
          name: user?.fullName,
        }),
      })

      const data = await response.json()
      console.log('User sync response:', data)

      if (!response.ok) {
        console.error('Failed to sync user data:', data)
      } else {
        console.log('User synced successfully:', data)
      }
    } catch (error) {
      console.error('Error syncing user data:', error)
    }
  }

  return null // This component doesn't render anything
}