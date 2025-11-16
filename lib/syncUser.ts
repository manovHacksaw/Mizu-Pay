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
  // Use a promise that never rejects - always resolves with success/error object
  return new Promise((resolve) => {
    // Wrap everything in try-catch to ensure we never throw
    (async () => {
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
        }).catch((fetchError) => {
          // Catch fetch errors immediately
          const errorMessage = fetchError instanceof Error ? fetchError.message : "Network error";
          resolve({
            success: false,
            error: errorMessage,
          });
          return null;
        });

        if (!response) {
          return; // Already resolved in catch above
        }

        // Check response status and handle both 500 errors and 200 responses with error flags
        let responseData;
        try {
          responseData = await response.json();
        } catch {
          responseData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        // Handle both error status codes and success responses with error flags
        if (!response.ok || (responseData && !responseData.success && responseData.error)) {
          const errorMessage = responseData.error || responseData.details || "Failed to sync user";
          
          // Always suppress errors - never log or throw
          resolve({
            success: false,
            error: errorMessage,
          });
          return;
        }

        // Response is OK and has success flag
        if (responseData && responseData.success && responseData.user) {
          resolve({ success: true, user: responseData.user });
          return;
        }
        
        // Fallback if response structure is unexpected
        resolve({ success: false, error: "Unexpected response format" });
      } catch (error) {
        // Catch any unexpected errors - always resolve, never reject
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        resolve({
          success: false,
          error: errorMessage,
        });
      }
    })().catch(() => {
      // Final safety net - ensure promise always resolves
      resolve({
        success: false,
        error: "Unexpected error",
      });
    });
  });
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

