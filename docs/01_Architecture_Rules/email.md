# 노무PRO 이메일 설정 가이드

## 📧 Supabase 이메일 템플릿 설정

### 1. Supabase 대시보드 접속

1. [Supabase Dashboard](https://app.supabase.com) 접속
2. 프로젝트 선택
3. 좌측 메뉴에서 **Authentication** → **Email Templates** 클릭

### 2. Confirm Signup 템플릿 설정

**템플릿 선택**: `Confirm signup`

#### 제목 (Subject)

```
[노무PRO] 이메일 인증을 완료해주세요 ✨
```

#### 본문 (Body)

`email-templates/confirm-signup.html` 파일의 내용을 복사하여 붙여넣습니다.

**중요**: Supabase에서는 다음 변수들을 자동으로 치환합니다:
- `{{ .ConfirmationURL }}` - 이메일 인증 URL
- `{{ .Token }}` - 인증 토큰
- `{{ .Email }}` - 사용자 이메일
- `{{ .SiteURL }}` - 사이트 URL

### 3. 기타 이메일 템플릿

#### Invite User (사용자 초대)

**제목**:
```
[노무PRO] 현장 관리 시스템에 초대되었습니다
```

#### Magic Link (매직 링크 로그인)

**제목**:
```
[노무PRO] 로그인 링크가 도착했습니다
```

#### Change Email Address (이메일 주소 변경)

**제목**:
```
[노무PRO] 이메일 주소 변경 확인
```

#### Reset Password (비밀번호 재설정)

**제목**:
```
[노무PRO] 비밀번호 재설정 요청
```

## 🎨 이메일 디자인 가이드라인

### 브랜드 컬러
- **Primary Blue**: `#2563eb` (gradient to `#4f46e5`)
- **Accent Yellow**: `#fbbf24`
- **Text Dark**: `#1e293b`
- **Text Gray**: `#475569`

### 폰트
- **로고**: 900 weight, 32px
- **제목**: 700 weight, 24px
- **본문**: 400 weight, 16px

### 레이아웃
- **최대 너비**: 600px
- **여백**: 24px ~ 48px
- **모서리**: 8px ~ 12px border-radius

## ⚙️ Supabase 인증 설정

### 이메일 확인 활성화/비활성화

**경로**: Authentication → Settings → Email Auth

1. **이메일 확인 필수** (권장):
   ```
   Enable email confirmations: ON
   ```
   - 보안성 향상
   - 유효한 이메일 주소 확인
   - 스팸 가입 방지

2. **이메일 확인 비활성화** (빠른 테스트용):
   ```
   Enable email confirmations: OFF
   ```
   - 즉시 가입 후 로그인 가능
   - 개발/테스트 환경에서만 사용

### Redirect URLs 설정

**경로**: Authentication → URL Configuration

**Site URL**:
```
https://your-domain.com
```

**Redirect URLs** (허용할 콜백 URL들):
```
http://localhost:3000/auth/callback
https://your-domain.com/auth/callback
https://dev3nomu-*.vercel.app/auth/callback
```

## 🔧 백엔드 API 개선사항

### `/api/auth/quick-signup` 엔드포인트

#### 주요 기능
1. **이메일 유효성 검증**
2. **임시 비밀번호 자동 생성**
3. **사용자 메타데이터 추가**:
   - `quick_signup: true`
   - `needs_password_setup: true`
   - `signup_source: 'landing_page'`
   - `signup_timestamp: ISO 8601`

4. **응답 처리**:
   - 이메일 확인 필요 시: `requiresEmailConfirmation: true`
   - 자동 로그인 성공 시: `autoSignedIn: true`

#### 에러 처리
- 이메일 중복: 409 Conflict
- 잘못된 이메일: 400 Bad Request
- 서버 오류: 500 Internal Server Error

## 📱 프론트엔드 통합

### 회원가입 후 처리

```typescript
const res = await fetch('/api/auth/quick-signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email })
})

const data = await res.json()

if (data.requiresEmailConfirmation) {
  // 이메일 확인 안내 페이지로 이동
  router.push('/auth/confirm-email')
} else if (data.autoSignedIn) {
  // 대시보드로 이동
  router.push('/home')
}
```

### 이메일 확인 대기 페이지 (권장)

`/app/auth/confirm-email/page.tsx` 생성:
- 이메일 전송 완료 메시지
- 이메일 재전송 버튼
- 스팸 폴더 확인 안내
- 고객 지원 연락처

## 🚀 배포 체크리스트

- [ ] Supabase 이메일 템플릿 업데이트
- [ ] 이메일 확인 활성화 설정
- [ ] Redirect URLs 등록
- [ ] 환경변수 설정 확인:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- [ ] 테스트 이메일 발송 확인
- [ ] 스팸 필터 테스트

## 🧪 테스트 방법

### 1. 로컬 테스트
```bash
npm run dev
```

1. http://localhost:3000 접속
2. 이메일 주소 입력하여 가입
3. Supabase Dashboard → Authentication → Users에서 확인
4. 이메일 수신 확인 (개발 환경에서는 Supabase Inbucket 사용)

### 2. Inbucket (개발용 메일함)

**접속**: Supabase Dashboard → Project Settings → API → Email Testing

개발 중에는 실제 이메일 대신 Inbucket으로 전송됩니다.

### 3. 프로덕션 테스트

1. 실제 이메일 주소로 가입
2. 메일함 확인 (스팸 폴더 포함)
3. 인증 링크 클릭
4. 대시보드 접근 확인

## 📊 모니터링

### Supabase Logs

**경로**: Logs → Auth Logs

확인 사항:
- 회원가입 이벤트
- 이메일 발송 로그
- 인증 완료 로그
- 에러 발생 시 상세 내용

## 🆘 문제 해결

### 이메일이 도착하지 않는 경우

1. **스팸 폴더 확인**
2. **Supabase SMTP 설정 확인**:
   - Project Settings → Auth → SMTP Settings
   - 커스텀 SMTP 서버 설정 권장 (SendGrid, AWS SES 등)

3. **이메일 발송 로그 확인**:
   - Supabase Dashboard → Logs → Auth Logs

### 인증 링크가 만료된 경우

- 기본 만료 시간: 24시간
- 설정 경로: Authentication → Settings → Email Auth → Confirmation expiry

### 개발 환경에서 이메일 확인 건너뛰기

`.env.local` 파일에 추가:
```bash
# Supabase 대시보드에서 이메일 확인 비활성화 필요
NEXT_PUBLIC_SKIP_EMAIL_VERIFICATION=true
```

## 📚 참고 자료

- [Supabase Email Templates Guide](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Supabase SMTP Setup](https://supabase.com/docs/guides/auth/auth-smtp)
- [Email Design Best Practices](https://www.emailonacid.com/blog/article/email-development/email-development-best-practices/)

---

**마지막 업데이트**: 2026-04-19
