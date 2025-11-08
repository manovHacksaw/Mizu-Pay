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
      for (const walletData of wallets) {
        const { address, type } = walletData;
        
        if (!address || !type) {
          continue;
        }

        // Find or create wallet by address
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
          // Create new wallet
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

