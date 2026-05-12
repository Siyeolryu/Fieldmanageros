# Supabase 프로덕션 설정 가이드

**프로젝트**: Field Manager OS (노무PRO)
**최종 업데이트**: 2026-04-14

---

## 📌 개요

Supabase 프로덕션 환경 설정을 위한 단계별 가이드입니다. 보안, 성능, 안정성을 최우선으로 합니다.

---

## 🏗️ 1단계: 프로덕션 프로젝트 생성

### 1.1 새 프로젝트 생성 (권장)

1. [Supabase Dashboard](https://app.supabase.com/) 접속
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   ```
   Organization: <Your Organization>
   Name: field-manager-os-prod
   Database Password: <강력한 비밀번호 생성>
   Region: Northeast Asia (Seoul) - ap-northeast-2
   Pricing Plan: Pro ($25/month) 권장
   ```
4. "Create new project" 클릭

**왜 새 프로젝트?**
- 개발/스테이징과 프로덕션 환경 분리
- 실수로 프로덕션 데이터 손상 방지
- 독립적인 백업 및 복구 정책

### 1.2 데이터베이스 비밀번호 저장
```bash
# 안전한 장소에 저장 (1Password, LastPass 등)
Database Password: <생성된 비밀번호>
```

⚠️ **절대 GitHub에 커밋하지 마세요!**

---

## 🗄️ 2단계: 데이터베이스 마이그레이션

### 2.1 마이그레이션 파일 확인
다음 SQL 파일들을 순서대로 실행해야 합니다:
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_rls_policies.sql`
3. `supabase/migrations/003_utility_functions.sql`
4. `supabase/migrations/004_realtime.sql` (선택)

### 2.2 SQL Editor에서 실행

1. Supabase Dashboard → SQL Editor
2. "New query" 클릭
3. 각 마이그레이션 파일 내용 복사 & 붙여넣기
4. "Run" 버튼 클릭
5. 에러 없이 완료되는지 확인

### 2.3 테이블 생성 확인
```sql
-- 생성된 테이블 목록 확인
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 예상 결과:
-- profiles
-- companies
-- sites
-- workers
-- attendance
-- payroll
```

### 2.4 RLS 정책 확인
```sql
-- RLS가 활성화되어 있는지 확인
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- 모든 테이블의 rowsecurity가 't' (true)여야 합니다
```

---

## 🔐 3단계: 인증 설정

### 3.1 Site URL 설정

1. Authentication → URL Configuration
2. Site URL 설정:
   ```
   https://field-manager-os.vercel.app
   ```
   또는 커스텀 도메인:
   ```
   https://fieldmanager.kr
   ```

### 3.2 Redirect URLs 설정
1. Authentication → URL Configuration → Redirect URLs
2. 다음 URL 추가:
   ```
   https://field-manager-os.vercel.app/auth/callback
   https://field-manager-os.vercel.app/**
   ```
   커스텀 도메인 사용 시:
   ```
   https://fieldmanager.kr/auth/callback
   https://fieldmanager.kr/**
   ```

### 3.3 Email 템플릿 커스터마이징 (선택)
1. Authentication → Email Templates
2. "Confirm your signup" 템플릿 편집:
   ```html
   <h2>노무PRO에 오신 것을 환영합니다!</h2>
   <p>계정을 활성화하려면 아래 버튼을 클릭하세요:</p>
   <a href="{{ .ConfirmationURL }}">이메일 인증하기</a>
   ```

### 3.4 OAuth Providers (향후 추가)
- 카카오 로그인
- 네이버 로그인
- Google 로그인

---

## 🔑 4단계: API Keys 확인

### 4.1 API Keys 복사
1. Settings → API → Project URL
   ```
   URL: https://xxxxx.supabase.co
   ```

2. Settings → API → Project API keys
   ```
   anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (SECRET!)
   ```

### 4.2 환경 변수에 저장
```bash
# .env.production.local (로컬 테스트용)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ... (SECRET!)
```

⚠️ **service_role 키는 절대 클라이언트에 노출되면 안 됩니다!**

---

## 🚀 5단계: 성능 최적화

### 5.1 인덱스 추가
```sql
-- 자주 조회하는 컬럼에 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_site_id ON attendance(site_id);
CREATE INDEX IF NOT EXISTS idx_workers_site_id ON workers(site_id);
CREATE INDEX IF NOT EXISTS idx_payroll_year_month ON payroll(year, month);
CREATE INDEX IF NOT EXISTS idx_payroll_worker_id ON payroll(worker_id);

-- 복합 인덱스
CREATE INDEX IF NOT EXISTS idx_attendance_site_date ON attendance(site_id, date);
CREATE INDEX IF NOT EXISTS idx_payroll_site_year_month ON payroll(site_id, year, month);
```

### 5.2 Connection Pooler 설정
1. Database → Connection Pooling
2. Mode: Transaction (기본값)
3. Connection string 복사:
   ```
   postgres://postgres:[password]@[host]:6543/postgres?pgbouncer=true
   ```

### 5.3 Database 설정 최적화
1. Database → Settings
2. 다음 설정 조정:
   ```
   max_connections: 100 (Pro plan)
   shared_buffers: 256MB
   work_mem: 4MB
   ```

---

## 🛡️ 6단계: 보안 설정

### 6.1 CORS 설정
1. Settings → API → CORS Configuration
2. Allowed origins:
   ```
   https://field-manager-os.vercel.app
   https://fieldmanager.kr
   ```
3. "Save" 클릭

### 6.2 Rate Limiting 설정
1. Settings → API → Rate Limiting
2. 다음 설정 적용:
   ```
   Anonymous requests: 100/hour
   Authenticated requests: 1000/hour
   ```

### 6.3 IP Restrictions (Pro plan 이상)
1. Settings → Database → IP Restrictions
2. 필요한 경우 IP 화이트리스트 추가

### 6.4 SSL 강제
- Supabase는 기본적으로 SSL을 강제합니다
- 모든 연결은 HTTPS/TLS로 암호화됩니다

---

## 💾 7단계: 백업 설정

### 7.1 자동 백업 확인
1. Database → Backups
2. 백업 정책 확인:
   ```
   Daily backups: 자동 (7일 보관)
   Weekly backups: 자동 (4주 보관)
   Monthly backups: 수동 권장
   ```

### 7.2 수동 백업 생성
1. Database → Backups → Create Backup
2. Description: "Production Launch - 2026-04-14"
3. "Create Backup" 클릭

### 7.3 Point-in-Time Recovery (PITR) 활성화 (Pro plan)
1. Database → Settings → Point-in-Time Recovery
2. "Enable PITR" 클릭
3. 최대 7일 복구 가능

### 7.4 백업 다운로드 (선택)
```bash
# pg_dump를 사용한 로컬 백업
pg_dump "postgres://postgres:[password]@[host]:5432/postgres" \
  > backup-$(date +%Y%m%d).sql
```

---

## 📊 8단계: 모니터링 설정

### 8.1 Database 모니터링
1. Database → Metrics
2. 다음 지표 모니터링:
   - CPU Usage (목표: <70%)
   - Memory Usage (목표: <80%)
   - Disk Usage (목표: <80%)
   - Connection Count (목표: <50)

### 8.2 API 모니터링
1. Reports → API
2. 다음 지표 확인:
   - Total Requests
   - Error Rate (목표: <1%)
   - Response Time (목표: <500ms)

### 8.3 알림 설정
1. Project Settings → Notifications
2. 이메일 알림 설정:
   - ✅ Database CPU > 80%
   - ✅ Database Memory > 90%
   - ✅ Disk Usage > 90%
   - ✅ Error Rate > 5%

---

## 🔄 9단계: 데이터 마이그레이션 (기존 데이터가 있는 경우)

### 9.1 개발 DB에서 Export
```bash
# 개발 DB에서 데이터 export
pg_dump "postgres://postgres:[dev-password]@[dev-host]:5432/postgres" \
  --data-only \
  --inserts \
  > data-export.sql
```

### 9.2 프로덕션 DB로 Import
```bash
# 프로덕션 DB로 데이터 import
psql "postgres://postgres:[prod-password]@[prod-host]:5432/postgres" \
  < data-export.sql
```

### 9.3 데이터 검증
```sql
-- 각 테이블의 레코드 수 확인
SELECT
  'profiles' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'companies', COUNT(*) FROM companies
UNION ALL
SELECT 'sites', COUNT(*) FROM sites
UNION ALL
SELECT 'workers', COUNT(*) FROM workers
UNION ALL
SELECT 'attendance', COUNT(*) FROM attendance
UNION ALL
SELECT 'payroll', COUNT(*) FROM payroll;
```

---

## ✅ 10단계: 최종 검증

### 10.1 RLS 정책 테스트
```sql
-- 테스트 사용자로 로그인
-- 다른 사용자의 데이터에 접근 시도
SELECT * FROM companies WHERE owner_id != 'current-user-id';
-- 결과: 0 rows (RLS가 정상 작동)
```

### 10.2 API 연결 테스트
```bash
# Postman 또는 curl로 API 테스트
curl https://xxxxx.supabase.co/rest/v1/companies \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_USER_TOKEN"
```

### 10.3 인증 플로우 테스트
1. 회원가입 테스트
2. 이메일 인증 테스트
3. 로그인 테스트
4. 로그아웃 테스트
5. 비밀번호 재설정 테스트

---

## 📝 체크리스트

### 프로젝트 설정
- [ ] 프로덕션 프로젝트 생성
- [ ] Region 설정 (Seoul)
- [ ] Pricing plan 선택

### 데이터베이스
- [ ] 마이그레이션 실행 완료
- [ ] 테이블 생성 확인
- [ ] RLS 정책 활성화 확인
- [ ] 인덱스 추가 완료

### 인증
- [ ] Site URL 설정
- [ ] Redirect URLs 설정
- [ ] Email 템플릿 커스터마이징

### API Keys
- [ ] Project URL 복사
- [ ] Anon key 복사
- [ ] Service role key 복사 (안전하게 저장)

### 보안
- [ ] CORS 설정
- [ ] Rate limiting 설정
- [ ] SSL 확인

### 성능
- [ ] 인덱스 추가
- [ ] Connection pooler 확인
- [ ] Database 설정 최적화

### 백업
- [ ] 자동 백업 활성화 확인
- [ ] PITR 활성화 (Pro plan)
- [ ] 초기 백업 생성

### 모니터링
- [ ] Metrics 확인
- [ ] 알림 설정

---

## 🚨 문제 해결

### 마이그레이션 실패
```
ERROR: relation "table_name" already exists
```
**해결**: 테이블이 이미 존재합니다. `DROP TABLE IF EXISTS` 추가 또는 수동 삭제 후 재실행

### RLS 정책 오류
```
ERROR: new row violates row-level security policy
```
**해결**:
1. RLS 정책 확인
2. 사용자 권한 확인
3. 필요시 임시로 RLS 비활성화 후 데이터 삽입
   ```sql
   ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
   -- 데이터 삽입
   ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
   ```

### 연결 실패
```
ERROR: Failed to connect to database
```
**해결**:
1. Database password 확인
2. Connection string 확인
3. Supabase 상태 확인: https://status.supabase.com/

---

## 🔗 유용한 링크

- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
- [Supabase Database Performance](https://supabase.com/docs/guides/database/performance)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Backups](https://supabase.com/docs/guides/platform/backups)

---

## 📞 지원

- [Supabase Discord](https://discord.supabase.com/)
- [Supabase Support](https://supabase.com/dashboard/support) (Pro plan 이상)
- [Community Forum](https://github.com/supabase/supabase/discussions)

---

**작성**: Claude Code
**프로젝트**: Field Manager OS
**버전**: 1.0.0
