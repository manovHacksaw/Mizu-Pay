import { PrismaClient } from "@prisma/client";

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

