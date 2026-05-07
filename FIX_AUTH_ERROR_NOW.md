# 즉시 실행 가이드: Auth 에러 수정

**문제**: "Database error saving new user" 에러로 회원가입 실패
**해결 시간**: 약 5분
**난이도**: 초급 (SQL 복사/붙여넣기만 하면 됩니다)

---

## 1단계: Supabase SQL Editor 열기 (1분)

1. 브라우저에서 https://supabase.com/dashboard 접속
2. 프로젝트 선택: `ejgsotsviobjfvfqovcj`
3. 좌측 메뉴에서 **SQL Editor** 클릭
4. 우측 상단 **+ New query** 버튼 클릭

---

## 2단계: 수정 SQL 실행 (2분)

**파일 열기**: `supabase/IMMEDIATE_FIX.sql`

1. 위 파일의 **전체 내용** 복사 (Ctrl+A → Ctrl+C)
2. Supabase SQL Editor에 붙여넣기 (Ctrl+V)
3. **Run** 버튼 클릭 (또는 Ctrl+Enter)
4. 실행 완료까지 대기 (약 5초)

**예상 결과**:
```
✅ Auth triggers removed (if existed)
✅ Auth functions removed (if existed)
✅ user_type column added
✅ hourly_rate column added
✅ bank_name column added
✅ bank_account column added
✅ Existing profiles updated with default user_type
✅ profile_id column added to workers
✅ is_owner column added to workers
✅ Index created: idx_workers_profile_id
✅ RLS policies updated for companies
✅ Profiles table: All 4 columns exist
✅ Workers table: All 2 columns exist
✅ Auth triggers: 0 triggers (clean)

════════════════════════════════════════
✅ Migration completed successfully!
════════════════════════════════════════
```

**에러가 발생한다면**:
- 이미 컬럼이 존재하는 경우: "already exists" 메시지는 정상입니다 (무시하세요)
- 권한 에러: 프로젝트 소유자에게 Admin 권한 요청

---

## 3단계: 로컬 Prisma Client 재생성 (1분)

터미널에서 실행:

```bash
npx prisma generate
```

예상 결과:
```
✔ Generated Prisma Client to ./node_modules/@prisma/client
```

---

## 4단계: 회원가입 테스트 (1분)

1. 개발 서버 실행 (아직 안 했다면):
   ```bash
   npm run dev
   ```

2. 브라우저 시크릿 모드 열기 (Ctrl+Shift+N)

3. `http://localhost:3000` 접속

4. `tlduf1@naver.com` 또는 다른 이메일로 회원가입 시도

**예상 결과**:
- ✅ "가입이 완료되었습니다. 이메일을 확인하여 계정을 인증해주세요."
- ✅ 에러 없음
- ✅ Supabase Dashboard → Table Editor → profiles 테이블에 새 레코드 생성됨

---

## 5단계: 검증 (선택 사항)

Supabase SQL Editor에서 실행:

```sql
-- 최근 생성된 Profile 확인
SELECT
  id,
  email,
  role,
  user_type,
  created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 5;
```

예상 결과:
- 방금 가입한 이메일이 `user_type='manager'`로 표시됨
- `created_at`이 현재 시간과 가까움

---

## 문제 해결

### "user_type 컬럼이 여전히 없다"는 에러
- `IMMEDIATE_FIX.sql` 재실행
- 실행 결과에서 "user_type column added" 메시지 확인

### "Database error saving new user" 여전히 발생
1. Auth 트리거가 삭제되었는지 확인:
   ```sql
   SELECT trigger_name
   FROM information_schema.triggers
   WHERE event_object_schema = 'auth'
     AND event_object_table = 'users';
   ```
   결과: 0 rows (비어있어야 함)

2. 만약 트리거가 여전히 존재하면:
   ```sql
   DROP TRIGGER IF EXISTS [트리거명] ON auth.users;
   ```

### "RLS policy already exists" 에러
- 정상입니다 (무시하세요)
- 이미 `DROP POLICY IF EXISTS`로 처리되어 있습니다

### "Permission denied" 에러
- Supabase Dashboard → Settings → Database → Connection pooling 확인
- `DIRECT_URL`이 올바른지 `.env` 파일 확인

---

## 다음 단계

수정이 완료되면 다음 작업을 진행하세요:

1. **장기 해결 방안 검토**: `AUTH_ERROR_DIAGNOSIS_REPORT.md` 읽기
2. **스키마 동기화**: `COMPLETE_MIGRATION.sql` 업데이트 완료 확인
3. **테스트**: E2E 테스트 실행
   ```bash
   npm run test:e2e -- tests/e2e/auth-signup.spec.ts
   ```

---

## 파일 위치

- 📄 **수정 SQL**: `C:\Users\tlduf\.cursor\projects\dev3_nomu\supabase\IMMEDIATE_FIX.sql`
- 📄 **종합 보고서**: `C:\Users\tlduf\.cursor\projects\dev3_nomu\AUTH_ERROR_DIAGNOSIS_REPORT.md`
- 📄 **업데이트된 통합 마이그레이션**: `C:\Users\tlduf\.cursor\projects\dev3_nomu\supabase\COMPLETE_MIGRATION.sql`

---

**예상 총 시간**: 5분
**필요한 도구**: Supabase Dashboard 접근 권한

**완료 시**: ✅ 회원가입 정상 작동
