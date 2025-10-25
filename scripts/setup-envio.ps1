Write-Host "🚀 Setting up Envio Indexer for MizuPay..." -ForegroundColor Green

# Install Envio CLI
Write-Host "📦 Installing Envio CLI..." -ForegroundColor Yellow
npm i -g envio@v0.0.21

# Install project dependencies
Write-Host "📦 Installing project dependencies..." -ForegroundColor Yellow
npm install

# Install additional dependencies
Write-Host "📦 Installing additional dependencies..." -ForegroundColor Yellow
npm install @radix-ui/react-select

# Generate Prisma client
Write-Host "🗄️ Generating Prisma client..." -ForegroundColor Yellow
npm run db:generate

# Push database schema
Write-Host "🗄️ Pushing database schema..." -ForegroundColor Yellow
npm run db:push

Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Make sure your DATABASE_URL is set in .env" -ForegroundColor White
Write-Host "2. Start the indexer: npm run indexer:dev" -ForegroundColor White
Write-Host "3. Visit http://localhost:3000/transactions to view indexed data" -ForegroundColor White
Write-Host ""
Write-Host "For more information, see ENVIO_SETUP.md" -ForegroundColor Cyan
