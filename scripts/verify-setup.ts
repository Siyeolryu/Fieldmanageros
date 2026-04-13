/**
 * Complete Setup Verification Script
 * Verifies Prisma, Supabase, and API setup
 */

import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import * as path from 'path';

// Load environment variables
config({ path: path.join(__dirname, '..', '.env.local') });

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
}

const results: TestResult[] = [];

async function testPrismaClient() {
  console.log('\n=== Testing Prisma Client ===\n');

  try {
    await prisma.$connect();
    results.push({
      name: 'Prisma Connection',
      status: 'PASS',
      message: 'Successfully connected to database via Prisma'
    });

    // Test query
    const count = await prisma.$queryRaw`SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public'`;
    results.push({
      name: 'Prisma Query',
      status: 'PASS',
      message: `Can execute raw queries`
    });

  } catch (error: any) {
    results.push({
      name: 'Prisma Connection',
      status: 'FAIL',
      message: error.message
    });
  }
}

async function testTables() {
  console.log('=== Testing Database Tables ===\n');

  const expectedTables = [
    'profiles',
    'companies',
    'sites',
    'workers',
    'attendance',
    'payroll'
  ];

  for (const tableName of expectedTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(0);

      if (error) {
        results.push({
          name: `Table: ${tableName}`,
          status: 'FAIL',
          message: `Table does not exist or not accessible`
        });
      } else {
        results.push({
          name: `Table: ${tableName}`,
          status: 'PASS',
          message: `Table exists and is accessible`
        });
      }
    } catch (error: any) {
      results.push({
        name: `Table: ${tableName}`,
        status: 'FAIL',
        message: error.message
      });
    }
  }
}

async function testPrismaModels() {
  console.log('\n=== Testing Prisma Models ===\n');

  try {
    // Test Worker model (we know this table exists)
    await prisma.worker.count();
    results.push({
      name: 'Prisma Model: Worker',
      status: 'PASS',
      message: 'Model accessible and queryable'
    });
  } catch (error: any) {
    results.push({
      name: 'Prisma Model: Worker',
      status: 'FAIL',
      message: error.message
    });
  }

  try {
    // Test Site model
    await prisma.site.count();
    results.push({
      name: 'Prisma Model: Site',
      status: 'PASS',
      message: 'Model accessible and queryable'
    });
  } catch (error: any) {
    results.push({
      name: 'Prisma Model: Site',
      status: 'FAIL',
      message: error.message
    });
  }
}

async function testEnvironmentVariables() {
  console.log('\n=== Testing Environment Variables ===\n');

  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'DATABASE_URL',
    'DIRECT_URL'
  ];

  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value && value !== 'your-service-role-key-here') {
      results.push({
        name: `Env: ${varName}`,
        status: 'PASS',
        message: 'Set correctly'
      });
    } else {
      results.push({
        name: `Env: ${varName}`,
        status: 'FAIL',
        message: 'Not set or placeholder value'
      });
    }
  }
}

function printResults() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║           Setup Verification Results                     ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const total = results.length;

  results.forEach(result => {
    const icon = result.status === 'PASS' ? '✅' : '❌';
    const maxLength = 40;
    const namePadded = result.name.padEnd(maxLength);
    console.log(`${icon} ${namePadded} ${result.message}`);
  });

  console.log('\n' + '─'.repeat(70));
  console.log(`\nResults: ${passed}/${total} PASSED, ${failed}/${total} FAILED\n`);

  if (failed > 0) {
    console.log('⚠️  Some tests failed. Please check:\n');
    console.log('1. Have you run migrations in Supabase SQL Editor?');
    console.log('   → See MIGRATION_GUIDE.md for instructions\n');
    console.log('2. Are all environment variables set correctly?');
    console.log('   → Check .env.local file\n');
    console.log('3. Is your Supabase database active and accessible?');
    console.log('   → Check Supabase dashboard\n');
  } else {
    console.log('🎉 All tests passed! Your setup is complete.\n');
    console.log('Next steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Test API endpoints');
    console.log('3. Create test data\n');
  }
}

async function runAllTests() {
  try {
    await testEnvironmentVariables();
    await testPrismaClient();
    await testTables();
    await testPrismaModels();
  } catch (error) {
    console.error('Unexpected error during tests:', error);
  } finally {
    await prisma.$disconnect();
    printResults();
  }
}

runAllTests();
