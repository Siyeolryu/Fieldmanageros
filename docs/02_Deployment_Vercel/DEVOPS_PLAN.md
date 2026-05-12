# 🚀 노무Pro 배포 및 DevOps 가이드

이 문서는 GitHub 저장소 연동, Vercel 배포, 그리고 Supabase 네트워크 설정을 위한 상세 가이드를 제공합니다.

---

## 1. 📦 GitHub 저장소 준비
- **저장소 주소**: `https://github.com/Siyeolryu/Fieldmanageros`
- **준비 사항**:
  - `.gitignore` 파일에 `.env` 및 `.env.local`이 포함되어 있는지 확인 (완료)
  - `main` 브랜치에 최종 코드 푸시

## 2. ⚡ Vercel 배포 설정
프로젝트를 Vercel에 연결할 때 아래 환경 변수를 반드시 설정해야 합니다.

### 필수 환경 변수 (Environment Variables)
| 변수명 | 값 설명 | 비고 |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://...:password%21%21@...:6543/...` | 비밀번호 특수문자 인코딩 필수 |
| `DIRECT_URL` | `postgresql://...:password%21%21@...:5432/...` | 마이그레이션용 직접 연결 |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 익명 키 (Anon Key) | |

> [!CAUTION]
> **비밀번호 인코딩**: Supabase 비밀번호에 `!!`가 포함된 경우, URL 내에서는 반드시 `%21%21`로 입력해야 Prisma가 정상적으로 인식합니다.

## 3. 🛡️ Supabase 네트워크 설정 (IP Allowlisting)
Vercel에서 배포된 앱이 Supabase DB에 접근할 수 있도록 허용해야 합니다.

### 가이드 Steps:
1.  **Supabase 대시보드** 접속
2.  **Project Settings** > **Database** 메뉴 이동
3.  **Network Restrictions** 섹션 찾기
4.  **Allow all IP addresses** (0.0.0.0/0)를 추가하거나, Vercel의 통합 기능을 사용하여 보안 연결 설정
    - *참고: Vercel은 유동 IP를 사용하므로, 일반적으로 0.0.0.0/0 허용이나 Supabase-Vercel Integration 사용을 권장합니다.*

## 4. 🛠️ 빌드 최적화 (vercel.json)
Next.js 15와 Prisma를 사용하는 경우, 빌드 시 Prisma Client가 생성되도록 설정되어 있어야 합니다. (현재 `package.json`의 `postinstall`에 포함됨)

## 5. 📱 향후 모바일 앱(AOS/iOS) 확장 로드맵
- **API 서버 구조**: 현재의 Next.js API Routes를 그대로 모바일 앱의 백엔드로 활용 가능
- **CORS 설정**: 향후 모바일 앱 통신을 위해 `next.config.ts`에서 특정 Origin 또는 모든 Origin에 대한 허용 설정 필요
- **인증**: Supabase Auth는 모바일 SDK를 지원하므로 동일한 사용자 세션 관리 체계 유지 가능

---
*작성일: 2026-04-12*
*작성자: Antigravity AI Assistant*
