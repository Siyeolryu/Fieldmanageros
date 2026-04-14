# GitHub Secrets 설정 가이드

**프로젝트**: Field Manager OS (노무PRO)
**최종 업데이트**: 2026-04-14

---

## 📌 개요

GitHub Secrets는 CI/CD 파이프라인에서 사용되는 민감한 정보를 안전하게 저장하는 기능입니다. Vercel 자동 배포와 GitHub Actions를 위해 필요합니다.

---

## 🔐 1단계: GitHub Repository Secrets 추가

### 1.1 Secrets 페이지 접속

1. GitHub 저장소 접속: https://github.com/Siyeolryu/Fieldmanageros
2. Settings 탭 클릭
3. 왼쪽 사이드바 → Secrets and variables → Actions 클릭

### 1.2 필수 Secrets 추가

다음 Secrets를 **New repository secret** 버튼으로 추가하세요:

#### Supabase Secrets

**NEXT_PUBLIC_SUPABASE_URL**
```
Name: NEXT_PUBLIC_SUPABASE_URL
Secret: https://xxxxx.supabase.co
```
- Supabase Dashboard → Project Settings → API에서 확인
- 예: https://abcdefghijk.supabase.co

**NEXT_PUBLIC_SUPABASE_ANON_KEY**
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Secret: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- Supabase Dashboard → Project Settings → API → anon public
- 매우 긴 문자열 (약 200자)

**SUPABASE_SERVICE_ROLE_KEY**
```
Name: SUPABASE_SERVICE_ROLE_KEY
Secret: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- Supabase Dashboard → Project Settings → API → service_role
- ⚠️ **매우 중요**: 절대 public에 노출되면 안 됩니다!
- RLS를 우회하는 권한을 가지고 있습니다

#### Claude AI Secrets

**ANTHROPIC_API_KEY**
```
Name: ANTHROPIC_API_KEY
Secret: sk-ant-api03-...
```
- Anthropic Console에서 발급: https://console.anthropic.com/
- AI 기능(공사비 역산, 자동 분석 등)에 사용
- ⚠️ **중요**: 절대 클라이언트에 노출되면 안 됩니다

**ANTHROPIC_MODEL** (선택)
```
Name: ANTHROPIC_MODEL
Secret: claude-3-5-sonnet-20241022
```
- 사용할 Claude 모델 지정

#### Vercel CI/CD Secrets (선택)

**VERCEL_TOKEN**
```
Name: VERCEL_TOKEN
Secret: xxxxxxxxxxxxxxxxxxxxxxxxxxx
```
- Vercel Dashboard → Settings → Tokens → Create Token
- Scope: Full Access (또는 프로젝트별 제한)

**VERCEL_ORG_ID**
```
Name: VERCEL_ORG_ID
Secret: team_xxxxxxxxxxxxxxxxxxxx
```
- Vercel Dashboard → Settings → General → Team ID
- 또는 `.vercel/project.json` 파일에서 확인

**VERCEL_PROJECT_ID**
```
Name: VERCEL_PROJECT_ID
Secret: prj_xxxxxxxxxxxxxxxxxxxx
```
- Vercel Dashboard → Project Settings → General → Project ID
- 또는 `.vercel/project.json` 파일에서 확인

---

## 🔍 2단계: Secrets 확인

### 2.1 추가된 Secrets 확인
Settings → Secrets and variables → Actions → Repository secrets

다음 목록이 보여야 합니다:
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
- ✅ SUPABASE_SERVICE_ROLE_KEY
- ✅ VERCEL_TOKEN (선택)
- ✅ VERCEL_ORG_ID (선택)
- ✅ VERCEL_PROJECT_ID (선택)

### 2.2 Secrets 값 확인 불가
- GitHub은 보안상 Secrets 값을 다시 표시하지 않습니다
- 값을 잊어버린 경우 Supabase/Vercel에서 다시 확인 후 업데이트하세요

---

## 🔒 3단계: Branch Protection Rules 설정

### 3.1 Main 브랜치 보호
1. Settings → Branches → Add rule
2. Branch name pattern: `main`
3. 다음 옵션 활성화:
   - ✅ Require a pull request before merging
   - ✅ Require approvals (최소 1명)
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Include administrators (팀 프로젝트인 경우)

### 3.2 Status Checks 설정
- ✅ lint (ESLint)
- ✅ typecheck (TypeScript)
- ✅ build (Next.js Build)

이 설정으로 main 브랜치에 직접 push가 금지되고, PR을 통해서만 merge 가능합니다.

---

## ⚙️ 4단계: GitHub Actions Workflow 확인

### 4.1 Workflow 파일 확인
`.github/workflows/ci.yml` 파일이 존재하는지 확인:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, staging, db]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx tsc --noEmit

  build:
    runs-on: ubuntu-latest
    needs: [lint, typecheck]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
```

### 4.2 Workflow 테스트
```bash
# PR 생성 시 자동 실행됨
git checkout -b test-ci
git push origin test-ci

# GitHub에서 Pull Request 생성
# Actions 탭에서 Workflow 실행 확인
```

---

## 🚀 5단계: Vercel 자동 배포 설정 (선택)

### 5.1 Vercel GitHub App 연동

1. Vercel Dashboard → Settings → Git
2. Connect GitHub Repository 클릭
3. `Siyeolryu/Fieldmanageros` 선택
4. Production Branch: `main` 설정

### 5.2 자동 배포 트리거
```bash
# main 브랜치에 push하면 자동 배포
git push origin main
```

Vercel이 자동으로:
1. 코드 체크아웃
2. npm ci 실행
3. npm run build 실행
4. 배포 및 URL 생성

---

## 🔄 6단계: Secrets 관리

### 6.1 Secrets 업데이트
1. Settings → Secrets and variables → Actions
2. Secret 이름 클릭
3. "Update secret" 버튼
4. 새 값 입력 후 저장

### 6.2 Secrets 삭제
1. Settings → Secrets and variables → Actions
2. Secret 이름 클릭
3. "Remove secret" 버튼
4. 확인

### 6.3 Secrets 로테이션 (권장)
- **Service Role Key**: 6개월마다 교체
- **Anon Key**: 1년마다 교체
- **Vercel Token**: 1년마다 교체

교체 절차:
1. Supabase/Vercel에서 새 키 생성
2. GitHub Secrets 업데이트
3. Vercel 환경 변수 업데이트
4. 이전 키 무효화

---

## 🛡️ 7단계: 보안 체크

### 7.1 Secrets 누출 확인
```bash
# 코드에 하드코딩된 Secrets 검색
git grep -i "supabase.*key"
git grep -i "vercel.*token"

# .env 파일이 .gitignore에 있는지 확인
git check-ignore .env .env.local
```

### 7.2 Commit History 검사
```bash
# Secrets가 커밋 히스토리에 포함되어 있는지 확인
git log -p | grep -i "supabase.*key"
```

만약 발견되면:
1. Secrets를 즉시 무효화
2. 새로운 Secrets 생성
3. Git history에서 제거 (BFG Repo-Cleaner 사용)

### 7.3 GitHub Secret Scanning
- GitHub는 자동으로 public repository를 스캔합니다
- Secret이 발견되면 알림을 받게 됩니다
- 즉시 대응하세요

---

## 📝 체크리스트

### Secrets 설정
- [ ] NEXT_PUBLIC_SUPABASE_URL 추가
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY 추가
- [ ] SUPABASE_SERVICE_ROLE_KEY 추가
- [ ] VERCEL_TOKEN 추가 (선택)
- [ ] VERCEL_ORG_ID 추가 (선택)
- [ ] VERCEL_PROJECT_ID 추가 (선택)

### Branch Protection
- [ ] Main 브랜치 보호 규칙 설정
- [ ] PR 필수화
- [ ] Status checks 필수화

### 보안
- [ ] .env 파일 .gitignore 확인
- [ ] Commit history 검사 완료
- [ ] Secrets 로테이션 일정 수립

---

## 🚨 문제 해결

### Workflow 실패: Secrets not found
```
Error: NEXT_PUBLIC_SUPABASE_URL is not defined
```

**해결**:
1. GitHub Secrets에 해당 Secret이 추가되어 있는지 확인
2. Secret 이름이 정확한지 확인 (대소문자 구분)
3. Workflow 파일에서 `${{ secrets.SECRET_NAME }}` 형식이 올바른지 확인

### Workflow 실패: Build error
```
Error: Failed to compile
```

**해결**:
1. 로컬에서 `npm run build` 테스트
2. 환경 변수가 올바르게 설정되어 있는지 확인
3. `.github/workflows/ci.yml`에서 env 섹션 확인

### Secrets 노출됨
1. **즉시 무효화**: Supabase/Vercel에서 즉시 키 재생성
2. **GitHub Secrets 업데이트**: 새 키로 교체
3. **Vercel 환경 변수 업데이트**: 새 키로 교체
4. **Git History 정리**: BFG Repo-Cleaner 사용
5. **팀 공지**: 팀원들에게 알림

---

## 🔗 유용한 링크

- [GitHub Secrets 문서](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [GitHub Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [Vercel CI/CD](https://vercel.com/docs/deployments/git)
- [Supabase API Keys](https://supabase.com/docs/guides/api/api-keys)

---

**작성**: Claude Code
**프로젝트**: Field Manager OS
**버전**: 1.0.0
