# 🧪 Supabase 이메일 테스트 가이드

**작성일**: 2026-05-03
**목적**: 이메일 자동 발송 문제 해결

---

## 🚨 문제: 회원가입 시 이메일이 발송되지 않음

### 가능한 원인

1. ✅ **Enable email confirmations OFF** (가장 가능성 높음)
2. Email provider 비활성화
3. SMTP 설정 문제
4. Rate limit (하루 4개 제한)
5. 템플릿 오류

---

## ✅ 해결 방법 1: Email Confirmations 활성화

### Step 1: 설정 페이지 접속

**🔗 [Auth Configuration](https://supabase.com/dashboard/project/ejgsotsviobjfvfqovcj/settings/auth)**

### Step 2: 설정 확인 및 변경

페이지를 아래로 스크롤하여 **"Email"** 섹션 찾기:

```
User Signups
├─ Enable email confirmations: [토글]  ← 이것을 ON으로!
├─ Enable email change confirmations: [토글]
└─ Secure email change: [토글]
```

**현재 상태 확인**:
- OFF (회색): ❌ 이메일 발송 안 됨
- ON (파란색): ✅ 이메일 발송됨

**변경**:
```
Enable email confirmations: OFF → ON
```

### Step 3: 저장

**⚠️ 필수**: 페이지 하단의 **"Save"** 버튼 클릭!

---

## ✅ 해결 방법 2: Email Provider 확인

### Step 1: Providers 페이지 접속

**🔗 [Auth Providers](https://supabase.com/dashboard/project/ejgsotsviobjfvfqovcj/auth/providers)**

### Step 2: Email Provider 상태 확인

```
Providers 목록:
├─ Email: [Enabled] ✅  ← 이것이 활성화되어 있어야 함
├─ Kakao: [Enabled]
├─ Naver: [Enabled]
└─ ...
```

**Email이 Disabled면**:
1. Email 클릭
2. "Enable Email" 토글 ON
3. "Confirm email" 체크박스 ON
4. Save

---

## 🧪 Supabase에서 직접 테스트

설정 저장 후 Supabase에서 직접 테스트 이메일을 전송합니다.

### 방법 1: 사용자 초대 (추천)

**🔗 [Users 페이지](https://supabase.com/dashboard/project/ejgsotsviobjfvfqovcj/auth/users)**

1. 우측 상단 **"Invite user"** 버튼 클릭
2. 본인 이메일 주소 입력
3. **"Send invite"** 클릭
4. 1~2분 내 이메일 확인 (스팸함 포함!)

**이메일이 도착하면**: ✅ Supabase 이메일 설정 정상!
**이메일이 안 오면**: ❌ SMTP 문제 또는 Rate limit

---

### 방법 2: SQL로 직접 사용자 생성

**🔗 [SQL Editor](https://supabase.com/dashboard/project/ejgsotsviobjfvfqovcj/sql/new)**

```sql
-- 현재 Auth 설정 확인
SELECT
  name,
  value
FROM auth.config
WHERE name IN ('mailer_autoconfirm', 'external_email_enabled');

-- 결과 확인:
-- mailer_autoconfirm: false (이메일 확인 필요) ← 원하는 값
-- mailer_autoconfirm: true (자동 확인) ← 이메일 안 보냄!
```

**mailer_autoconfirm이 true면**:
```sql
-- false로 변경
UPDATE auth.config
SET value = 'false'
WHERE name = 'mailer_autoconfirm';
```

---

## 🔍 디버깅: API 응답 확인

브라우저 개발자 도구에서 확인:

### 1) 개발자 도구 열기
```
F12 또는 Ctrl+Shift+I
```

### 2) Network 탭 선택

### 3) 회원가입 시도

### 4) API 응답 확인
```
요청: POST /api/auth/quick-signup
응답:
{
  "success": true,
  "requiresEmailConfirmation": true,  ← true면 이메일 발송됨!
  "requiresEmailConfirmation": false, ← false면 자동 로그인
  "autoSignedIn": true,               ← true면 이메일 안 보냄
  "debugInfo": { ... }
}
```

**requiresEmailConfirmation: false면**:
→ Supabase 이메일 확인이 비활성화되어 있음!

---

## 🔧 Rate Limit 확인

Supabase 기본 SMTP는 **하루 4개 제한**입니다.

### 확인 방법

**🔗 [Project Settings](https://supabase.com/dashboard/project/ejgsotsviobjfvfqovcj/settings/general)**

**Logs** → **Auth Logs** 에서 확인:
```
최근 이메일 전송 기록 확인
오늘 4개 이상 전송했다면 내일까지 대기
```

### 해결 방법

**Option 1**: 내일까지 대기
**Option 2**: Gmail SMTP로 전환 (하루 500개)

---

## 📊 체크리스트

설정을 완료했는지 확인하세요:

### Supabase 설정
- [ ] Enable email confirmations: ON
- [ ] Email provider: Enabled
- [ ] Confirm email: Checked
- [ ] 설정 저장: Save 버튼 클릭

### 테스트
- [ ] Supabase "Invite user"로 테스트 이메일 전송
- [ ] 1~2분 내 이메일 도착 확인 (스팸함 포함)
- [ ] 앱에서 회원가입 재시도
- [ ] API 응답에서 requiresEmailConfirmation: true 확인

### 문제 해결
- [ ] Rate limit 확인 (하루 4개 초과 여부)
- [ ] SQL로 mailer_autoconfirm 확인
- [ ] 브라우저 개발자 도구에서 API 응답 확인

---

## 🚀 다음 단계

**이메일이 정상 발송되면**:
1. ✅ 앱 테스트 완료
2. ✅ Vercel 배포
3. ✅ 프로덕션 테스트

**계속 안 되면**:
1. Gmail SMTP 설정
2. Supabase Support 문의

---

**문제가 해결되면 이 파일 삭제해주세요!**
