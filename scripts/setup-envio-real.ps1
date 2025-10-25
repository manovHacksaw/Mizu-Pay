Write-Host "🚀 Setting up Real Envio Indexer for MizuPay..." -ForegroundColor Green

# Check if Envio CLI is installed
Write-Host "📦 Checking Envio CLI..." -ForegroundColor Yellow
try {
    $envioVersion = envio --version 2>$null
    Write-Host "✅ Envio CLI found: $envioVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Envio CLI not found. Installing..." -ForegroundColor Red
    npm i -g @envio/cli@latest
}

# Install project dependencies
Write-Host "📦 Installing project dependencies..." -ForegroundColor Yellow
bun install

# Generate Prisma client
Write-Host "🗄️ Generating Prisma client..." -ForegroundColor Yellow
try {
    npx prisma generate
    Write-Host "✅ Prisma client generated successfully" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Prisma client generation failed, but continuing..." -ForegroundColor Yellow
}

# Push database schema
Write-Host "🗄️ Pushing database schema..." -ForegroundColor Yellow
try {
    npx prisma db push
    Write-Host "✅ Database schema updated" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Database push failed, but continuing..." -ForegroundColor Yellow
}

# Create the indexer
Write-Host "🔧 Creating Envio indexer..." -ForegroundColor Yellow
try {
    envio indexer create --name MizuPayIndexer --template evm
    Write-Host "✅ Envio indexer created" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Indexer creation failed, using existing config..." -ForegroundColor Yellow
}

Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Start the indexer: envio indexer dev" -ForegroundColor White
Write-Host "2. Visit http://localhost:3000/transactions to see real transactions" -ForegroundColor White
Write-Host "3. Make some test transactions on your contract to see them indexed" -ForegroundColor White
Write-Host ""
Write-Host "Contract Address: 0x6aE731EbaC64f1E9c6A721eA2775028762830CF7" -ForegroundColor Cyan
Write-Host "Network: Celo Sepolia Testnet" -ForegroundColor Cyan
