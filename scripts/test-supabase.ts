/**
 * Test Supabase Connection and Setup
 * Uses Supabase Client (works over HTTPS, more reliable)
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

// Create Supabase client with service role for admin access
const supabase = createClient(
  supabaseUrl,
  supabaseServiceKey && supabaseServiceKey !== 'your-service-role-key-here'
    ? supabaseServiceKey
    : supabaseAnonKey
);

async function testSupabase() {
  console.log('🚀 Testing Supabase Connection...\n');
  console.log(`📍 URL: ${supabaseUrl}\n`);

  try {
    // Test 1: Try to query our expected tables directly
    console.log('Test 1: Testing database connection...');


    const expectedTables = ['profiles', 'companies', 'sites', 'workers', 'attendance', 'payroll'];

    let foundTables = 0;
    let missingTables: string[] = [];

    for (const tableName of expectedTables) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(0);

      if (error) {
        missingTables.push(tableName);
      } else {
        foundTables++;
      }
    }

    console.log(`   Found: ${foundTables}/${expectedTables.length} tables\n`);

    if (foundTables === expectedTables.length) {
      console.log('✅ All required tables exist!\n');
      console.log('📊 Database schema:');
      expectedTables.forEach((table) => {
        console.log(`   ✅ ${table}`);
      });
    } else {
      console.log('⚠️  Some tables are missing:\n');
      console.log('Missing tables:');
      missingTables.forEach((table) => {
        console.log(`   ❌ ${table}`);
      });
      console.log('\n📋 To create tables, run migrations:\n');
      console.log('1. Open Supabase SQL Editor:');
      console.log('   https://supabase.com/dashboard/project/ejgsotsviobjfvfqovcj/editor\n');
      console.log('2. Copy the entire contents of:');
      console.log('   C:\\Users\\tlduf\\.cursor\\projects\\dev3_nomu\\scripts\\combined-migrations.sql\n');
      console.log('3. Paste into SQL Editor and click "Run"\n');
      console.log('4. Run this test again: npm run db:test-supabase\n');
      return;
    }

    console.log('\n✨ Supabase connection test complete!\n');

    // Provide next steps
    console.log('📋 Next Steps:');
    console.log('1. If tables are missing, run migrations via SQL Editor');
    console.log('2. If tables exist, update .env.local with Service Role Key');
    console.log('3. Run: npm run dev');
    console.log('4. Test API endpoints\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

testSupabase();
