/**
 * Database Migration Executor
 * Executes SQL migration files on Supabase database
 */

import { config } from 'dotenv';
import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env.local
config({ path: path.join(__dirname, '..', '.env.local') });

const DATABASE_URL = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

async function runMigrations() {
  const client = new Client({
    connectionString: DATABASE_URL,
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully\n');

    const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Execute in order

    console.log(`📁 Found ${migrationFiles.length} migration files:\n`);

    for (const file of migrationFiles) {
      console.log(`⏳ Executing: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      try {
        await client.query(sql);
        console.log(`✅ Completed: ${file}\n`);
      } catch (error: any) {
        // Check if error is because object already exists
        if (error.code === '42P07' || error.code === '42710' || error.message?.includes('already exists')) {
          console.log(`⚠️  Skipped: ${file} (objects already exist)\n`);
        } else {
          throw error;
        }
      }
    }

    console.log('🎉 All migrations executed successfully!\n');

    // Verify tables were created
    console.log('🔍 Verifying database schema...');
    const tableQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;

    const result = await client.query(tableQuery);
    console.log('\n📊 Tables in database:');
    result.rows.forEach((row: any) => {
      console.log(`   - ${row.table_name}`);
    });

    console.log('\n✨ Database setup complete!');

  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

runMigrations();
