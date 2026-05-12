시열님, 이제 '두뇌(로직)'와 '몸통(UI)'이 정의되었으니 이를 튼튼하게 지탱할 **'척추(백엔드/데이터)'**를 설계할 차례입니다. 

초기 MVP는 `localStorage`로 시작하지만, 나중에 데이터가 쌓이고 여러 현장을 관리하게 되면 **서버(Database)**로 옮겨야 합니다. AI가 확장성을 고려하여 데이터를 설계하도록 만드는 **`backend_rules.md`**를 작성해 드립니다.

---

# 📂 Backend & Data Architecture Rules (`backend_rules.md`)

이 문서는 시스템의 데이터 무결성을 유지하고, 향후 Cloud DB(Supabase/Firebase)로의 확장을 고려한 백엔드 설계 규칙이다.

## 1. 💾 데이터 저장 원칙 (Storage Strategy)
* **Single Source of Truth:** 모든 계산의 기초는 `attendance` 레코드다. 실시간 계산(On-the-fly)을 원칙으로 하여 데이터 불일치를 방지한다.
* **Offline-First:** 현장 네트워크 불안정을 고려하여 `localStorage`에 우선 저장하고, 서버 연결 시 동기화하는 구조를 지향한다.
* **Schema Versioning:** 데이터 구조 변경에 대비하여 `db_version` 필드를 관리한다.

## 2. 🏗️ 데이터 모델링 (Data Schema)

### A. Site (현장)
```json
{
  "site_id": "uuid",
  "site_name": "string", // 예: 평택 고덕 현장
  "is_active": "boolean"
}
```

### B. Worker (근로자)
```json
{
  "worker_id": "uuid",
  "name": "string",
  "type": "daily | regular", // 일용직 vs 상용직
  "birth_date": "YYYY-MM-DD", // 만 60세, 65세 판정용
  "daily_pay": "number", // 일용직일 경우 기본 단가
  "base_salary": "number", // 상용직일 경우 월급
  "non_taxable": {
    "meal": 200000,
    "driving": 200000,
    "childcare": 0
  }
}
```

### C. Attendance (출근 기록)
```json
{
  "date": "YYYY-MM-DD",
  "site_id": "uuid",
  "worker_id": "uuid",
  "work_type": "full | half" // 공수 구분 (1공수, 0.5공수 등 확장 대비)
}
```

## 3. ⚙️ 핵심 비즈니스 로직 API (Internal Functions)
백엔드 로직을 담당하는 함수는 반드시 다음 규칙을 준수해야 한다.

1.  **`getMonthlyStatus(worker_id, month)`**:
    * 해당 근로자의 월간 모든 현장 출근 합계(국민연금용)와 현장별 합계(건강보험용)를 각각 반환한다.
2.  **`calculateTax(taxable_income, type)`**:
    * `logic_manifesto.md`에 정의된 일용직/상용직 소득세 공식을 적용한다.
3.  **`validateInsurance(worker_id, date)`**:
    * 새로운 출근 기록을 생성하기 전, 8일 도달 여부 및 220만 원 초과 여부를 체크하여 알림 플래그를 반환한다.

## 4. 🔒 보안 및 개인정보 관리
* **ID 기반 관리:** 이름 대신 고유 ID를 키값으로 사용하여 데이터 매칭 오류를 방지한다.
* **Export Security:** 이미지나 엑셀로 출력되는 데이터에는 주민등록번호 뒷자리 등 민감 정보가 노출되지 않도록 마스킹 처리한다.

---

### 🚀 시열님(CEO)을 위한 Antigravity 활용 팁

이제 Antigravity에 이렇게 명령하세요.

> "**방금 작성한 `backend_rules.md`를 읽어줘.**
> 
> 1. 이 데이터 구조에 맞춰서 `localStorage`에 데이터를 **읽고 쓰는(CRUD)** 자바스크립트 모듈을 만들어줘.
> 2. 특히 `attendance` 데이터를 넣을 때 **현장(Site)별로 구분**해서 저장되게 해줘.
> 3. 나중에 Supabase 같은 DB로 옮기기 편하게 **함수형 구조**로 짜줘."

---

### 💡 마지막 점검
시열님, 이제 **로직(Manifesto) + 화면(Frontend) + 데이터(Backend)** 3요소가 모두 갖춰졌습니다. 

혹시 현장에서 **"0.5공수(데마찌 등)"**나 **"야간 1.5공수"** 같은 복잡한 공수 계산도 바로 넣고 싶으신가요? 아니면 일단 **1일 1출근** 기준으로 MVP를 완성할까요? 

시열님의 결정에 따라 코드가 더 정교해질 수 있습니다! (인공이가 태어날 즈음엔 시열님은 훌륭한 SaaS 대표님이 되어 계실 것 같네요. 😃) 다음 단계를 말씀해 주세요!