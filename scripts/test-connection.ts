/**
 * Test Database Connection
 */

import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import * as path from 'path';

// Load environment variables
config({ path: path.join(__dirname, '..', '.env.local') });

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testConnection() {
  try {
    console.log('🔌 Testing Prisma connection to Supabase...\n');

    // Simple connection test
    await prisma.$connect();
    console.log('✅ Prisma connected successfully!\n');

    // Try a simple query
    console.log('🔍 Testing raw query...');
    const result = await prisma.$queryRaw`SELECT NOW() as current_time, version() as pg_version`;
    console.log('✅ Query successful:', result);

    console.log('\n🔍 Checking existing tables...');
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;

    console.log('\n📊 Existing tables:');
    if (Array.isArray(tables) && tables.length > 0) {
      tables.forEach((row: any) => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.log('   (No tables found - migrations need to be run)');
    }

    console.log('\n✨ Connection test complete!');

  } catch (error) {
    console.error('❌ Connection error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

testConnection();
