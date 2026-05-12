# Vercel 배포 체크리스트

## 즉시 확인 사항

### 1. Vercel 환경 변수 설정 (필수)
Vercel 대시보드 → Settings → Environment Variables에서 다음 변수들을 **Production** 환경에 추가:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://...?pgbouncer=true
DIRECT_URL=postgresql://...?pgbouncer=false
```

**중요**: 환경 변수 추가/수정 후 반드시 Redeploy 필요!

### 2. 배포 후 즉시 테스트할 URL

#### API 엔드포인트
```bash
# 헬스체크 (데이터베이스 연결 확인)
curl https://dev3nomu.vercel.app/api/health

# 환경 변수 확인
curl https://dev3nomu.vercel.app/api/debug
```

#### 페이지 접근
브라우저에서 직접 접근:
- https://dev3nomu.vercel.app/
- https://dev3nomu.vercel.app/companies
- https://dev3nomu.vercel.app/sites
- https://dev3nomu.vercel.app/dashboard

### 3. 404 오류 발생 시 진단 순서

1. **빌드 로그 확인**
2. **/api/debug 응답 확인**
3. **Middleware 로그 확인**
4. **캐시 초기화 후 재배포**

## Git 커밋 & 푸시

```bash
git add .
git commit -m "fix: Vercel 배포 최적화 - 404 오류 해결"
git push origin db
```
