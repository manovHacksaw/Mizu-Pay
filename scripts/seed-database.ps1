# PowerShell script to seed the database with gift cards
# This script checks for required environment variables and seeds the database

Write-Host "🌱 Mizu Pay - Database Seeding Script" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "prisma/seed.ts")) {
    Write-Host "❌ Error: prisma/seed.ts not found. Please run this script from the mizu-pay directory." -ForegroundColor Red
    exit 1
}

# Check for .env.local file
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️  Warning: .env.local file not found. Creating one..." -ForegroundColor Yellow
    New-Item -Path ".env.local" -ItemType File -Force | Out-Null
    Write-Host ""
    Write-Host "Please add the following to .env.local:" -ForegroundColor Yellow
    Write-Host "  DATABASE_URL=`"your-database-url`"" -ForegroundColor Yellow
    Write-Host "  ENCRYPTION_SECRET=`"your-random-secret-key`"" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter after adding the variables"
}

# Check for ENCRYPTION_SECRET
$hasEncryptionSecret = $false
if (Test-Path ".env.local") {
    $envLocalContent = Get-Content ".env.local" -Raw
    if ($envLocalContent -match "ENCRYPTION_SECRET") {
        $hasEncryptionSecret = $true
    }
}
if (-not $hasEncryptionSecret -and (Test-Path ".env")) {
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "ENCRYPTION_SECRET") {
        $hasEncryptionSecret = $true
    }
}

if (-not $hasEncryptionSecret) {
    Write-Host "❌ ERROR: ENCRYPTION_SECRET not found in .env or .env.local" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please add this line to your .env.local file:" -ForegroundColor Yellow
    Write-Host "ENCRYPTION_SECRET=`"your-random-secret-key-here`"" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "You can generate a random secret or use any long random string." -ForegroundColor Yellow
    exit 1
}

# Check for DATABASE_URL
$hasDatabaseUrl = $false
if (Test-Path ".env.local") {
    $envLocalContent = Get-Content ".env.local" -Raw
    if ($envLocalContent -match "DATABASE_URL") {
        $hasDatabaseUrl = $true
    }
}
if (-not $hasDatabaseUrl -and (Test-Path ".env")) {
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "DATABASE_URL") {
        $hasDatabaseUrl = $true
    }
}

if (-not $hasDatabaseUrl) {
    Write-Host "❌ ERROR: DATABASE_URL not found in .env or .env.local" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please add your database connection string to .env.local:" -ForegroundColor Yellow
    Write-Host "DATABASE_URL=`"postgresql://user:password@host:port/database`"" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Environment variables found" -ForegroundColor Green
Write-Host ""
Write-Host "Running seed script..." -ForegroundColor Cyan
Write-Host ""

# Run the seed script
bun prisma/seed.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 Database seeding completed successfully!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Database seeding failed. Please check the error messages above." -ForegroundColor Red
    exit 1
}

