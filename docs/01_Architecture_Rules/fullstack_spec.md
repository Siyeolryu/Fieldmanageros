시열님, 이제 모든 퍼즐 조각이 모였습니다. **로직(Manifesto), 화면(Frontend), 데이터(Backend)**를 하나로 합쳐 AI(Antigravity)가 단번에 앱의 전체 구조를 파악하고 코드를 생성할 수 있게 하는 **`fullstack_spec.md`**를 작성해 드립니다.

이 문서는 시열님의 앱이 단순한 페이지를 넘어 하나의 **완성된 시스템**으로 작동하게 만드는 최종 설계도입니다.

---

# 🚀 Full-Stack System Specification: Field Manager OS (MVP)

이 문서는 `logic_manifesto.md`, `frontend_spec`, `backend_rules.md`를 통합하여 하나의 풀스택 애플리케이션으로 구현하기 위한 최종 기술 명세서다.

## 1. 🏗️ System Architecture (단일 파일 확장 구조)
* **Frontend:** HTML5, CSS3(Tailwind), Vanilla JS (상태 관리 로직 포함).
* **Storage:** `localStorage`를 메인 데이터베이스로 사용하며, 향후 Supabase(PostgreSQL) 전환을 고려한 인터페이스 설계.
* **Rendering:** 데이터 변경 시 전체 페이지가 아닌 필요한 컴포넌트만 업데이트하는 **Reactive Render** 방식 지향.

## 2. 📊 Database Schema (JSON Structure)
시스템은 `App_Data`라는 키값으로 아래의 통합 JSON 객체를 관리한다.

```json
{
  "settings": { "current_site_id": "uuid-1", "db_version": "1.0" },
  "sites": [
    { "id": "uuid-1", "name": "평택 고덕 현장" }
  ],
  "workers": [
    {
      "id": "w-1",
      "type": "daily", // daily or regular
      "name": "홍길동",
      "birth_date": "1975-05-20",
      "daily_pay": 250000,
      "base_salary": 0,
      "non_taxable": { "meal": 200000, "driving": 0, "childcare": 0 }
    }
  ],
  "attendance": [
    { "date": "2026-03-27", "worker_id": "w-1", "site_id": "uuid-1" }
  ]
}
```

## 3. ⚙️ Functional Modules (핵심 기능 단위)

### 🟢 Module A: Site & Worker Manager
* **현장 관리:** 새로운 현장 추가 및 전환 기능.
* **인력 등록:** 일용직/상용직 구분 입력 및 비과세 항목(식대 등) 초기 세팅.

### 🔵 Module B: Attendance Calendar (Core UX)
* **날짜 선택:** 달력의 날짜 클릭 시 해당 날짜의 출근 현황 섹션 활성화.
* **출근 토글:** 인력 풀에서 이름을 클릭하면 `attendance` 배열에 추가/삭제.
* **8일 체크:** 해당 월의 `attendance`를 필터링하여 8일 이상 시 UI에 경고 아이콘 표시.

### 🔴 Module C: Calculation Engine (The Brain)
* **`calculateTotal(worker_id, month)`**:
    * 해당 월의 출근 일수, 총 보수액 계산.
    * `logic_manifesto`에 의거하여 **국민연금(4.5%)**, **건강보험(3.545%)**, **고용보험(0.9%)**, **소득세** 자동 산출.
    * **비과세 차감:** 상용직의 경우 총액에서 비과세액을 뺀 금액으로 보험료 산정.

### 🟡 Module D: View & Export
* **정산 대시보드:** 현장별/개인별 월간 노무비 요약 테이블 생성.
* **이미지 캡처:** `html2canvas` 라이브러리를 호출하여 특정 영역을 이미지 파일로 내려받기.

## 4. 🛠️ Development Rules for AI (Antigravity)
1.  **Modular JavaScript:** 데이터 조작 로직(`Data.js`), 계산 로직(`Calc.js`), 화면 그리기(`UI.js`)를 명확히 분리할 것 (파일 분리가 어렵다면 주석으로 구분).
2.  **Safety:** 모든 금액 계산 시 `Math.floor()`를 사용하여 원 단위 절사 처리.
3.  **Performance:** 인력 리스트가 길어질 경우를 대비하여 효율적인 DOM 업데이트 방식을 사용할 것.

---

### 💡 시열님(CEO)의 실행 가이드

이제 Antigravity(AI)에게 최종 명령을 내릴 시간입니다.

> **"지금까지 작성한 모든 가이드(`logic_manifesto`, `frontend_spec`, `backend_rules`, `fullstack_spec`)를 통합해서 실제 동작하는 앱을 만들어줘.**
>
> 1. 모든 기능은 `index.html` 파일 하나에서 돌아가게 짜줘 (라이브러리는 CDN 사용).
> 2. 특히 **'8일 카운팅 알림'**과 **'비과세 적용 상용직 계산'** 로직이 정확히 돌아가야 해.
> 3. 달력에서 인원을 넣고 뺄 때마다 하단 **'총 정산액'**이 실시간으로 변하는 걸 보여줘.
> 4. 디자인은 현장에서 쓰기 좋게 **크고 직관적인 버튼**으로 부탁해.
>
> **자, 이제 코드를 생성해줘!"**

---

### 👨‍💻 인공이 아빠 시열님께 드리는 마지막 조언
시열님, 이제 이 코드가 생성되면 **시열님만의 첫 번째 SaaS 제품**이 세상에 나오게 됩니다. 

* **실행 후 테스트:** 폰에서 직접 '김반장님'을 등록하고 8일 동안 체크해 보세요. 연금 보험료가 딱 맞게 빠지는지 확인하는 그 순간이 가장 짜릿할 겁니다.
* **다음 단계:** MVP가 완성되면, 이 데이터를 엑셀로 뽑거나 실제 노무 법인 신고 양식에 맞추는 기능을 붙일 수 있습니다.

오늘 정말 고생 많으셨습니다! **코드가 나오면, 혹시 오류가 나거나 UI를 조금 더 다듬고 싶을 때 언제든 말씀해 주세요.** 제가 바로 수정 프롬프트를 짜드릴게요! 🚀 건승을 빕니다.