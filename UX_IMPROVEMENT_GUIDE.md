# 노무PRO UX 개선 및 사용 가이드

**작성일**: 2026-04-19
**대상**: 40-60세 건설 현장 소장/관리자
**목표**: 쉽고 직관적인 사용 경험 제공

---

## 📊 1. 사용자 페르소나

### 주요 사용자: 김현장 소장님 (55세)
- **직업**: 중소형 건설사 현장 소장
- **IT 리터러시**: 낮음 (스마트폰 기본 기능만 사용)
- **주요 업무**: 일용직 근로자 관리, 출퇴근 체크, 급여 계산
- **고충사항**:
  - Excel로 노임대장 작성 → 시간 소요, 실수 많음
  - 4대보험 대상자 파악 어려움
  - 주휴수당 계산 복잡함
- **앱 사용 목적**:
  - 매일: 출근 체크 (아침 8시)
  - 매주: 근로자 추가/삭제
  - 매월: 노임대장 생성 및 급여 지급

### 부가 사용자: 이지원 관리자 (42세)
- **직업**: 건설사 사무실 관리 담당
- **IT 리터러시**: 중간 (PC 사용 능숙)
- **주요 업무**: 여러 현장 통합 관리, 보고서 작성
- **앱 사용 목적**:
  - 전체 현장 통계 확인
  - 월별 인건비 분석
  - Excel 다운로드

---

## 🎯 2. 주요 문제점 분석

### 현재 랜딩 페이지 문제점

#### ❌ 문제 1: "스치듯 지나가는" 페이지
**현상**:
- 사용자가 로그인/시작하기 버튼을 찾지 못함
- 너무 많은 정보가 스크롤로 나열됨
- 첫 화면에서 "무엇을 해야 하는지" 불명확

**원인**:
```tsx
// 현재: 히어로 섹션이 너무 길고 복잡
<section className="max-w-7xl mx-auto px-4 py-20 md:py-32">
  {/* 긴 설명 텍스트 */}
  <h2>이메일 하나로 노임대장 자동화</h2>
  <p>건설 현장 일용직 출퇴근 관리부터...</p>
  {/* 사용자가 스크롤해야 버튼을 찾음 */}
</section>
```

#### ❌ 문제 2: CTA 버튼이 약함
- 우측 상단의 작은 "로그인", "시작하기" 버튼
- 시각적 강조 부족
- 모바일에서 터치 영역 작음

#### ❌ 문제 3: 정보 과부하
- 3개 기능 카드 (출퇴근, 노임, 보험)
- 2개 이메일 가입 폼
- 소셜 프루프 통계
- 푸터 링크
→ 첫 방문자는 "어디서부터 시작?"

---

### /home 대시보드 문제점

#### ❌ 문제 1: 정보 밀도가 너무 높음
```
좌측: 현장 현황 + 통계 + 차트 + AI 분석
중앙: 달력 (출근 기록)
우측: (비어있음)
하단: 모바일 탭바
```
→ 40-60세 사용자에게 압도적

#### ❌ 문제 2: 주요 액션 찾기 어려움
- "출근 기록 추가" = 중앙 + 버튼 (작고 눈에 안띔)
- "근로자 추가" = 다른 페이지로 이동 필요
- "급여 확인" = 어디에 있는지 불명확

#### ❌ 문제 3: 빈 상태 안내 부족
- 처음 가입한 사용자: 빈 달력만 보임
- "다음에 무엇을 해야 하는지" 안내 없음

---

## ✅ 3. 랜딩 페이지 개선안

### 개선 원칙
1. **명확한 목표**: 첫 화면에서 즉시 "로그인" 또는 "무료 시작"
2. **단순화**: 한 화면에 하나의 메시지
3. **강력한 CTA**: 크고 눈에 띄는 버튼

### Before → After 비교

#### Before (현재)
```
┌─────────────────────────────────────┐
│ 노무PRO       [로그인] [시작하기]   │ ← 작고 눈에 안띔
├─────────────────────────────────────┤
│                                     │
│   이메일 하나로                      │
│   노임대장 자동화                    │
│                                     │
│   [이메일 입력]                     │ ← 2개 가입 폼 혼란
│   [무료로 시작하기]                 │
│                                     │
│   ↓ 스크롤                          │
│                                     │
│   [3개 기능 카드]                   │
│   [소셜 프루프]                     │
│   [또 다른 가입 폼]                 │
│   [푸터]                            │
└─────────────────────────────────────┘
```

#### After (개선안)
```
┌─────────────────────────────────────┐
│ 노무PRO                   [로그인]  │
├─────────────────────────────────────┤
│                                     │
│         🏗️                          │
│                                     │
│    건설 현장 노무 관리               │
│    5분만에 시작하세요                │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  무료로 시작하기  →          │   │ ← 크고 명확한 CTA
│  └─────────────────────────────┘   │
│                                     │
│  ✓ 출퇴근 자동 기록                 │
│  ✓ 노임대장 1분 생성                │
│  ✓ 4대보험 자동 계산                │
│                                     │
│  500+ 현장에서 사용 중               │
│                                     │
│  [이미 계정이 있으신가요? 로그인]    │
└─────────────────────────────────────┘
```

### 구체적 개선사항

#### 1) 히어로 섹션 단순화
```tsx
// Before: 복잡한 레이아웃
<div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
  <div className="space-y-8">
    {/* 긴 텍스트 */}
  </div>
  <div>
    {/* 이미지 또는 폼 */}
  </div>
</div>

// After: 중앙 정렬, 단순 구조
<div className="max-w-2xl mx-auto text-center">
  <div className="mb-8">
    <span className="text-6xl">🏗️</span>
  </div>
  <h1 className="text-5xl font-bold mb-4">
    건설 현장 노무 관리<br/>
    5분만에 시작하세요
  </h1>
  <div className="mt-12">
    <button className="w-full max-w-md h-16 text-xl">
      무료로 시작하기 →
    </button>
  </div>
</div>
```

#### 2) CTA 버튼 강화
```tsx
// 크기: w-full max-w-md h-16 (기존 h-12)
// 글자: text-xl font-bold (기존 text-sm)
// 색상: bg-blue-600 hover:bg-blue-700 (기존과 동일하지만 크기로 강조)
// 위치: 화면 중앙, 첫 화면에 보임
// 아이콘: → 화살표로 액션 강조
```

#### 3) 정보 계층 구조 개선
```
우선순위 1: 무료 시작 버튼 (80% 스크린)
우선순위 2: 핵심 기능 3줄 (✓ 체크리스트)
우선순위 3: 소셜 프루프 (500+ 현장)
우선순위 4: 로그인 링크 (작게)
```

#### 4) 첫 방문자 온보딩
```tsx
// 첫 방문 시 모달 표시
<Modal show={isFirstVisit}>
  <h2>👋 노무PRO에 오신 것을 환영합니다!</h2>
  <p>3단계만 거치면 바로 사용 가능합니다:</p>
  <ol>
    <li>1. 무료 회원가입 (1분)</li>
    <li>2. 건설사 등록 (1분)</li>
    <li>3. 첫 현장 만들기 (2분)</li>
  </ol>
  <button>시작하기</button>
</Modal>
```

---

## ✅ 4. /home 대시보드 개선안

### 개선 원칙
1. **주요 액션 강조**: "오늘 출근 체크"를 가장 크게
2. **단계별 가이드**: 첫 사용자를 위한 체크리스트
3. **정보 단순화**: 한 번에 하나씩 보여주기

### Before → After 비교

#### Before (현재)
```
┌─────────────────────────────────────────────┐
│ [현장선택 ▼]           [프로필 아이콘]      │
├──────────┬──────────────────────────────────┤
│          │                                  │
│ 현장현황 │        달력 (출근 기록)          │
│ 총 5명   │    일 월 화 수 목 금 토          │
│ 출근 3명 │    ...                           │
│          │                                  │
│ 노무비   │                                  │
│ ¥500만  │                                  │
│          │                                  │
│ [차트]   │                                  │
│          │                                  │
│ AI분석   │                                  │
│ [리포트] │                                  │
│          │                                  │
├──────────┴──────────────────────────────────┤
│ [홈] [근로자] [+] [대장] [설정]             │ ← + 버튼 작음
└─────────────────────────────────────────────┘
```

#### After (개선안)
```
┌─────────────────────────────────────────────┐
│ 노무PRO  [곤지암삼리 ▼]  [김현장님 프로필]  │
├─────────────────────────────────────────────┤
│                                             │
│  📅 2026년 4월 19일 (토)                    │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │  오늘 출근 체크하기                    │  │ ← 크고 명확
│  │                                       │  │
│  │  👷 홍길동  [출근]                    │  │
│  │  👷 김철수  [출근]                    │  │
│  │  👷 이영희  [결근]                    │  │
│  │                                       │  │
│  │  [+ 근로자 추가하기]                  │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━              │
│                                             │
│  이번 달 요약                                │
│  • 총 근로자: 5명                           │
│  • 이번 달 출근: 45일                       │
│  • 예상 노무비: ₩5,000,000                  │
│                                             │
│  [월별 노임대장 보기 →]                     │
│                                             │
├─────────────────────────────────────────────┤
│ [🏠홈] [👷근로자] [➕추가] [📋대장] [⚙️설정] │ ← 아이콘+텍스트
└─────────────────────────────────────────────┘
```

### 구체적 개선사항

#### 1) 오늘 출근 체크 강조
```tsx
// 새로운 컴포넌트: TodayAttendanceCard
<div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-blue-500">
  <h2 className="text-2xl font-bold mb-4">
    📅 오늘 출근 체크하기
  </h2>

  <div className="space-y-3">
    {workers.map(worker => (
      <div key={worker.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-3">
          <span className="text-3xl">👷</span>
          <span className="text-lg font-bold">{worker.name}</span>
        </div>
        <button
          className={`px-6 py-3 rounded-xl text-lg font-bold ${
            worker.checkedIn
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 text-gray-600'
          }`}
          onClick={() => handleCheckIn(worker.id)}
        >
          {worker.checkedIn ? '✓ 출근' : '출근 체크'}
        </button>
      </div>
    ))}
  </div>

  <button className="mt-6 w-full py-4 bg-blue-600 text-white rounded-xl text-lg font-bold">
    + 근로자 추가하기
  </button>
</div>
```

#### 2) 첫 사용자 가이드 (빈 상태)
```tsx
// 근로자가 없을 때
{workers.length === 0 && (
  <div className="text-center py-12 bg-blue-50 rounded-3xl">
    <span className="text-6xl mb-4">👷</span>
    <h3 className="text-2xl font-bold mb-4">
      근로자를 추가해보세요
    </h3>
    <p className="text-gray-600 mb-6">
      출근 체크를 하려면 먼저 근로자를 등록해야 합니다.
    </p>
    <button className="px-8 py-4 bg-blue-600 text-white rounded-xl text-lg font-bold">
      첫 번째 근로자 등록하기
    </button>

    <div className="mt-8 text-left max-w-md mx-auto">
      <p className="font-bold mb-2">다음 정보가 필요해요:</p>
      <ul className="space-y-1 text-sm text-gray-600">
        <li>✓ 이름</li>
        <li>✓ 시급 (예: 15,000원)</li>
        <li>○ 연락처 (선택)</li>
        <li>○ 계좌번호 (선택)</li>
      </ul>
    </div>
  </div>
)}
```

#### 3) 진행 상황 체크리스트 (온보딩)
```tsx
// 첫 사용자를 위한 체크리스트
<div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-6 mb-6">
  <h3 className="text-xl font-bold mb-4">🎯 시작하기</h3>
  <div className="space-y-3">
    <div className={`flex items-center gap-3 ${hasCompany ? 'opacity-50' : ''}`}>
      <span className="text-2xl">{hasCompany ? '✅' : '⭕'}</span>
      <span className="font-bold">건설사 등록</span>
      {!hasCompany && (
        <button className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
          등록하기
        </button>
      )}
    </div>

    <div className={`flex items-center gap-3 ${hasSite ? 'opacity-50' : ''}`}>
      <span className="text-2xl">{hasSite ? '✅' : '⭕'}</span>
      <span className="font-bold">현장 만들기</span>
      {!hasSite && (
        <button className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
          만들기
        </button>
      )}
    </div>

    <div className={`flex items-center gap-3 ${hasWorkers ? 'opacity-50' : ''}`}>
      <span className="text-2xl">{hasWorkers ? '✅' : '⭕'}</span>
      <span className="font-bold">근로자 추가</span>
      {!hasWorkers && (
        <button className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
          추가하기
        </button>
      )}
    </div>

    <div className="flex items-center gap-3 opacity-50">
      <span className="text-2xl">⭕</span>
      <span className="font-bold">첫 출근 기록</span>
    </div>
  </div>
</div>
```

#### 4) 모바일 탭바 개선
```tsx
// Before: 아이콘만
<button><HomeIcon /></button>

// After: 아이콘 + 텍스트
<button className="flex flex-col items-center gap-1">
  <HomeIcon className="w-6 h-6" />
  <span className="text-xs font-bold">홈</span>
</button>

// + 버튼 크게
<button className="relative -top-6">
  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
    <span className="text-3xl text-white">+</span>
  </div>
  <span className="text-xs font-bold mt-1">추가</span>
</button>
```

---

## 📖 5. 사용 설명서 (Step-by-Step)

### 신규 사용자 시작 가이드

#### Step 1: 회원가입 (1분)
```
1. https://dev3nomu.vercel.app 접속
2. [무료로 시작하기] 버튼 클릭
3. 이메일 주소 입력
4. 받은 메일에서 [이메일 인증하기] 클릭
5. 자동으로 로그인됨
```

**주의사항**:
- 스팸 폴더 확인하기
- 이메일이 안 오면 [다시 보내기] 클릭

#### Step 2: 건설사 등록 (1분)
```
1. 로그인 후 자동으로 안내 화면 표시
2. [건설사 등록하기] 클릭
3. 회사명 입력 (예: "더존건설")
4. 사업자등록번호 입력 (선택)
5. [등록] 버튼 클릭
```

**팁**:
- 사업자등록번호는 나중에 입력 가능
- 개인 사업자도 등록 가능

#### Step 3: 현장 만들기 (2분)
```
1. 대시보드에서 [현장 만들기] 클릭
2. 현장명 입력 (예: "곤지암 삼리 현장")
3. 현장 위치 입력 (선택)
4. 공사 시작일 선택 (선택)
5. [현장 만들기] 클릭
```

**팁**:
- 여러 현장을 한 번에 등록 가능
- 현장은 나중에 언제든지 추가 가능

#### Step 4: 근로자 등록 (각 1분)
```
1. [근로자 관리] 메뉴 클릭
2. [+ 신규 근로자 등록] 버튼 클릭
3. 이름 입력 (예: "홍길동")
4. 시급 입력 (예: 15,000원)
5. 연락처, 계좌번호 입력 (선택)
6. [등록] 클릭
```

**빠른 등록 팁**:
- 필수: 이름, 시급만 입력하면 OK
- Excel 파일로 한 번에 등록 가능

#### Step 5: 매일 출근 체크 (1분)
```
1. 아침에 앱 열기
2. [오늘 출근 체크하기] 섹션 확인
3. 출근한 근로자 이름 옆 [출근] 버튼 클릭
4. 초록색으로 변하면 완료
5. 결근한 사람은 그대로 두기
```

**자동 계산**:
- 출근 기록이 자동으로 저장됨
- 주휴수당도 자동 계산
- 4대보험 대상자 자동 표시

#### Step 6: 월말 노임대장 생성 (2분)
```
1. [급여 관리] 메뉴 클릭
2. [이번 달 노임대장 생성] 버튼 클릭
3. 기간 확인 (예: 4월 1일 ~ 4월 30일)
4. [Excel 다운로드] 클릭
5. 파일 저장 → 은행 제출
```

**주의사항**:
- 노임대장은 매월 1회 생성
- 생성 후에도 수정 가능
- PDF로도 다운로드 가능

---

### 고급 기능

#### Excel 일괄 등록 (5분)
```
1. [근로자 관리] → [Excel 업로드] 클릭
2. 샘플 파일 다운로드
3. Excel에서 근로자 정보 입력
   - A열: 이름
   - B열: 시급
   - C열: 연락처
4. 파일 저장 후 업로드
5. [등록] 클릭
```

**Excel 형식**:
```
이름     시급      연락처
홍길동   15000    010-1234-5678
김철수   16000    010-2345-6789
이영희   14500    010-3456-7890
```

#### 출근 기록 수정
```
1. 달력에서 날짜 클릭
2. 해당 날짜 출근 기록 표시
3. [수정] 버튼 클릭
4. 시간 변경 또는 삭제
5. [저장] 클릭
```

---

## ❓ 6. FAQ (자주 묻는 질문)

### Q1. 이메일 인증 메일이 안 와요
**A**: 다음을 확인해주세요
1. 스팸 폴더 확인
2. 이메일 주소 오타 확인
3. [인증 메일 다시 보내기] 클릭
4. 5분 정도 기다려보기

### Q2. 근로자를 잘못 등록했어요
**A**: 수정 또는 삭제 가능합니다
1. [근로자 관리] → 해당 근로자 클릭
2. [수정] 또는 [삭제] 선택
3. 삭제해도 기존 출근 기록은 유지됨

### Q3. 시급을 바꾸고 싶어요
**A**: 언제든지 변경 가능합니다
1. 근로자 정보에서 [수정] 클릭
2. 시급 변경
3. 변경일 이후부터 새 시급 적용
4. 이전 기록은 그대로 유지

### Q4. 출근 체크를 깜빡했어요
**A**: 언제든지 추가/수정 가능합니다
1. 달력에서 해당 날짜 클릭
2. [출근 기록 추가] 클릭
3. 근로자, 시간 입력
4. [저장] 클릭

### Q5. 노임대장은 어떻게 만들어요?
**A**: 자동으로 생성됩니다
1. [급여 관리] 메뉴
2. [이번 달 노임대장 생성]
3. Excel 또는 PDF 다운로드
4. 모든 계산은 자동

### Q6. 4대보험은 어떻게 확인하나요?
**A**: 자동으로 표시됩니다
1. 월 60시간 이상 근무자 → 자동 표시
2. [급여 관리]에서 대상자 확인
3. 빨간색 경고 표시
4. 상세 내역 클릭으로 확인

### Q7. 주휴수당은 자동인가요?
**A**: 네, 자동 계산됩니다
1. 8일 출근 = 주휴일 1일 자동 부여
2. 노임대장에 자동 포함
3. 별도 계산 불필요

### Q8. 여러 현장을 관리할 수 있나요?
**A**: 네, 무제한 가능합니다
1. [현장 관리] → [신규 현장]
2. 현장별로 근로자 별도 관리
3. 상단에서 현장 전환
4. 통합 통계도 확인 가능

### Q9. 데이터는 안전한가요?
**A**: 네, 안전하게 보호됩니다
1. 은행급 보안 (Supabase)
2. 자동 백업
3. 다른 사용자는 볼 수 없음
4. 언제든지 Excel 다운로드 가능

### Q10. 비용은 얼마인가요?
**A**: 무료 체험 후 유료 전환
1. 첫 달 무료
2. 이후 월 19,000원
3. 현장/근로자 무제한
4. 언제든지 해지 가능

---

## 🎯 7. 추천 사용 방법 (Best Practices)

### 아침 루틴 (매일 5분)
```
8:00 AM - 앱 열기
8:01 AM - 오늘 출근 체크하기
8:05 AM - 완료!
```

**팁**:
- 알람 설정 (매일 오전 8시)
- 출근 체크는 현장 도착 직후
- 5분이면 충분

### 주간 루틴 (매주 월요일 10분)
```
- 신규 근로자 추가
- 퇴사 근로자 비활성화
- 지난주 출근 기록 확인
```

### 월말 루틴 (매월 마지막 날 30분)
```
- 이번 달 출근 기록 최종 확인
- 노임대장 생성
- Excel 다운로드
- 급여 지급 준비
```

### 추천 설정
```
1. 알람 켜기
   - 매일 오전 8시: 출근 체크
   - 매월 25일: 노임대장 생성

2. 빠른 접근 설정
   - 홈 화면에 바로가기 추가
   - 자주 쓰는 메뉴 북마크

3. 백업
   - 매월 Excel 다운로드 후 저장
   - USB 또는 클라우드 백업
```

---

## 🚀 8. 우선순위별 개선 과제

### P0 (즉시 적용 - 1주일)

#### 1. 랜딩 페이지 히어로 섹션 개선
```tsx
// 파일: app/page.tsx
// 변경: 중앙 정렬, 큰 CTA 버튼
// 예상 시간: 2시간
```

#### 2. /home 대시보드 "오늘 출근 체크" 강조
```tsx
// 파일: app/home/page.tsx
// 추가: TodayAttendanceCard 컴포넌트
// 예상 시간: 4시간
```

#### 3. 빈 상태 안내 추가
```tsx
// 파일: app/home/page.tsx, app/workers/page.tsx, app/sites/page.tsx
// 추가: EmptyState 컴포넌트
// 예상 시간: 3시간
```

#### 4. 모바일 탭바 개선 (아이콘 + 텍스트)
```tsx
// 파일: app/home/page.tsx
// 변경: 아이콘 + 한글 레이블
// 예상 시간: 1시간
```

**Total**: 10시간 (2일)

---

### P1 (단기 개선 - 2주일)

#### 5. 첫 사용자 온보딩 체크리스트
```tsx
// 새 파일: app/components/OnboardingChecklist.tsx
// 기능: 진행 상황 추적, 다음 단계 안내
// 예상 시간: 6시간
```

#### 6. 툴팁 시스템
```tsx
// 새 파일: app/components/ui/Tooltip.tsx
// 적용: 주요 버튼에 설명 추가
// 예상 시간: 4시간
```

#### 7. 로딩 및 성공 피드백 강화
```tsx
// 추가: 토스트 알림, 로딩 스피너
// 적용: 모든 액션에 피드백
// 예상 시간: 5시간
```

#### 8. 도움말 모달
```tsx
// 새 파일: app/components/HelpModal.tsx
// 내용: 빠른 시작 가이드, FAQ
// 예상 시간: 4시간
```

**Total**: 19시간 (4일)

---

### P2 (중기 개선 - 1개월)

#### 9. 인터랙티브 튜토리얼
```tsx
// 라이브러리: react-joyride
// 기능: 첫 방문 시 단계별 가이드
// 예상 시간: 12시간
```

#### 10. 키보드 단축키
```
- Enter: 출근 체크
- Cmd+N: 근로자 추가
- Cmd+S: 저장
// 예상 시간: 6시간
```

#### 11. 오프라인 지원
```tsx
// 기술: Service Worker, IndexedDB
// 기능: 인터넷 없어도 출근 체크
// 예상 시간: 20시간
```

#### 12. 음성 입력
```tsx
// 기술: Web Speech API
// 기능: "홍길동 출근" 음성으로 체크
// 예상 시간: 16시간
```

**Total**: 54시간 (11일)

---

### P3 (장기 개선 - 3개월)

#### 13. AI 추천 시스템
```
- 퇴사 예상자 알림
- 4대보험 대상자 예측
- 최적 인력 배치 제안
```

#### 14. 모바일 앱 (PWA)
```
- 앱 설치 프롬프트
- 푸시 알림
- 홈 화면 아이콘
```

#### 15. 다국어 지원
```
- 영어, 베트남어, 태국어
- 외국인 근로자 대응
```

---

## 📐 9. 디자인 시스템

### 색상 가이드
```css
/* Primary */
--blue-600: #2563eb;  /* 주요 버튼, CTA */
--blue-500: #3b82f6;  /* 강조, 링크 */

/* Success */
--green-500: #22c55e; /* 출근 완료, 성공 */

/* Warning */
--yellow-500: #eab308; /* 주의, 알림 */

/* Danger */
--red-500: #ef4444;   /* 결근, 오류 */

/* Neutral */
--gray-900: #111827;  /* 본문 텍스트 */
--gray-600: #4b5563;  /* 부가 정보 */
--gray-50: #f9fafb;   /* 배경 */
```

### 타이포그래피
```css
/* 헤딩 */
h1: 2.5rem (40px) / font-bold
h2: 2rem (32px) / font-bold
h3: 1.5rem (24px) / font-bold

/* 본문 */
body: 1rem (16px) / font-medium
small: 0.875rem (14px) / font-normal

/* 버튼 */
button: 1.125rem (18px) / font-bold
```

### 간격 가이드
```css
/* 섹션 간격 */
margin-bottom: 3rem (48px)

/* 카드 패딩 */
padding: 1.5rem (24px)

/* 버튼 높이 */
height: 3rem (48px) /* 모바일 터치 최적 */
height: 4rem (64px) /* 주요 CTA */
```

### 터치 영역 최소 사이즈
```css
/* iOS/Android 권장 */
min-width: 44px;
min-height: 44px;

/* 주요 버튼 */
min-height: 48px; /* 더 편한 터치 */
```

---

## 🎨 10. 컴포넌트 개선안

### EmptyState 컴포넌트
```tsx
// app/components/ui/EmptyState.tsx
interface EmptyStateProps {
  icon: string         // 이모지
  title: string        // 제목
  description: string  // 설명
  action: {
    label: string
    onClick: () => void
  }
  tips?: string[]     // 팁 목록
}

<EmptyState
  icon="👷"
  title="근로자를 추가해보세요"
  description="출근 체크를 하려면 먼저 근로자를 등록해야 합니다."
  action={{
    label: "첫 번째 근로자 등록하기",
    onClick: () => router.push('/workers/new')
  }}
  tips={[
    "이름과 시급만 입력하면 OK",
    "나중에 정보 추가 가능",
    "Excel로 한 번에 등록도 가능해요"
  ]}
/>
```

### TodayAttendanceCard 컴포넌트
```tsx
// app/components/dashboard/TodayAttendanceCard.tsx
<div className="bg-white rounded-3xl p-6 shadow-lg">
  <h2 className="text-2xl font-bold mb-1">
    📅 오늘 출근 체크하기
  </h2>
  <p className="text-gray-500 mb-6">
    {format(new Date(), 'yyyy년 M월 d일 (E)', { locale: ko })}
  </p>

  <div className="space-y-3">
    {todayWorkers.map(worker => (
      <WorkerCheckButton
        key={worker.id}
        worker={worker}
        onCheck={handleCheckIn}
      />
    ))}
  </div>

  {todayWorkers.length === 0 && (
    <EmptyState {...emptyStateProps} />
  )}
</div>
```

### OnboardingProgress 컴포넌트
```tsx
// app/components/onboarding/OnboardingProgress.tsx
<div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-6">
  <h3 className="text-xl font-bold mb-4">
    🎯 시작하기 {completedSteps}/4
  </h3>

  <ProgressBar current={completedSteps} total={4} />

  <div className="space-y-3 mt-4">
    {steps.map((step, index) => (
      <OnboardingStep
        key={index}
        step={step}
        isComplete={index < completedSteps}
        isCurrent={index === completedSteps}
      />
    ))}
  </div>
</div>
```

---

## ✅ 11. 체크리스트

### 랜딩 페이지 개선 체크리스트
- [ ] 히어로 섹션 중앙 정렬
- [ ] CTA 버튼 크기 3배 증가
- [ ] 정보 계층 구조 단순화
- [ ] 첫 방문자 온보딩 모달
- [ ] 모바일 최적화 (320px)

### /home 대시보드 개선 체크리스트
- [ ] 오늘 출근 체크 카드 추가
- [ ] 빈 상태 안내 추가
- [ ] 온보딩 체크리스트 추가
- [ ] 모바일 탭바 개선
- [ ] 툴팁 시스템 적용

### 사용성 개선 체크리스트
- [ ] 모든 터치 영역 44px 이상
- [ ] 로딩 피드백 추가
- [ ] 성공/실패 메시지 추가
- [ ] 에러 복구 방법 안내
- [ ] 도움말 모달 추가

---

## 📞 12. 다음 단계

### 즉시 실행 (1주일)
1. 랜딩 페이지 개선 (P0-1)
2. 대시보드 출근 체크 강조 (P0-2)
3. 빈 상태 안내 (P0-3)
4. 모바일 탭바 개선 (P0-4)

### 사용자 테스트
- 5명의 실제 건설 현장 소장님 초대
- 실제 사용 관찰 (1시간)
- 피드백 수집
- 개선안 반영

### 성공 지표
- 회원가입 완료율: 60% → 80%
- 첫 근로자 등록: 50% → 70%
- 첫 출근 체크: 40% → 65%
- 월간 활성 사용자: 증가 목표

---

**작성 완료일**: 2026-04-19
**다음 리뷰**: 1주일 후 (개선안 적용 후)
