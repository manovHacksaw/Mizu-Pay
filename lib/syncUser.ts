/**
 * Utility function to sync Privy user and wallets to database
 */

interface WalletData {
  address: string;
  type: "embedded" | "external";
}

interface SyncUserParams {
  privyUserId: string;
  email?: string | null;
  wallets?: WalletData[];
  activeWalletAddress?: string | null;
}

export async function syncUserToDatabase({
  privyUserId,
  email,
  wallets,
  activeWalletAddress,
}: SyncUserParams): Promise<{
  success: boolean;
  user?: { id: string; email: string | null; activeWalletId: string | null };
  error?: string;
}> {
  try {
    const response = await fetch("/api/users/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        privyUserId,
        email,
        wallets,
        activeWalletAddress,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to sync user");
    }

    const data = await response.json();
    return { success: true, user: data.user };
  } catch (error) {
    console.error("Error syncing user to database:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Extract wallet data from Privy wallet objects
 */
export function extractWalletData(wallets: any[]): WalletData[] {
  return wallets
    .filter((w) => w.address)
    .map((w) => ({
      address: w.address,
      type: (w.walletClientType === "privy" ||
        w.walletClientType === "embedded" ||
        w.connectorType === "privy"
        ? "embedded"
        : "external") as "embedded" | "external",
    }));
}

