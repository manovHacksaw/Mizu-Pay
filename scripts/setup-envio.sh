#!/bin/bash

echo "🚀 Setting up Envio Indexer for MizuPay..."

# Install Envio CLI
echo "📦 Installing Envio CLI..."
npm i -g envio@v0.0.21

# Install project dependencies
echo "📦 Installing project dependencies..."
npm install

# Install additional dependencies
echo "📦 Installing additional dependencies..."
npm install @radix-ui/react-select

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
npm run db:generate

# Push database schema
echo "🗄️ Pushing database schema..."
npm run db:push

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Make sure your DATABASE_URL is set in .env"
echo "2. Start the indexer: npm run indexer:dev"
echo "3. Visit http://localhost:3000/transactions to view indexed data"
echo ""
echo "For more information, see ENVIO_SETUP.md"
