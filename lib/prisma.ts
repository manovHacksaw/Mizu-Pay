import { PrismaClient } from "@prisma/client";

// Load environment variables explicitly (helps in WSL/development)
// This ensures DATABASE_URL is available before PrismaClient is initialized
if (typeof window === 'undefined') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const dotenv = require('dotenv');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path');
    // Load .env.local first (higher priority), then .env
    // Only load if DATABASE_URL is not already set (allows override via system env vars)
    if (!process.env.DATABASE_URL) {
      dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
      dotenv.config({ path: path.resolve(process.cwd(), '.env') });
    } else {
      // Even if DATABASE_URL is set, load other env vars from .env files
      dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
      dotenv.config({ path: path.resolve(process.cwd(), '.env') });
    }
  } catch (error) {
    // dotenv might not be available, that's okay - Next.js should handle it
    console.warn('Could not load dotenv in prisma.ts (this is okay if Next.js loads it):', error);
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Reuse the same Prisma instance across all invocations (important for serverless)
// This prevents connection pool exhaustion in serverless environments like Vercel
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    // Connection pool configuration for serverless
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// Always cache the Prisma instance in global scope (especially important for serverless)
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}

// Handle graceful shutdown in development
if (process.env.NODE_ENV !== "production") {
  process.on("beforeExit", async () => {
    await prisma.$disconnect();
  });
}

// Helper function to test database connection
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database connection test failed:", error);
    return false;
  }
}

