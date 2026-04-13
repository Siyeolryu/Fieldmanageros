#!/usr/bin/env node

/**
 * Supabase 마이그레이션 자동 실행 스크립트
 *
 * 실행 방법: node scripts/run-migrations.js
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// .env.local 파일에서 환경 변수 로드
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations');

const MIGRATION_FILES = [
  '001_initial_schema.sql',
  '002_rls_policies.sql',
  '003_utility_functions.sql',
  '004_realtime.sql'
];

async function runMigrations() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Supabase는 SSL 필요
    }
  });

  try {
    console.log('🔗 Supabase 데이터베이스에 연결 중...\n');
    await client.connect();
    console.log('✅ 연결 성공!\n');

    console.log('📦 마이그레이션 실행 시작...\n');
    console.log('═'.repeat(60));

    for (const filename of MIGRATION_FILES) {
      const filePath = path.join(MIGRATIONS_DIR, filename);

      console.log(`\n🔄 실행 중: ${filename}`);
      console.log('─'.repeat(60));

      // SQL 파일 읽기
      const sql = fs.readFileSync(filePath, 'utf8');

      // SQL 실행
      const startTime = Date.now();
      await client.query(sql);
      const duration = Date.now() - startTime;

      console.log(`✅ 완료 (${duration}ms)`);
    }

    console.log('\n' + '═'.repeat(60));
    console.log('\n🎉 모든 마이그레이션이 성공적으로 완료되었습니다!\n');

    // 테이블 목록 확인
    console.log('📊 생성된 테이블 확인 중...\n');
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('생성된 테이블:');
    result.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });

  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message);
    console.error('\n상세 오류:');
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 데이터베이스 연결 종료\n');
  }
}

// 스크립트 실행
runMigrations();
