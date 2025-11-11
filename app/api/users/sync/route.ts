import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { privyUserId, email, wallets, activeWalletAddress } = body;

    if (!privyUserId) {
      return NextResponse.json({ error: "Missing privyUserId" }, { status: 400 });
    }

    // Find or create user by email (or create without email if not provided)
    let user = email 
      ? await prisma.user.findUnique({ where: { email } })
      : null;

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: email || null,
        },
      });
    } else if (email && user.email !== email) {
      // Update email if it changed
      user = await prisma.user.update({
        where: { id: user.id },
        data: { email },
      });
    }

    // Sync wallets
    const syncedWallets: string[] = [];
    let activeWalletId: string | null = null;

    if (wallets && Array.isArray(wallets)) {
      // Find existing embedded wallet for this user (if any)
      // Only one embedded wallet per user is allowed
      const existingEmbeddedWallet = await prisma.wallet.findFirst({
        where: {
          userId: user.id,
          type: 'embedded',
        },
      });

      // Find the embedded wallet from the wallets array
      // WalletData objects have { address, type } format
      const embeddedWalletData = wallets.find(w => w.type === 'embedded' && w.address);

      // Handle embedded wallet separately - only one per user
      if (embeddedWalletData?.address) {
        const embeddedAddress = embeddedWalletData.address;
        
        if (existingEmbeddedWallet) {
          // User already has an embedded wallet
          if (existingEmbeddedWallet.address.toLowerCase() !== embeddedAddress.toLowerCase()) {
            // Address changed - check if new address already exists
            const walletWithNewAddress = await prisma.wallet.findUnique({
              where: { address: embeddedAddress },
            });

            if (walletWithNewAddress) {
              // Wallet with new address exists - link it to user and delete old one
              if (!walletWithNewAddress.userId) {
                await prisma.wallet.update({
                  where: { id: walletWithNewAddress.id },
                  data: { userId: user.id, type: 'embedded' },
                });
              }
              // Delete the old embedded wallet (only if it has no payments/sessions)
              await prisma.wallet.delete({
                where: { id: existingEmbeddedWallet.id },
              }).catch(() => {
                // If deletion fails (due to foreign key constraints), just unlink it
                prisma.wallet.update({
                  where: { id: existingEmbeddedWallet.id },
                  data: { userId: null },
                });
              });
              syncedWallets.push(walletWithNewAddress.id);
              if (activeWalletAddress && embeddedAddress.toLowerCase() === activeWalletAddress.toLowerCase()) {
                activeWalletId = walletWithNewAddress.id;
              }
            } else {
              // Update existing wallet's address
              const updatedWallet = await prisma.wallet.update({
                where: { id: existingEmbeddedWallet.id },
                data: { address: embeddedAddress },
              });
              syncedWallets.push(updatedWallet.id);
              if (activeWalletAddress && embeddedAddress.toLowerCase() === activeWalletAddress.toLowerCase()) {
                activeWalletId = updatedWallet.id;
              }
            }
          } else {
            // Same address - use existing wallet
            syncedWallets.push(existingEmbeddedWallet.id);
            if (activeWalletAddress && embeddedAddress.toLowerCase() === activeWalletAddress.toLowerCase()) {
              activeWalletId = existingEmbeddedWallet.id;
            }
          }
        } else {
          // First embedded wallet - create it
          let wallet = await prisma.wallet.findUnique({
            where: { address: embeddedAddress },
          });

          if (wallet) {
            // Wallet exists but not linked to user - link it
            wallet = await prisma.wallet.update({
              where: { id: wallet.id },
              data: {
                userId: user.id,
                type: 'embedded',
              },
            });
          } else {
            // Create new embedded wallet
            wallet = await prisma.wallet.create({
              data: {
                address: embeddedAddress,
                type: 'embedded',
                userId: user.id,
              },
            });
          }
          syncedWallets.push(wallet.id);
          if (activeWalletAddress && embeddedAddress.toLowerCase() === activeWalletAddress.toLowerCase()) {
            activeWalletId = wallet.id;
          }
        }
      }

      // Handle external wallets
      for (const walletData of wallets) {
        const { address, type } = walletData;
        
        if (!address || !type) {
          continue;
        }

        // Skip embedded wallets (already handled above)
        if (type === 'embedded') {
          continue;
        }

        // Handle external wallets
        let wallet = await prisma.wallet.findUnique({
          where: { address },
        });

        if (wallet) {
          // Update wallet if userId is missing or type changed
          if (!wallet.userId || wallet.type !== type) {
            wallet = await prisma.wallet.update({
              where: { id: wallet.id },
              data: {
                userId: user.id,
                type: type as "embedded" | "external",
              },
            });
          }
        } else {
          // Create new external wallet
          wallet = await prisma.wallet.create({
            data: {
              address,
              type: type as "embedded" | "external",
              userId: user.id,
            },
          });
        }

        syncedWallets.push(wallet.id);

        // Set active wallet if this is the selected one
        if (activeWalletAddress && address.toLowerCase() === activeWalletAddress.toLowerCase()) {
          activeWalletId = wallet.id;
        }
      }
    }

    // Cleanup: Remove any duplicate embedded wallets for this user
    // Only keep the one that's in syncedWallets (the active one)
    const allEmbeddedWallets = await prisma.wallet.findMany({
      where: {
        userId: user.id,
        type: 'embedded',
      },
    });

    // If there are multiple embedded wallets, keep only the synced one
    if (allEmbeddedWallets.length > 1) {
      const syncedEmbeddedWallet = allEmbeddedWallets.find(w => syncedWallets.includes(w.id));
      
      for (const wallet of allEmbeddedWallets) {
        if (wallet.id !== syncedEmbeddedWallet?.id) {
          // Try to delete duplicate embedded wallet
          // If it has payments/sessions, just unlink it instead
          try {
            await prisma.wallet.delete({
              where: { id: wallet.id },
            });
          } catch {
            // If deletion fails, unlink it from the user
            await prisma.wallet.update({
              where: { id: wallet.id },
              data: { userId: null },
            });
          }
        }
      }
    }

    // Update user's activeWalletId if we found a matching wallet
    if (activeWalletId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { activeWalletId },
      });
    } else if (activeWalletAddress) {
      // Try to find wallet by address if not already synced
      const wallet = await prisma.wallet.findUnique({
        where: { address: activeWalletAddress },
      });
      if (wallet) {
        // Link wallet to user if not already linked
        if (!wallet.userId) {
          await prisma.wallet.update({
            where: { id: wallet.id },
            data: { userId: user.id },
          });
        }
        user = await prisma.user.update({
          where: { id: user.id },
          data: { activeWalletId: wallet.id },
        });
        activeWalletId = wallet.id;
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        activeWalletId: user.activeWalletId,
      },
      syncedWallets,
      activeWalletId,
    });
  } catch (err) {
    console.error("USER SYNC ERROR:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

