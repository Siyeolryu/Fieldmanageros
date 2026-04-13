# 카카오/네이버 OAuth 설정 가이드

## 1. 카카오 OAuth 설정

### 1.1 카카오 개발자 애플리케이션 생성
1. [카카오 개발자 콘솔](https://developers.kakao.com/) 접속
2. "내 애플리케이션" → "애플리케이션 추가하기" 클릭
3. 앱 이름, 사업자명 입력 후 저장

### 1.2 플랫폼 설정
1. 앱 선택 → "플랫폼" 탭
2. "Web 플랫폼 등록" 클릭
3. 사이트 도메인 입력:
   - 개발: `http://localhost:3000`
   - 프로덕션: `https://yourdomain.com`

### 1.3 Redirect URI 설정
1. "제품 설정" → "카카오 로그인" 선택
2. "Redirect URI" 등록:
   ```
   http://localhost:3000/auth/callback (개발)
   https://yourdomain.com/auth/callback (프로덕션)
   ```

### 1.4 동의 항목 설정
1. "제품 설정" → "카카오 로그인" → "동의항목"
2. 필수 동의 항목:
   - 닉네임
   - 프로필 사진
   - 카카오계정(이메일)

### 1.5 Supabase 설정
1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택 → "Authentication" → "Providers"
3. "Kakao" 활성화
4. 카카오 앱 설정에서 가져온 정보 입력:
   - **Client ID**: REST API 키 (Native 앱 키가 아님!)
   - **Client Secret**: 카카오 개발자 콘솔 → "제품 설정" → "카카오 로그인" → "보안" → "Client Secret" 코드 발급
   - **Redirect URL**: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
5. "Save" 클릭

### 1.6 카카오 앱 설정 최종 확인
1. "제품 설정" → "카카오 로그인" → "Redirect URI"에 Supabase 콜백 URL 추가:
   ```
   https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
   ```
2. "활성화 설정" → "ON"으로 변경

---

## 2. 네이버 OAuth 설정

### 2.1 네이버 개발자 애플리케이션 등록
1. [네이버 개발자 센터](https://developers.naver.com/main/) 접속
2. "Application" → "애플리케이션 등록" 클릭
3. 애플리케이션 정보 입력:
   - 애플리케이션 이름
   - 사용 API: 네이버 로그인
   - 제공 정보 선택: 이메일, 닉네임, 프로필 사진

### 2.2 서비스 URL 설정
1. **서비스 URL**:
   - 개발: `http://localhost:3000`
   - 프로덕션: `https://yourdomain.com`

### 2.3 Callback URL 설정
1. **Callback URL** 등록:
   ```
   http://localhost:3000/auth/callback
   https://yourdomain.com/auth/callback
   https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
   ```
   (3개 모두 등록)

### 2.4 Supabase 설정
1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택 → "Authentication" → "Providers"
3. "Naver" 찾아서 활성화
4. 네이버 앱 설정에서 가져온 정보 입력:
   - **Client ID**: 네이버 앱 정보의 "Client ID"
   - **Client Secret**: 네이버 앱 정보의 "Client Secret"
   - **Redirect URL**: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
5. "Save" 클릭

---

## 3. 환경 변수 설정 (이미 완료됨)

`.env.local` 파일에 이미 설정되어 있어야 합니다:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## 4. 테스트

1. 개발 서버 실행:
   ```bash
   npm run dev
   ```

2. 브라우저에서 접속:
   ```
   http://localhost:3000/auth/login
   ```

3. "카카오 로그인" 또는 "네이버 로그인" 버튼 클릭

4. OAuth 인증 후 `/dashboard`로 리다이렉트 확인

---

## 5. 문제 해결

### 카카오 로그인 오류
- **"redirect_uri mismatch"**: Redirect URI가 정확히 일치하는지 확인
- **"invalid_client"**: Client ID가 REST API 키인지 확인 (Native 앱 키 X)
- **"Client Secret 오류"**: 카카오 콘솔에서 Client Secret을 발급받았는지 확인

### 네이버 로그인 오류
- **"redirect_uri mismatch"**: 네이버 앱 설정의 Callback URL 3개 모두 등록했는지 확인
- **"invalid_client"**: Client ID와 Secret이 정확한지 확인
- **"서비스 URL 오류"**: 서비스 URL에 도메인만 입력 (경로 제외)

### Supabase 관련 오류
- **"provider not found"**: Supabase Dashboard에서 해당 프로바이더가 활성화되었는지 확인
- **"callback URL mismatch"**: Supabase 콜백 URL이 카카오/네이버 앱 설정에 등록되었는지 확인

---

## 6. 프로덕션 배포 시 체크리스트

- [ ] 카카오: 프로덕션 도메인을 플랫폼에 등록
- [ ] 카카오: 프로덕션 Redirect URI 등록
- [ ] 네이버: 프로덕션 서비스 URL 등록
- [ ] 네이버: 프로덕션 Callback URL 등록
- [ ] 환경 변수가 프로덕션 환경에 설정되어 있는지 확인
- [ ] HTTPS 사용 확인 (프로덕션은 HTTPS 필수)
