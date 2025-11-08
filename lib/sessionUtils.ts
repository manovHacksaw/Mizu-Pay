import { prisma } from "@/lib/prisma";

const SESSION_EXPIRY_MINUTES = 10;

/**
 * Check if a session is expired based on expiresAt field
 */
export function isSessionExpired(expiresAt: Date): boolean {
  const now = new Date();
  return now > expiresAt;
}

/**
 * Check if a session is expired (older than 10 minutes) - legacy method using createdAt
 * @deprecated Use isSessionExpired with expiresAt field instead
 */
export function isSessionExpiredLegacy(createdAt: Date): boolean {
  const now = new Date();
  const expiryTime = new Date(createdAt.getTime() + SESSION_EXPIRY_MINUTES * 60 * 1000);
  return now > expiryTime;
}

/**
 * Check and expire a session if it's expired
 * Returns the updated session or null if not found
 * Uses expiresAt field if available, otherwise falls back to createdAt
 */
export async function checkAndExpireSession(sessionId: string) {
  const session = await prisma.paymentSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    return null;
  }

  // If session is already expired, paid, fulfilled, or failed, return as is
  if (session.status !== "pending") {
    return session;
  }

  // Check if session is expired using expiresAt field (preferred) or createdAt (fallback)
  const isExpired = session.expiresAt 
    ? isSessionExpired(session.expiresAt)
    : isSessionExpiredLegacy(session.createdAt);

  if (isExpired) {
    // Update session status to expired
    const updatedSession = await prisma.paymentSession.update({
      where: { id: sessionId },
      data: { status: "expired" },
    });
    return updatedSession;
  }

  return session;
}

/**
 * Expire all pending sessions that have passed their expiration time
 * Uses expiresAt field if available, otherwise falls back to createdAt + 10 minutes
 * Useful for background jobs or cleanup tasks
 */
export async function expireOldSessions() {
  const now = new Date();
  
  // Expire sessions with expiresAt field that have passed
  const result1 = await prisma.paymentSession.updateMany({
    where: {
      status: "pending",
      expiresAt: {
        lt: now,
      },
    },
    data: {
      status: "expired",
    },
  });

  // Expire sessions without expiresAt field (legacy) that are older than 10 minutes
  const tenMinutesAgo = new Date(Date.now() - SESSION_EXPIRY_MINUTES * 60 * 1000);
  const result2 = await prisma.paymentSession.updateMany({
    where: {
      status: "pending",
      expiresAt: null,
      createdAt: {
        lt: tenMinutesAgo,
      },
    },
    data: {
      status: "expired",
    },
  });

  return result1.count + result2.count;
}

