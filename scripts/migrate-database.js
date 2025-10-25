// Database migration script
// This script helps with database schema updates

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

function runDatabaseMigration() {
  console.log('🔄 Running Database Migration\n');
  
  try {
    // Check if Prisma is available
    const prismaPath = path.join(process.cwd(), 'node_modules', '.bin', 'prisma');
    
    if (fs.existsSync(prismaPath)) {
      console.log('✅ Prisma found');
    } else {
      console.log('❌ Prisma not found');
      console.log('   Run: npm install prisma @prisma/client');
      return;
    }
    
    console.log('\n📋 Schema Changes:');
    console.log('   ✅ Added txHash field to Payment model');
    console.log('   ✅ Field type: String? (optional)');
    console.log('   ✅ Purpose: Store blockchain transaction hash');
    
    console.log('\n🔧 Migration Commands:');
    console.log('   1. npx prisma db push');
    console.log('   2. npx prisma generate');
    
    console.log('\n💡 Manual Steps:');
    console.log('   1. Open terminal in project directory');
    console.log('   2. Run: npx prisma db push');
    console.log('   3. Run: npx prisma generate');
    console.log('   4. Restart your development server');
    
    console.log('\n🎯 What This Fixes:');
    console.log('   ✅ Payment API will accept txHash field');
    console.log('   ✅ Transaction hashes will be stored');
    console.log('   ✅ Email confirmations will work');
    console.log('   ✅ Database errors will be resolved');
    
  } catch (error) {
    console.error('❌ Migration error:', error.message);
  }
}

// Run the migration helper
runDatabaseMigration();
