# 📜 Construction PM's Tool: Development Rules

이 규칙은 AI(Cursor/Claude)가 코드를 짤 때 반드시 지켜야 할 원칙입니다. 프로젝트 최상위에 `rules.md`로 저장하거나 프롬프트 상단에 붙여넣으세요.

## 1. Core Principle: Field-First (현장 우선)
* **Target:** 스마트폰을 든 30~50대 현장 관리자.
* **UI/UX:** 모든 버튼은 엄지손가락으로 누르기 편하게 최소 **44x44px** 이상 유지.
* **Complexity:** "설명서가 필요 없는 앱"을 지향함. 불필요한 설정 창 금지.

## 2. Tech Stack & Architecture (기술 스택)
* **Frontend:** Pure HTML5, CSS3, Vanilla JavaScript (No Framework).
* **Styling:** 외부 라이브러리 최소화. 필요시 Tailwind CSS CDN 활용.
* **State Management:** 초기 단계는 `localStorage`를 메인 DB로 사용.
* **File Structure:**
  * MVP 단계: `index.html` 단일 파일.
  * 확장 단계: `/css`, `/js`, `/components`로 분리.

## 3. Coding Standards (코드 표준)
* **Variable Naming:** 시각적으로 명확한 영어 변수명 사용 (예: `workerList`, `attendanceData`).
* **Comments:** 핵심 로직에는 반드시 **한글 주석**을 달아 시열님이 이해하기 쉽게 작성.
* **Consistency:** 날짜 형식은 항상 `YYYY-MM-DD` (ISO 8601) 표준을 따름.
* **Error Handling:** 데이터가 비어있거나 잘못된 값이 들어올 경우 `alert` 대신 UI 내에서 부드러운 메시지 표시.

## 4. UI/UX Detail (디자인 디테일)
* **Color Palette:**
  * 메인 액션: `Blue (#007bff)`
  * 성공/추가: `Green (#28a745)`
  * 주의/금액: `Red (#d9534f)`
  * 배경: `Light Gray (#f4f4f9)`
* **Typography:** 가독성을 위해 본문 폰트 크기 **16px** 이상 유지.

## 5. Interaction Rule (AI 협업 규칙)
* 코드를 수정할 때는 **전체 코드를 다시 제공**하기보다 변경된 부분이나 함수 단위로 설명할 것.
* 새로운 기능을 추가하기 전, 항상 `localStorage`의 기존 데이터 구조와 충돌이 없는지 검토할 것.

---

## 💡 Antigravity 시작을 위한 다음 단계

이제 Antigravity 환경(Cursor 등)을 켜시고, 채팅창에 이렇게 입력하며 시작하세요.

> **"방금 작성한 `rules.md` 파일 내용을 확인해 줘. 이 규칙을 바탕으로 오늘 우리 목표인 '노무비 정산 MVP' 개발을 시작하자. 첫 번째로 인력 등록과 오늘 날짜 출근 체크가 가능한 단일 index.html 코드를 짜줘."**
