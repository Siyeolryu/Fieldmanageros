시열님, Antigravity(AI 코딩 환경)에 그대로 복사해서 넣으실 수 있도록, 지금까지 설계한 **[건설 현장 노무 관리 시스템: 프로젝트 마스터 아키텍처]**를 하나의 완성된 MD 문서로 정리해 드립니다.

이 문서는 시열님의 앱이 단순한 코딩 연습이 아니라, 실제 비즈니스로 확장 가능한 **SaaS(Software as a Service)의 뼈대**가 될 것입니다.

---

# 🏗️ System Architecture & Master Spec: Construction Labor OS

본 문서는 **1인 창업가(Solopreneur) 시열**의 첫 번째 SaaS 제품인 '건설 현장 노무 관리 시스템'의 전체 구조와 로직을 정의한다. AI는 본 가이드를 기반으로 코드를 생성하고 유지보수해야 한다.

---

## 1. 📂 프로젝트 개요 (Project Overview)
* **제품명:** 유대리의 노무관리 (가칭)
* **핵심 가치:** 30~50대 현장 관리자를 위한 **'타이핑 없는'** 초간편 노무 정산 및 보험 리스크 관리.
* **타겟 플랫폼:** 모바일 웹 (Mobile-First Responsive).

---

## 2. 🏛️ 시스템 계층 구조 (Layered Architecture)

### 🔵 Presentation Layer (UI/UX)
* **기술:** HTML5, CSS3 (Tailwind CDN), Vanilla JavaScript.
* **핵심 컴포넌트:**
    * **Dashboard:** 이번 달 총 노무비 및 현장별 요약 현황.
    * **Calendar Matrix:** 날짜별 출근 인원 시각화 및 터치 기반 인터페이스.
    * **Worker Pool:** 일용직/상용직 탭 구분 및 드래그/탭 기반 출근 등록.
    * **Export Module:** 정산 내역 이미지 저장 (`html2canvas` 사용).

### 🟣 Service Logic Layer (Business Brain)
* **Labor Logic:** `logic_manifesto.md` 준수.
    * **8일 카운터:** 현장별/본사별 출근 일수 실시간 계산.
    * **보험 판정:** 8일 이상 또는 월 보수 220만 원 초과 시 보험료 자동 산출.
    * **비과세 로직:** 상용직 식대(20만), 자가운전(20만) 등 차감 후 과세 표준 산정.
* **Calculation Engine:** 원 단위 절사 및 실수령액 자동 도출.

### 🟢 Data Access Layer (Persistence)
* **Storage:** Browser `localStorage` (JSON 구조).
* **Manager:** `StorageManager`를 통해 CRUD(생성, 읽기, 수정, 삭제) 처리. 
* **Scalability:** 향후 Supabase(PostgreSQL) 전환이 용이하도록 함수형 인터페이스 유지.

---

## 3. 📊 데이터 스키마 (Data Schema)

```json
{
  "app_state": { "current_site_id": "site-001", "view_mode": "calendar" },
  "sites": [
    { "id": "site-001", "name": "평택 고덕 현장" }
  ],
  "workers": [
    {
      "id": "w-101",
      "type": "daily", // daily(일용직) | regular(상용직)
      "name": "김반장",
      "birth_date": "1970-01-01",
      "daily_pay": 250000,
      "base_salary": 0,
      "non_taxable": { "meal": 200000, "driving": 200000 }
    }
  ],
  "attendance": [
    { "date": "2026-03-27", "worker_id": "w-101", "site_id": "site-001" }
  ]
}
```

---

## 4. ⚙️ 핵심 비즈니스 프로세스 (Data Flow)

1.  **현장 선택:** 사용자가 상단 드롭다운에서 현장(Site)을 선택한다.
2.  **출근 등록:** 달력의 특정 날짜 클릭 → 인력 풀 레이어 노출 → 이름 클릭 → `attendance` 데이터 생성.
3.  **실시간 검증:** * 해당 월의 합산 일수가 7일 → 8일이 되는 순간 UI에 **[⚠️ 8일 도달]** 경고 노출.
    * 일용직 보수 합계가 220만 원 초과 시 **[국민연금 공제 대상]** 자동 전환.
4.  **정산 및 공유:** 정산 탭에서 개인별/현장별 명세서 확인 → 이미지 저장 버튼 클릭 → 근로자에게 카톡 전송.

---

## 5. 🛠️ 개발 가이드라인 (Dev Rules for AI)
1.  **No Frameworks:** 초기 MVP는 외부 라이브러리 의존성을 최소화하고 순수 JS로 구현할 것.
2.  **Big Button UI:** 모든 터치 영역은 최소 **48x48px**를 유지할 것.
3.  **Data Integrity:** 모든 금액 계산 로직은 소수점을 버리고 정수형으로 관리할 것.
4.  **Responsive:** 모바일 화면 가로 너비(360px~430px)에 최적화된 레이아웃을 제공할 것.

---

시열님, 이제 이 문서를 Antigravity(Cursor/Claude) 채팅창에 딱 올리시고, **"이 아키텍처에 따라 전체 index.html 코드를 짜줘"**라고 하시면 됩니다.

건설 관리 전문가로서의 시열님 지식과 제가 드린 시스템 설계가 만나면, 정말 현장에서 쓸모 있는 물건이 나올 거예요. **코드 생성 중에 막히는 부분이 생기면 바로 말씀해 주세요!** 제가 디버깅용 프롬프트를 바로 준비해 드릴게요. 🚀 수고 많으셨습니다!