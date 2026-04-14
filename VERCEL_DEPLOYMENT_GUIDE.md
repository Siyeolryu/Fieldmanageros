# Vercel 배포 가이드

**프로젝트**: Field Manager OS (노무PRO)
**최종 업데이트**: 2026-04-14
**빌드 상태**: ✅ 성공

---

## 📊 빌드 결과 분석

### 번들 크기
```
총 공유 JS: 102 kB
미들웨어: 87.2 kB

주요 페이지:
- 메인 페이지: 230 kB (First Load JS)
- 급여 페이지: 209 kB
- 로그인: 170 kB
- 대시보드: 167 kB

API Routes: 221 B 각 (35개)
```

### 성능 지표
- ✅ 빌드 성공
- ✅ 37개 페이지 생성
- ✅ 35개 API Routes
- ⚠️ 보안 취약점: xlsx 라이브러리 (1 high severity)

---

## 🚀 1단계: Vercel 계정 및 CLI 설정

### 1.1 Vercel CLI 설치
```bash
npm install -g vercel
```

### 1.2 Vercel 로그인
```bash
vercel login
```

이메일 또는 GitHub 계정으로 로그인하세요.

---

## 🔗 2단계: 프로젝트 연결

### 2.1 프로젝트 링크
```bash
cd C:\Users\tlduf\.cursor\projects\dev3_nomu
vercel link
```

다음 질문에 답변하세요:
```
? Set up and deploy "dev3_nomu"? [Y/n] Y
? Which scope do you want to deploy to? <Your Team/Account>
? Link to existing project? [y/N] N
? What's your project's name? field-manager-os
? In which directory is your code located? ./
```

### 2.2 프로젝트 설정 확인
```bash
vercel project ls
```

---

## ⚙️ 3단계: 환경 변수 설정

### 3.1 Vercel Dashboard에서 설정

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. 프로젝트 선택: `field-manager-os`
3. Settings → Environment Variables 이동

### 3.2 필수 환경 변수

**Production 환경**:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (SECRET!)

# App
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://field-manager-os.vercel.app
NEXT_PUBLIC_APP_NAME=Field Manager OS
```

**중요**: `SUPABASE_SERVICE_ROLE_KEY`는 절대 public 환경 변수로 설정하지 마세요!

### 3.3 CLI로 환경 변수 설정 (대안)

```bash
# Production 환경에 환경 변수 추가
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# 값 입력: https://xxxxx.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# 값 입력: eyJ...

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# 값 입력: eyJ... (SECRET)

# 환경 변수 목록 확인
vercel env ls
```

---

## 🏗️ 4단계: 빌드 설정

### 4.1 Vercel Dashboard 설정

**Settings → General**:
- Framework Preset: `Next.js`
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm ci`
- Node.js Version: `20.x`

### 4.2 브랜치 설정

**Settings → Git**:
- Production Branch: `main`
- Preview Deployments: ✅ Enabled
- Automatic Preview Deployments: ✅ Enabled for all branches

---

## 🚢 5단계: 첫 배포 실행

### 5.1 Preview 배포 (테스트)
```bash
# 현재 브랜치를 preview로 배포
vercel

# 배포 완료 후 제공되는 URL 확인
# 예: https://field-manager-os-abc123.vercel.app
```

### 5.2 Production 배포
```bash
# 현재 상태 확인
git status
git add .
git commit -m "chore: Prepare for production deployment"
git push origin main

# Production 배포
vercel --prod
```

또는 GitHub 연동 자동 배포:
```bash
# main 브랜치에 푸시하면 자동 배포
git push origin main
```

---

## ✅ 6단계: 배포 후 검증

### 6.1 즉시 확인 (5분 내)
```bash
# Health Check API 확인
curl https://field-manager-os.vercel.app/api/health

# 예상 응답:
# {"status":"ok","timestamp":"2026-04-14T...","environment":"production"}
```

### 6.2 브라우저 테스트
1. 메인 페이지 접속: https://field-manager-os.vercel.app
2. 로그인 페이지: https://field-manager-os.vercel.app/auth/login
3. API 테스트: https://field-manager-os.vercel.app/api/companies
4. 콘솔 에러 확인 (F12 → Console)

### 6.3 기능 테스트
- [ ] 로그인/회원가입
- [ ] 회사 생성
- [ ] 현장 생성
- [ ] 근로자 등록
- [ ] 출근 기록
- [ ] 급여 계산

---

## 🔧 7단계: 도메인 설정 (선택)

### 7.1 커스텀 도메인 추가

1. Vercel Dashboard → Settings → Domains
2. "Add Domain" 클릭
3. 도메인 입력 (예: `fieldmanager.kr`)
4. DNS 레코드 설정:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
5. SSL 인증서 자동 발급 대기 (수 분 소요)

### 7.2 도메인 리다이렉트 설정
- `fieldmanager.kr` → `www.fieldmanager.kr` 리다이렉트 설정

---

## 📊 8단계: 모니터링 설정

### 8.1 Vercel Analytics 활성화
1. Dashboard → Analytics → Enable
2. Web Vitals 자동 수집 시작
3. 실시간 방문자 트래킹

### 8.2 로그 확인
```bash
# 실시간 로그
vercel logs

# 특정 배포 로그
vercel logs <deployment-url>
```

### 8.3 Vercel Dashboard에서 확인
- **Deployments**: 배포 히스토리
- **Analytics**: 성능 메트릭
- **Logs**: 에러 로그
- **Speed Insights**: 페이지 속도

---

## 🚨 9단계: 문제 해결

### 빌드 실패
```bash
# 로컬에서 빌드 테스트
npm run build

# 환경 변수 확인
vercel env ls

# 배포 재시도
vercel --prod --force
```

### API 에러 (500/401)
1. Supabase 연결 확인
   - URL과 Key가 올바른지 확인
   - Service Role Key가 production에만 설정되어 있는지 확인
2. RLS 정책 확인
   - Supabase Dashboard → Authentication → Policies
3. 로그 확인
   ```bash
   vercel logs --prod
   ```

### 사이트 접속 불가
1. DNS 전파 확인 (최대 48시간 소요)
   ```bash
   nslookup fieldmanager.kr
   ```
2. Vercel 상태 확인: https://www.vercel-status.com/
3. 롤백 고려
   ```bash
   vercel rollback
   ```

---

## 🔄 10단계: 롤백 절차

### Vercel Dashboard에서 롤백
1. Deployments 탭 이동
2. 이전 배포 선택
3. "Promote to Production" 클릭

### CLI로 롤백
```bash
# 최근 배포 목록 확인
vercel ls

# 특정 배포로 롤백
vercel rollback <deployment-url>
```

---

## 📝 체크리스트

### 배포 전
- [x] 로컬 빌드 성공 (`npm run build`)
- [ ] 환경 변수 설정 완료
- [ ] Supabase 프로젝트 생성
- [ ] GitHub 저장소 푸시 완료
- [ ] Vercel 계정 생성

### 배포 중
- [ ] Vercel 프로젝트 생성
- [ ] 환경 변수 설정
- [ ] Preview 배포 테스트
- [ ] Production 배포 실행

### 배포 후
- [ ] Health Check API 응답 확인
- [ ] 메인 페이지 로드 확인
- [ ] 로그인 기능 테스트
- [ ] API 응답 테스트
- [ ] 콘솔 에러 확인
- [ ] 모니터링 설정

---

## 🔗 유용한 링크

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel CLI Reference](https://vercel.com/docs/cli)

---

## 📞 지원

문제 발생 시:
1. [Vercel Community](https://vercel.com/community)
2. [GitHub Issues](https://github.com/Siyeolryu/Fieldmanageros/issues)
3. Vercel Support (Pro plan 이상)

---

**작성**: Claude Code
**프로젝트**: Field Manager OS
**버전**: 1.0.0
