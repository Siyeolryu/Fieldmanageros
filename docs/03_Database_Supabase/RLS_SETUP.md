# RLS (Row Level Security) 정책 적용 가이드

## 개요

RLS는 데이터베이스 레벨에서 사용자별 데이터 접근을 제어하는 보안 기능입니다.
각 사용자는 자신이 소유한 데이터만 조회/수정/삭제할 수 있습니다.

---

## 1. Supabase Dashboard에서 RLS 정책 적용

### 방법 1: SQL Editor 사용 (권장)

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. 왼쪽 메뉴에서 **SQL Editor** 클릭
4. "New query" 클릭
5. 아래 SQL 파일의 내용을 복사해서 붙여넣기:
   ```
   supabase/migrations/20260413000006_enable_rls_policies.sql
   ```
6. "Run" 버튼 클릭

### 방법 2: Table Editor에서 개별 적용

각 테이블별로 적용하는 방법입니다.

#### Companies 테이블

1. **Table Editor** → **companies** 선택
2. "Policies" 탭 클릭
3. "Create Policy" 클릭
4. 아래 정책들을 차례로 추가:

**SELECT 정책**
```sql
CREATE POLICY "Users can view their own companies"
  ON companies FOR SELECT
  USING (auth.uid() = owner_id);
```

**INSERT 정책**
```sql
CREATE POLICY "Users can insert their own companies"
  ON companies FOR INSERT
  WITH CHECK (auth.uid() = owner_id);
```

**UPDATE 정책**
```sql
CREATE POLICY "Users can update their own companies"
  ON companies FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);
```

**DELETE 정책**
```sql
CREATE POLICY "Users can delete their own companies"
  ON companies FOR DELETE
  USING (auth.uid() = owner_id);
```

#### Sites 테이블

```sql
-- SELECT
CREATE POLICY "Users can view sites from their companies"
  ON sites FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = sites.company_id
      AND companies.owner_id = auth.uid()
    )
  );

-- INSERT
CREATE POLICY "Users can insert sites to their companies"
  ON sites FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = sites.company_id
      AND companies.owner_id = auth.uid()
    )
  );

-- UPDATE
CREATE POLICY "Users can update sites from their companies"
  ON sites FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = sites.company_id
      AND companies.owner_id = auth.uid()
    )
  );

-- DELETE
CREATE POLICY "Users can delete sites from their companies"
  ON sites FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = sites.company_id
      AND companies.owner_id = auth.uid()
    )
  );
```

#### Workers 테이블

```sql
-- SELECT
CREATE POLICY "Users can view workers from their sites"
  ON workers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sites
      JOIN companies ON companies.id = sites.company_id
      WHERE sites.id = workers.site_id
      AND companies.owner_id = auth.uid()
    )
  );

-- INSERT
CREATE POLICY "Users can insert workers to their sites"
  ON workers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sites
      JOIN companies ON companies.id = sites.company_id
      WHERE sites.id = workers.site_id
      AND companies.owner_id = auth.uid()
    )
  );

-- UPDATE
CREATE POLICY "Users can update workers from their sites"
  ON workers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM sites
      JOIN companies ON companies.id = sites.company_id
      WHERE sites.id = workers.site_id
      AND companies.owner_id = auth.uid()
    )
  );

-- DELETE
CREATE POLICY "Users can delete workers from their sites"
  ON workers FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM sites
      JOIN companies ON companies.id = sites.company_id
      WHERE sites.id = workers.site_id
      AND companies.owner_id = auth.uid()
    )
  );
```

#### Attendance 테이블

```sql
-- SELECT
CREATE POLICY "Users can view attendance from their sites"
  ON attendance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sites
      JOIN companies ON companies.id = sites.company_id
      WHERE sites.id = attendance.site_id
      AND companies.owner_id = auth.uid()
    )
  );

-- INSERT
CREATE POLICY "Users can insert attendance to their sites"
  ON attendance FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sites
      JOIN companies ON companies.id = sites.company_id
      WHERE sites.id = attendance.site_id
      AND companies.owner_id = auth.uid()
    )
  );

-- UPDATE
CREATE POLICY "Users can update attendance from their sites"
  ON attendance FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM sites
      JOIN companies ON companies.id = sites.company_id
      WHERE sites.id = attendance.site_id
      AND companies.owner_id = auth.uid()
    )
  );

-- DELETE
CREATE POLICY "Users can delete attendance from their sites"
  ON attendance FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM sites
      JOIN companies ON companies.id = sites.company_id
      WHERE sites.id = attendance.site_id
      AND companies.owner_id = auth.uid()
    )
  );
```

#### Payroll 테이블

```sql
-- SELECT
CREATE POLICY "Users can view payroll from their sites"
  ON payroll FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sites
      JOIN companies ON companies.id = sites.company_id
      WHERE sites.id = payroll.site_id
      AND companies.owner_id = auth.uid()
    )
  );

-- INSERT
CREATE POLICY "Users can insert payroll to their sites"
  ON payroll FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sites
      JOIN companies ON companies.id = sites.company_id
      WHERE sites.id = payroll.site_id
      AND companies.owner_id = auth.uid()
    )
  );

-- UPDATE
CREATE POLICY "Users can update payroll from their sites"
  ON payroll FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM sites
      JOIN companies ON companies.id = sites.company_id
      WHERE sites.id = payroll.site_id
      AND companies.owner_id = auth.uid()
    )
  );

-- DELETE
CREATE POLICY "Users can delete payroll from their sites"
  ON payroll FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM sites
      JOIN companies ON companies.id = sites.company_id
      WHERE sites.id = payroll.site_id
      AND companies.owner_id = auth.uid()
    )
  );
```

#### Profiles 테이블

```sql
-- SELECT
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- INSERT
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- UPDATE
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

---

## 2. RLS 정책 확인

정책이 올바르게 적용되었는지 확인하려면:

```sql
-- RLS 활성화 여부 확인
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'companies', 'sites', 'workers', 'attendance', 'payroll');

-- 모든 정책 확인
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;
```

예상 결과:
- `rowsecurity` 컬럼이 모두 `true`여야 함
- 각 테이블에 4개의 정책 (SELECT, INSERT, UPDATE, DELETE) 존재

---

## 3. RLS 정책 테스트

### 준비
1. 회원가입으로 2개의 계정 생성
2. 각 계정으로 로그인하여 회사 데이터 생성

### 테스트 시나리오

**시나리오 1: 사용자 A가 자신의 데이터 조회**
```
✅ 성공: 사용자 A의 회사 목록이 보임
```

**시나리오 2: 사용자 A가 사용자 B의 데이터 조회 시도**
```
✅ 성공: 빈 배열 반환 (사용자 B의 데이터는 보이지 않음)
```

**시나리오 3: 사용자 A가 사용자 B의 데이터 수정 시도**
```
✅ 성공: 에러 발생 또는 아무 변화 없음
```

---

## 4. 문제 해결

### RLS 정책이 작동하지 않는 경우

**문제**: API에서 데이터가 조회되지 않음
```
해결: Service Role Key 대신 Anon Key를 사용하는지 확인
- Service Role Key는 RLS를 우회함
- 클라이언트에서는 Anon Key 사용 필요
```

**문제**: 정책 생성 시 에러 발생
```
해결:
1. 기존 동일한 이름의 정책이 있는지 확인
2. DROP POLICY로 삭제 후 재생성
3. 또는 CREATE POLICY IF NOT EXISTS 사용
```

**문제**: 모든 사용자의 데이터가 보임
```
해결:
1. RLS가 활성화되었는지 확인
2. auth.uid() 함수가 정상 작동하는지 확인
3. Supabase 클라이언트가 인증된 상태인지 확인
```

---

## 5. 보안 주의사항

1. **Service Role Key는 서버에서만 사용**
   - 클라이언트(브라우저)에 노출 금지
   - 환경 변수로 안전하게 관리

2. **Anon Key는 클라이언트에서 사용**
   - RLS 정책이 적용됨
   - 공개되어도 안전

3. **정책 테스트 필수**
   - 실제 사용자로 로그인하여 데이터 접근 테스트
   - 다른 사용자의 데이터가 보이지 않는지 확인

---

## 6. 적용 완료 체크리스트

- [ ] Companies 테이블 RLS 정책 적용
- [ ] Sites 테이블 RLS 정책 적용
- [ ] Workers 테이블 RLS 정책 적용
- [ ] Attendance 테이블 RLS 정책 적용
- [ ] Payroll 테이블 RLS 정책 적용
- [ ] Profiles 테이블 RLS 정책 적용
- [ ] SQL로 정책 확인
- [ ] 2개 계정으로 데이터 격리 테스트
- [ ] 프로덕션 배포 전 재확인
