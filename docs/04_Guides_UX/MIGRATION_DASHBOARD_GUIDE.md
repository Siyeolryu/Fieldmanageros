# 🚀 Supabase Dashboard SQL 마이그레이션 가이드

> **소요 시간**: 5-7분
> **난이도**: 초급 (복사-붙여넣기만!)

---

## 📋 실행 순서

1. Supabase SQL Editor 열기
2. 4개 SQL 파일 순서대로 실행
3. Table Editor에서 확인
4. 로컬에서 연결 테스트

---

## Step 1: SQL Editor 열기

### 방법 1: 직접 링크 (가장 빠름)
https://supabase.com/dashboard/project/ejgsotsviobjfvfqovcj/sql/new

### 방법 2: Dashboard 메뉴
1. https://supabase.com/dashboard 접속
2. `nomu-pro` 프로젝트 클릭
3. 좌측 메뉴 **SQL Editor** 클릭
4. **New query** 버튼 클릭

---

## Step 2: 마이그레이션 파일 실행

### 📄 파일 1: 001_initial_schema.sql (기본 테이블)

#### 실행 방법:
1. SQL Editor에서 **New query** 클릭
2. 아래 전체 SQL을 복사 (Ctrl+A, Ctrl+C)
3. SQL Editor에 붙여넣기 (Ctrl+V)
4. **RUN** 버튼 클릭 (또는 Ctrl+Enter)
5. ✅ "Success. No rows returned" 확인

#### SQL 코드:
```sql
-- 파일: supabase/migrations/001_initial_schema.sql
-- 프로젝트 루트의 supabase/migrations/ 폴더에서 복사하세요
```

**📁 파일 경로**: `C:\Users\tlduf\.cursor\projects\dev3_nomu\supabase\migrations\001_initial_schema.sql`

**내용**:
- 6개 테이블 생성 (profiles, companies, sites, workers, attendance, payroll)
- 인덱스 생성
- updated_at 자동 업데이트 트리거

---

### 📄 파일 2: 002_rls_policies.sql (보안 정책)

#### 실행 방법:
1. SQL Editor에서 **New query** 클릭
2. `supabase/migrations/002_rls_policies.sql` 파일 내용 전체 복사
3. SQL Editor에 붙여넣기
4. **RUN** 버튼 클릭
5. ✅ 성공 확인

**📁 파일 경로**: `C:\Users\tlduf\.cursor\projects\dev3_nomu\supabase\migrations\002_rls_policies.sql`

**내용**:
- Row Level Security (RLS) 정책
- 사용자별 데이터 접근 권한 설정

---

### 📄 파일 3: 003_utility_functions.sql (유틸리티 함수)

#### 실행 방법:
1. **New query** 클릭
2. `supabase/migrations/003_utility_functions.sql` 파일 내용 복사
3. 붙여넣기 → **RUN**
4. ✅ 성공 확인

**📁 파일 경로**: `C:\Users\tlduf\.cursor\projects\dev3_nomu\supabase\migrations\003_utility_functions.sql`

**내용**:
- 급여 계산 함수
- 주휴수당 계산 함수
- 4대 보험 계산 함수

---

### 📄 파일 4: 004_realtime.sql (실시간 구독)

#### 실행 방법:
1. **New query** 클릭
2. `supabase/migrations/004_realtime.sql` 파일 내용 복사
3. 붙여넣기 → **RUN**
4. ✅ 성공 확인

**📁 파일 경로**: `C:\Users\tlduf\.cursor\projects\dev3_nomu\supabase\migrations\004_realtime.sql`

**내용**:
- Realtime 구독 활성화
- 출근 기록 실시간 업데이트
- 급여 명세 실시간 알림

---

## Step 3: 테이블 생성 확인

### Table Editor에서 확인:

1. 좌측 메뉴 **Table Editor** 클릭
2. 다음 6개 테이블이 보여야 합니다:

#### ✅ 필수 테이블 체크리스트:
- [ ] **profiles** - 사용자 프로필
- [ ] **companies** - 건설사
- [ ] **sites** - 프로젝트/현장
- [ ] **workers** - 근로자
- [ ] **attendance** - 출근 기록
- [ ] **payroll** - 급여 명세

### 테이블 구조 확인:

각 테이블을 클릭하면:
- Columns 탭: 컬럼 구조
- Indexes 탭: 인덱스 목록
- Foreign keys 탭: 외래키 관계
- RLS 탭: 보안 정책

---

## Step 4: 로컬 연결 테스트

### 브라우저에서 확인:

1. http://localhost:3000 열기
2. **성공 케이스** 확인:

```
✅ Supabase 연결 성공
데이터베이스에 정상적으로 연결되었습니다.

건설사 목록
등록된 건설사가 없습니다.
```

### 브라우저 콘솔 확인:

1. F12 → Console 탭
2. 성공 메시지:
```javascript
✅ Supabase 연결 성공: []
```

---

## ❌ 문제 해결

### 문제 1: "relation does not exist" 오류

**원인**: 테이블이 생성되지 않음

**해결**:
- SQL Editor에서 실행 시 에러 메시지 확인
- 각 SQL 파일을 한 줄씩 확인
- 이전 파일이 성공했는지 확인

### 문제 2: "permission denied" 오류

**원인**: RLS 정책 미적용 또는 잘못된 정책

**해결**:
- `002_rls_policies.sql` 다시 실행
- Table Editor → RLS 탭에서 정책 확인

### 문제 3: "function does not exist" 오류

**원인**: 유틸리티 함수 미생성

**해결**:
- `003_utility_functions.sql` 다시 실행
- SQL Editor에서 에러 라인 확인

---

## 🎉 완료 확인

모든 단계가 완료되면:

✅ 6개 테이블 생성 완료
✅ RLS 정책 적용 완료
✅ 유틸리티 함수 생성 완료
✅ Realtime 구독 활성화 완료
✅ 로컬 연결 테스트 성공

---

## 📋 다음 단계

마이그레이션 완료 후:

1. **Tailwind CSS 오류 수정**
   - postcss.config.js 업데이트
   - @tailwindcss/postcss 설치

2. **API Routes 구현 시작**
   - `/api/attendance` (최우선)
   - `/api/companies`
   - `/api/sites`
   - `/api/workers`
   - `/api/payroll`

3. **Antigravity와 병렬 작업**
   - React 컴포넌트 구현
   - CalendarView 최우선 개발

---

## 💡 빠른 참조

### SQL Editor 직접 링크:
https://supabase.com/dashboard/project/ejgsotsviobjfvfqovcj/sql/new

### Table Editor 직접 링크:
https://supabase.com/dashboard/project/ejgsotsviobjfvfqovcj/editor

### 로컬 개발 서버:
http://localhost:3000

---

**마이그레이션을 시작하세요! 🚀**

각 파일을 순서대로 복사-붙여넣기-RUN 하면 됩니다.
