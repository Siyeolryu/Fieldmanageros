/**
 * Create Tables Using SQL via Supabase Client
 * Executes individual CREATE TABLE statements
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import * as path from 'path';

// Load environment variables
config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSQL(sql: string, description: string) {
  console.log(`⏳ ${description}...`);

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // RPC function doesn't exist, we need to create tables manually
      console.log(`⚠️  Cannot execute via RPC: ${error.message}`);
      return false;
    }

    console.log(`✅ ${description} - Success\n`);
    return true;
  } catch (err: any) {
    console.log(`⚠️  ${description} - ${err.message}\n`);
    return false;
  }
}

async function createTables() {
  console.log('🚀 Creating database tables...\n');
  console.log(`📍 URL: ${supabaseUrl}\n`);

  // Since we can't execute raw SQL directly, we'll use a workaround
  // Create a SQL file that user can execute in Supabase SQL Editor

  const instructions = `
════════════════════════════════════════════════════════════════
  노무Pro - 데이터베이스 테이블 생성 안내
════════════════════════════════════════════════════════════════

⚠️  Supabase JS 클라이언트는 보안상 이유로 DDL(CREATE TABLE) 명령을
   직접 실행할 수 없습니다.

📋 다음 단계를 따라주세요:

1️⃣  Supabase SQL Editor 열기:
   👉 https://supabase.com/dashboard/project/ejgsotsviobjfvfqovcj/editor

2️⃣  다음 파일 내용 전체 복사:
   👉 C:\\Users\\tlduf\\.cursor\\projects\\dev3_nomu\\scripts\\combined-migrations.sql

3️⃣  SQL Editor에 붙여넣기

4️⃣  우측 하단 "Run" 버튼 클릭

5️⃣  성공 메시지 확인 후:
   npm run db:test-supabase

════════════════════════════════════════════════════════════════

💡 대안: MCP 서버를 사용하여 자동 생성

현재 .mcp.json이 설정되어 있습니다. Claude Code에서:

1. MCP 서버 승인 프롬프트가 나타나면 "Allow" 클릭
2. @supabase 멘션하여 MCP 서버 활성화 확인
3. MCP를 통해 테이블 생성 가능

════════════════════════════════════════════════════════════════
`;

  console.log(instructions);

  // Try to verify existing tables
  console.log('\n📊 현재 테이블 확인 중...\n');

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
      console.log(`   ❌ ${tableName}`);
    } else {
      foundTables++;
      console.log(`   ✅ ${tableName}`);
    }
  }

  console.log(`\n📊 테이블 상태: ${foundTables}/${expectedTables.length} 생성됨\n`);

  if (missingTables.length > 0) {
    console.log('⚠️  누락된 테이블:');
    missingTables.forEach(table => console.log(`   - ${table}`));
    console.log('\n위 안내를 따라 SQL Editor에서 생성해주세요.\n');
  } else {
    console.log('✅ 모든 테이블이 생성되었습니다!\n');
  }
}

createTables();
