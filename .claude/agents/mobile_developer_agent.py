"""
Mobile Developer Agent
AOS(Android) 및 iOS 앱 개발을 담당하는 AI 에이전트
"""

import asyncio
from typing import Optional, Dict, Any, List
from claude_agent_sdk import query, ClaudeAgentOptions, ResultMessage, AssistantMessage


class MobileDeveloperAgent:
    """Mobile Developer Agent - AOS/iOS 앱 개발 전문가"""

    def __init__(self):
        self.name = "Mobile Developer Agent"
        self.description = "AOS(Android) 및 iOS 네이티브 앱 개발"

    async def convert_to_mobile_app(
        self,
        platform: str,  # "android", "ios", "both"
        current_tech: str = "HTML/JavaScript",
        requirements: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        웹앱을 모바일 앱으로 전환

        Args:
            platform: 타겟 플랫폼 (android, ios, both)
            current_tech: 현재 기술 스택
            requirements: 추가 요구사항

        Returns:
            모바일 앱 전환 계획 및 구현 가이드
        """

        platform_text = {
            "android": "Android (Kotlin/Java)",
            "ios": "iOS (Swift/SwiftUI)",
            "both": "Android & iOS (Cross-platform)"
        }.get(platform, "both")

        reqs_text = "\n".join([f"- {r}" for r in requirements]) if requirements else "없음"

        prompt = f"""
당신은 Field Manager OS의 **Mobile Developer**입니다.
현재 HTML/JavaScript 기반 웹앱을 모바일 네이티브 앱으로 전환하는 전문가입니다.

## 프로젝트 정보
- **현재 기술**: {current_tech} (Tailwind CSS, ExcelJS, jsPDF)
- **타겟 플랫폼**: {platform_text}
- **앱 유형**: 건설 현장 일용직 출근 관리 시스템

## 추가 요구사항
{reqs_text}

## 수행할 작업

### 1. 모바일 앱 전환 전략 제안
다음 3가지 옵션을 비교 분석하세요:

#### Option A: WebView 기반 (Capacitor/Cordova)
- **장점**: 기존 HTML/JS 코드 90% 재사용, 빠른 개발
- **단점**: 성능 제한, 네이티브 UX 부족
- **적합성**: MVP, 빠른 출시

#### Option B: React Native
- **장점**: 크로스플랫폼, 네이티브 성능, 커뮤니티
- **단점**: JavaScript 의존성, 일부 네이티브 코드 필요
- **적합성**: 균형잡힌 선택

#### Option C: 완전 네이티브 (Kotlin/Swift)
- **장점**: 최고 성능, 네이티브 UX, 플랫폼 최적화
- **단점**: 개발 시간, 중복 코드 (AOS/iOS 각각)
- **적합성**: 프리미엄 앱 경험

**추천 전략**을 선정하고 이유를 설명하세요.

### 2. 아키텍처 설계

#### 2.1 앱 구조
```
Field Manager Mobile/
├── src/
│   ├── screens/          # 화면 (달력, 명세서, 설정)
│   ├── components/       # 재사용 컴포넌트
│   ├── services/         # API, 로컬 DB
│   ├── utils/            # 헬퍼 함수
│   └── assets/           # 이미지, 폰트
├── android/              # Android 네이티브 코드
├── ios/                  # iOS 네이티브 코드
└── package.json
```

#### 2.2 핵심 기능 매핑
현재 웹앱 기능을 모바일로 어떻게 구현할지:
- 달력 UI → 네이티브 캘린더 위젯
- 출근 기록 → 로컬 DB (SQLite/Realm) + 클라우드 동기화
- 엑셀 처리 → 네이티브 라이브러리 (POI, XLSX)
- PDF 생성 → 네이티브 PDF 렌더러
- 오프라인 모드 → 로컬 스토리지 + 동기화 큐

### 3. 기술 스택 제안

#### Frontend
- UI 프레임워크: [선정 및 이유]
- 상태 관리: [Redux/MobX/Context API]
- 네비게이션: [React Navigation/Native]
- UI 라이브러리: [Material/Cupertino/Custom]

#### Backend/Data
- 로컬 DB: [SQLite/Realm/AsyncStorage]
- API 통신: [Axios/Fetch]
- 파일 처리: [react-native-fs, xlsx]
- 오프라인: [Redux Persist/Offline First]

#### DevOps
- 빌드: [Gradle/Xcode]
- CI/CD: [Fastlane, GitHub Actions]
- 배포: [Google Play Console, App Store Connect]
- 크래시 리포팅: [Sentry, Firebase Crashlytics]

### 4. 구현 로드맵

#### Phase 1: 기반 구축
- [ ] 프로젝트 초기화 (React Native/Flutter/Native)
- [ ] 네비게이션 구조 설정
- [ ] 디자인 시스템 구축 (색상, 타이포그래피, 컴포넌트)
- [ ] 로컬 DB 스키마 설계

#### Phase 2: 핵심 기능
- [ ] 달력 UI 및 출근 기록
- [ ] 건설사/현장 관리
- [ ] 근로자 관리
- [ ] 8일 카운팅 로직

#### Phase 3: 고급 기능
- [ ] 엑셀 가져오기/내보내기
- [ ] PDF 명세서 생성
- [ ] 오프라인 모드 및 동기화
- [ ] 푸시 알림

#### Phase 4: 배포 준비
- [ ] 앱 아이콘, 스플래시 스크린
- [ ] 권한 설정 (스토리지, 카메라 등)
- [ ] Google Play/App Store 스크린샷
- [ ] 프라이버시 정책, 이용약관

### 5. 플랫폼 별 고려사항

#### Android (AOS)
- **API Level**: 최소 24 (Android 7.0), 타겟 34
- **권한**: WRITE_EXTERNAL_STORAGE (엑셀 저장)
- **백그라운드**: WorkManager (동기화)
- **디자인**: Material Design 3
- **테스트**: Android Emulator, 실제 기기

#### iOS
- **버전**: 최소 iOS 14+
- **권한**: 파일 접근, 사진 라이브러리
- **백그라운드**: Background App Refresh
- **디자인**: Human Interface Guidelines
- **테스트**: iOS Simulator, TestFlight

### 6. 스토어 등록 가이드

#### Google Play Console
1. 개발자 계정 생성 ($25 일회성)
2. 앱 생성 및 정보 입력
3. 스크린샷 및 프로모션 이미지 (최소 2개)
4. 콘텐츠 등급 설정
5. 가격 및 배포 국가 선택
6. 내부 테스트 → 비공개 테스트 → 프로덕션
7. 앱 검토 (보통 1-3일)

#### App Store Connect
1. Apple Developer 계정 ($99/년)
2. 앱 ID 생성 (번들 ID)
3. 앱 정보 및 스크린샷 (iPhone, iPad)
4. 프라이버시 정보 작성
5. TestFlight 베타 테스트
6. 앱 심사 제출 (보통 1-2일)

### 7. 비용 및 리소스 예상

#### 개발 비용 (외주 기준)
- WebView 기반: ₩500만 ~ ₩1,000만
- React Native: ₩1,500만 ~ ₩3,000만
- 완전 네이티브: ₩3,000만 ~ ₩6,000만

#### 계정 및 도구
- Google Play: $25 (일회성)
- Apple Developer: $99/년
- MacBook (iOS 개발 필수): ₩200만 이상
- 테스트 기기: Android (₩50만), iPhone (₩100만)

## 출력 형식

상세한 마크다운 문서로 작성하세요:
- 전략 제안 및 추천
- 아키텍처 다이어그램 (텍스트 기반)
- 기술 스택 상세 설명
- 단계별 구현 계획
- 스토어 등록 체크리스트
- 예상 비용 및 일정

현재 Field Manager OS 코드베이스를 읽고 분석한 후 작성하세요.
"""

        result = {
            "status": "pending",
            "conversion_plan": "",
            "cost_usd": 0.0,
            "session_id": None
        }

        async for message in query(
            prompt=prompt,
            options=ClaudeAgentOptions(
                allowed_tools=[
                    "Read", "Glob", "Grep",  # 코드베이스 분석
                    "Write",                 # 계획서 작성
                    "WebSearch",             # 모바일 기술 조사
                    "AskUserQuestion"        # 선호도 확인
                ],
                effort="high",
                max_turns=25,
                setting_sources=["project"],
            ),
        ):
            if isinstance(message, AssistantMessage):
                for content in message.message.content:
                    if hasattr(content, 'text'):
                        print(f"[Mobile Dev] {content.text[:100]}...")

            if isinstance(message, ResultMessage):
                if message.subtype == "success":
                    result["status"] = "success"
                    result["conversion_plan"] = message.result
                    result["cost_usd"] = message.total_cost_usd
                    result["session_id"] = message.session_id
                else:
                    result["status"] = "error"
                    result["error"] = message.subtype

        return result

    async def generate_starter_code(
        self,
        platform: str,
        framework: str = "react-native"
    ) -> Dict[str, Any]:
        """
        모바일 앱 스타터 코드 생성

        Args:
            platform: android, ios, both
            framework: react-native, flutter, native

        Returns:
            스타터 코드 및 설정 파일
        """

        prompt = f"""
Field Manager OS를 {framework} 기반 {platform} 앱으로 전환하기 위한
스타터 코드를 생성하세요.

## 생성할 파일들

### 1. 프로젝트 설정
- package.json (React Native)
- app.json (Expo/React Native)
- babel.config.js
- metro.config.js
- tsconfig.json (TypeScript 사용 시)

### 2. 메인 앱 구조
- App.tsx (메인 엔트리)
- src/navigation/AppNavigator.tsx
- src/screens/CalendarScreen.tsx
- src/screens/WorkerListScreen.tsx
- src/screens/ReportScreen.tsx

### 3. 컴포넌트
- src/components/CalendarGrid.tsx
- src/components/WorkerCard.tsx
- src/components/AttendanceButton.tsx

### 4. 서비스
- src/services/DatabaseService.ts (SQLite)
- src/services/ExcelService.ts
- src/services/PDFService.ts

### 5. 유틸
- src/utils/dateHelpers.ts
- src/utils/attendanceCalculator.ts (8일 카운팅)

각 파일의 기본 구조와 주석을 포함하여 작성하세요.
"""

        result = {"status": "pending", "starter_code": "", "cost_usd": 0.0}

        async for message in query(
            prompt=prompt,
            options=ClaudeAgentOptions(
                allowed_tools=["Read", "Write", "WebSearch"],
                effort="high",
                max_turns=15,
            ),
        ):
            if isinstance(message, ResultMessage) and message.subtype == "success":
                result["status"] = "success"
                result["starter_code"] = message.result
                result["cost_usd"] = message.total_cost_usd

        return result


async def main():
    """테스트 실행"""
    agent = MobileDeveloperAgent()

    print("\n" + "="*60)
    print("Mobile Developer Agent 테스트")
    print("="*60 + "\n")

    # 모바일 앱 전환 계획 생성
    result = await agent.convert_to_mobile_app(
        platform="both",
        current_tech="HTML/JavaScript (Tailwind, ExcelJS, jsPDF)",
        requirements=[
            "오프라인 모드 필수",
            "빠른 출시 (3개월 이내)",
            "예산 제한 (₩2,000만 이하)"
        ]
    )

    print(f"✅ 전환 계획 생성 완료")
    print(f"💰 비용: ${result['cost_usd']:.4f}\n")
    print("="*60)
    print(result['conversion_plan'])


if __name__ == "__main__":
    asyncio.run(main())
