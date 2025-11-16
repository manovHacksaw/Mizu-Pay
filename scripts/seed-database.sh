#!/bin/bash

# Script to seed the database with gift cards
# This script checks for required environment variables and seeds the database

echo "🌱 Mizu Pay - Database Seeding Script"
echo "======================================"
echo ""

# Check if we're in the right directory
if [ ! -f "prisma/seed.ts" ]; then
    echo "❌ Error: prisma/seed.ts not found. Please run this script from the mizu-pay directory."
    exit 1
fi

# Check for .env.local file
if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local file not found. Creating one..."
    touch .env.local
    echo ""
    echo "Please add the following to .env.local:"
    echo "  DATABASE_URL=\"your-database-url\""
    echo "  ENCRYPTION_SECRET=\"your-random-secret-key\""
    echo ""
    read -p "Press Enter after adding the variables..."
fi

# Check for ENCRYPTION_SECRET
if ! grep -q "ENCRYPTION_SECRET" .env.local 2>/dev/null && ! grep -q "ENCRYPTION_SECRET" .env 2>/dev/null; then
    echo "❌ ERROR: ENCRYPTION_SECRET not found in .env or .env.local"
    echo ""
    echo "Please add this line to your .env.local file:"
    echo "ENCRYPTION_SECRET=\"your-random-secret-key-here\""
    echo ""
    echo "You can generate a random secret or use any long random string."
    exit 1
fi

# Check for DATABASE_URL
if ! grep -q "DATABASE_URL" .env.local 2>/dev/null && ! grep -q "DATABASE_URL" .env 2>/dev/null; then
    echo "❌ ERROR: DATABASE_URL not found in .env or .env.local"
    echo ""
    echo "Please add your database connection string to .env.local:"
    echo "DATABASE_URL=\"postgresql://user:password@host:port/database\""
    exit 1
fi

echo "✅ Environment variables found"
echo ""
echo "Running seed script..."
echo ""

# Run the seed script
bun prisma/seed.ts

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Database seeding completed successfully!"
else
    echo ""
    echo "❌ Database seeding failed. Please check the error messages above."
    exit 1
fi

