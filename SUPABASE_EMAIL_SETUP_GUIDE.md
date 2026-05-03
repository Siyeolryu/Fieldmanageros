# 📧 Supabase 이메일 설정 가이드

**프로젝트**: 노무PRO
**프로젝트 ID**: `ejgsotsviobjfvfqovcj`
**작성일**: 2026-05-03

---

## 🎯 목표

회원가입 시 이메일 인증 메일이 자동으로 발송되도록 Supabase 설정하기

---

## 📋 Step 1: 이메일 확인 활성화

### 1.1 Authentication 설정으로 이동

**링크**: https://supabase.com/dashboard/project/ejgsotsviobjfvfqovcj/auth/providers

또는:
1. Supabase Dashboard 접속
2. 프로젝트 `ejgsotsviobjfvfqovcj` 선택
3. 왼쪽 메뉴: **Authentication** → **Providers**

### 1.2 Email Provider 확인

- **Email** 프로바이더가 **Enabled** 상태인지 확인
- 비활성화되어 있다면 **Enable** 클릭

---

## 📧 Step 2: 이메일 확인(Email Confirmation) 활성화

### 2.1 Email 설정으로 이동

**링크**: https://supabase.com/dashboard/project/ejgsotsviobjfvfqovcj/auth/settings

또는:
1. 왼쪽 메뉴: **Authentication** → **Settings**
2. **Email** 섹션 찾기

### 2.2 이메일 확인 옵션 활성화

다음 옵션들을 확인하세요:

- ✅ **Enable email confirmations**: **ON** (중요!)
- ✅ **Enable email change confirmations**: ON (권장)
- ✅ **Secure email change**: ON (권장)

### 2.3 Confirm email 설정

- **Confirm email** 필드가 `template://confirm_email` 로 설정되어 있는지 확인

---

## 📬 Step 3: SMTP 설정 (이메일 발송 서버)

### Option A: Supabase 기본 SMTP 사용 (테스트용)

**장점**:
- 설정 불필요
- 즉시 사용 가능

**단점**:
- 하루 최대 4개 이메일 제한
- 프로덕션 환경에는 부적합

**설정 방법**: 아무것도 하지 않으면 기본 SMTP가 사용됩니다.

---

### Option B: Gmail SMTP 설정 (권장 - 프로덕션)

**장점**:
- 하루 500개 이메일 전송 가능 (Gmail 무료 계정)
- 안정적인 발송률
- 무료

**설정 방법**:

#### B-1. Gmail 앱 비밀번호 생성

1. Google 계정 설정: https://myaccount.google.com/
2. 보안 → 2단계 인증 **활성화** (필수)
3. 앱 비밀번호 생성: https://myaccount.google.com/apppasswords
4. 앱 선택: **메일**
5. 기기 선택: **기타 (맞춤 이름)** → "노무PRO" 입력
6. **생성** 클릭
7. 16자리 비밀번호 복사 (예: `abcd efgh ijkl mnop`)

#### B-2. Supabase SMTP 설정

**링크**: https://supabase.com/dashboard/project/ejgsotsviobjfvfqovcj/settings/auth

또는:
1. **Settings** → **Configuration** → **SMTP Settings**

**입력 정보**:
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP Username: your-email@gmail.com (실제 Gmail 주소)
SMTP Password: abcd efgh ijkl mnop (앱 비밀번호 - 공백 제거)
Sender Email: your-email@gmail.com
Sender Name: 노무PRO
```

**보안**:
- Enable TLS: ✅ ON
- Enable STARTTLS: ✅ ON

**저장**: **Save** 클릭

---

## 📝 Step 4: 이메일 템플릿 설정 (한국어 커스터마이징)

### 4.1 템플릿 편집 페이지로 이동

**링크**: https://supabase.com/dashboard/project/ejgsotsviobjfvfqovcj/auth/templates

또는:
1. **Authentication** → **Email Templates**

### 4.2 "Confirm signup" 템플릿 수정

**현재 기본 템플릿** (영어):
```html
<h2>Confirm your signup</h2>

<p>Follow this link to confirm your user:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your mail</a></p>
```

**수정할 한국어 템플릿** (복사해서 붙여넣기):
```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>이메일 인증</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans KR', sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2563EB 0%, #4F46E5 100%); padding: 40px 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 900;">노무PRO</h1>
              <p style="margin: 8px 0 0; color: #E0E7FF; font-size: 14px;">건설 현장 노무 관리 플랫폼</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px 32px;">
              <h2 style="margin: 0 0 16px; color: #111827; font-size: 24px; font-weight: 700;">이메일 주소를 인증해주세요</h2>

              <p style="margin: 0 0 24px; color: #6B7280; font-size: 16px; line-height: 1.6;">
                안녕하세요,<br>
                노무PRO 회원가입을 환영합니다!
              </p>

              <p style="margin: 0 0 32px; color: #6B7280; font-size: 16px; line-height: 1.6;">
                아래 버튼을 클릭하여 이메일 주소를 인증하고 서비스를 시작하세요.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 0 0 32px;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: linear-gradient(135deg, #2563EB 0%, #4F46E5 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
                      ✉️ 이메일 인증하기
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Alternative Link -->
              <p style="margin: 0 0 8px; color: #9CA3AF; font-size: 14px; line-height: 1.5;">
                버튼이 작동하지 않으면 아래 링크를 복사하여 브라우저에 붙여넣으세요:
              </p>
              <p style="margin: 0 0 32px; padding: 12px; background-color: #F3F4F6; border-radius: 8px; word-break: break-all; font-size: 12px; color: #6B7280; font-family: 'Courier New', monospace;">
                {{ .ConfirmationURL }}
              </p>

              <!-- Info Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FEF3C7; border-radius: 12px; border-left: 4px solid #F59E0B; padding: 16px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px; color: #92400E; font-size: 14px; font-weight: 700;">
                      ⚠️ 본인이 가입하지 않으셨나요?
                    </p>
                    <p style="margin: 0; color: #78350F; font-size: 13px; line-height: 1.5;">
                      본인이 요청하지 않은 이메일이라면 무시하셔도 됩니다. 이 링크는 24시간 후 만료됩니다.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F9FAFB; padding: 24px 32px; border-top: 1px solid #E5E7EB; text-align: center;">
              <p style="margin: 0 0 8px; color: #9CA3AF; font-size: 12px;">
                이 이메일은 자동 발송되었습니다. 회신하지 마세요.
              </p>
              <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                © 2026 노무PRO. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

**저장**: **Save** 클릭

---

## 🧪 Step 5: 테스트

### 5.1 테스트 이메일 전송

**방법 1: Supabase Dashboard에서 직접 테스트**
1. **Authentication** → **Users** → **Invite user**
2. 테스트 이메일 입력 (본인 이메일)
3. **Send invite** 클릭
4. 이메일 수신 확인 (5분 이내)

**방법 2: 실제 회원가입 플로우 테스트**
1. 개발 서버 실행: `npm run dev`
2. http://localhost:3000 접속
3. 테스트 이메일로 회원가입 시도
4. 이메일 수신 확인

### 5.2 빠른 인증 체크리스트 (한국 사용자 맞춤)

**즉각 반응 확인** (0~30초):
- [ ] **0~5초**: "이메일 전송 중..." → "전송 완료!" 메시지 표시
- [ ] **카운트다운**: 30초 타이머가 실시간으로 감소하는지 확인
- [ ] **10초 후**: 스팸 메일함 확인 안내가 자동으로 나타나는지 확인
- [ ] **30초 이내**: 실제 이메일 도착 (정상 케이스)
- [ ] **30초 경과**: "지금 바로 다시 보내기" 버튼이 자동으로 강조 표시

**이메일 수신 확인**:
- [ ] Gmail/Naver "스팸 메일함 바로 열기" 링크가 작동하는지 확인
- [ ] 이메일 템플릿이 한국어로 표시되는가?
- [ ] "✉️ 이메일 인증하기" 버튼이 눈에 잘 띄는가?

**인증 플로우**:
- [ ] 인증 링크 클릭 시 정상 작동하는가?
- [ ] 백그라운드 자동 체크가 작동하는가? (5초마다 폴링)
- [ ] 인증 완료 시 자동으로 /home으로 이동하는가?
- [ ] "인증 완료! 환영합니다 🎉" 토스트 메시지가 표시되는가?

**재전송 기능**:
- [ ] 재전송 버튼 클릭 시 즉시 반응하는가?
- [ ] 재전송 성공 시 카운트다운 타이머가 리셋되는가?
- [ ] 재전송 성공 토스트가 표시되는가?

---

## ⚠️ 문제 해결 (Troubleshooting)

### 이메일이 오지 않을 때

**1. Supabase 로그 확인**
- **Logs** → **Database** 또는 **Edge Functions**
- Auth 관련 에러 메시지 확인

**2. SMTP 연결 테스트**
```bash
# Gmail SMTP 연결 테스트 (옵션)
telnet smtp.gmail.com 587
```

**3. 이메일 확인 설정 재확인**
- **Authentication** → **Settings**
- "Enable email confirmations"이 **ON**인지 확인

**4. Supabase Support 문의**
- https://supabase.com/dashboard/support
- 프로젝트 ID: `ejgsotsviobjfvfqovcj`

---

## 📊 설정 완료 확인

모든 설정이 완료되면 다음을 확인하세요:

```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 테스트
# 1. http://localhost:3000 접속
# 2. 회원가입 시도
# 3. 이메일 수신 확인
# 4. 인증 링크 클릭
# 5. 자동 로그인 확인
```

---

## 🎯 다음 단계

이메일 설정이 완료되면:

1. **Vercel 배포 환경 변수 업데이트**
   - Vercel Dashboard에서 환경 변수 확인
   - 이메일 관련 설정은 Supabase에서 관리되므로 추가 환경 변수 불필요

2. **프로덕션 테스트**
   - https://dev3nomu.vercel.app에서 회원가입 테스트
   - 실제 사용자 시나리오 검증

3. **모니터링**
   - Supabase Dashboard → **Authentication** → **Users**
   - 신규 가입자 확인
   - 이메일 인증률 모니터링

---

**설정 완료 시간**: 약 10-15분
**난이도**: ⭐⭐☆☆☆ (쉬움)

행운을 빕니다! 🚀
