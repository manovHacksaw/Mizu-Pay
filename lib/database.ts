import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Web3Auth user sync functions
export async function syncWeb3AuthUser(userInfo: any, walletAddress?: string) {
  try {
    // Check if user exists by email
    let user = await prisma.user.findUnique({
      where: { email: userInfo.email }
    })

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: userInfo.email,
          name: userInfo.name || userInfo.email.split('@')[0],
        }
      })
    }

    // If wallet address is provided, create/update wallet
    if (walletAddress) {
      const existingWallet = await prisma.wallet.findUnique({
        where: { address: walletAddress }
      })

      if (!existingWallet) {
        await prisma.wallet.create({
          data: {
            address: walletAddress,
            userId: user.id,
            isPrimary: true, // First wallet is primary
          }
        })
      } else if (existingWallet.userId !== user.id) {
        // Wallet belongs to different user - this should not be allowed
        throw new Error('Wallet is already connected to another account')
      }
    }

    return user
  } catch (error) {
    console.error('Error syncing Web3Auth user:', error)
    throw error
  }
}

export async function getUserWallets(userId: string) {
  return await prisma.wallet.findMany({
    where: { userId },
    orderBy: { isPrimary: 'desc' }
  })
}

export async function addWalletToUser(userId: string, address: string, isPrimary: boolean = false) {
  return await prisma.wallet.create({
    data: {
      address,
      userId,
      isPrimary
    }
  })
}

export async function removeWalletFromUser(walletId: string) {
  return await prisma.wallet.delete({
    where: { id: walletId }
  })
}
