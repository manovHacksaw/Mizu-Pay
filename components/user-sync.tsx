'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'

export default function UserSync() {
  const { user, isLoaded } = useUser()
  const [synced, setSynced] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    if (isLoaded && user && !synced && !isSyncing) {
      console.log('User detected, starting sync process...')
      syncUser()
    }
  }, [user, isLoaded, synced, isSyncing])

  const syncUser = async () => {
    if (isSyncing) return // Prevent multiple sync attempts
    
    setIsSyncing(true)
    console.log('Syncing user to database...', {
      userId: user?.id,
      email: user?.emailAddresses[0]?.emailAddress,
      name: user?.firstName || user?.lastName
    })

    try {
      const response = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user?.emailAddresses[0]?.emailAddress,
          name: user?.firstName || user?.lastName || user?.emailAddresses[0]?.emailAddress?.split('@')[0]
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ User synced successfully:', result)
        setSynced(true)
      } else {
        const errorData = await response.json()
        console.error('❌ Failed to sync user:', errorData)
        // Retry after a delay
        setTimeout(() => {
          setIsSyncing(false)
        }, 2000)
      }
    } catch (error) {
      console.error('❌ Error syncing user:', error)
      // Retry after a delay
      setTimeout(() => {
        setIsSyncing(false)
      }, 2000)
    } finally {
      setIsSyncing(false)
    }
  }

  // This component doesn't render anything, it just handles the sync
  return null
}
