/**
 * Create Database Tables via Supabase Client
 * This script uses the Supabase JS client to execute migrations
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey || supabaseServiceKey === 'your-service-role-key-here') {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

// Create Supabase client with service role for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTables() {
  console.log('🚀 Creating database tables via Supabase...\n');
  console.log(`📍 URL: ${supabaseUrl}\n`);

  try {
    // Read the combined migration file
    const migrationPath = path.join(__dirname, 'combined-migrations.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');

    console.log('📋 Executing SQL migration...\n');

    // Execute the SQL using Supabase RPC
    // Note: Supabase JS client doesn't directly support raw SQL execution
    // We need to use the REST API or create an RPC function

    // Alternative: Execute via Supabase REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      console.log('⚠️  Direct SQL execution not available via REST API\n');
      console.log('📋 Please execute the migration manually:\n');
      console.log('1. Open Supabase SQL Editor:');
      console.log(`   ${supabaseUrl.replace('https://', 'https://supabase.com/dashboard/project/')}/editor\n`);
      console.log('2. Copy and paste the contents of:');
      console.log(`   ${migrationPath}\n`);
      console.log('3. Click "Run"\n');
      return;
    }

    console.log('✅ Tables created successfully!\n');

    // Verify tables were created
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

    console.log(`📊 Table verification: ${foundTables}/${expectedTables.length} tables found\n`);

    if (foundTables === expectedTables.length) {
      console.log('✅ All required tables exist!\n');
      expectedTables.forEach((table) => {
        console.log(`   ✅ ${table}`);
      });
    } else {
      console.log('⚠️  Some tables are still missing:\n');
      missingTables.forEach((table) => {
        console.log(`   ❌ ${table}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTables();
