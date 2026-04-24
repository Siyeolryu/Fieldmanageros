# 노무Pro UI/UX 개선 및 기능 추가 작업 지시서

**작성일**: 2026-04-23
**검토자**: Claude Sonnet 4.5
**상태**: 계획 수립 완료

---

## 📋 목차

1. [요구사항 요약](#요구사항-요약)
2. [코드베이스 분석 결과](#코드베이스-분석-결과)
3. [작업 계획 (우선순위별)](#작업-계획-우선순위별)
4. [각 요구사항별 상세 계획](#각-요구사항별-상세-계획)
5. [에이전트 배정 계획](#에이전트-배정-계획)
6. [예상 일정](#예상-일정)

---

## 요구사항 요약

### 1. 출근 등록 완료 팝업 알림 메시지 개선
**문제**: window.alert으로 Vercel URL이 노출되어 전문성 떨어짐
**해결**: Toast 알림 시스템 (sonner 또는 react-hot-toast) 도입

### 2. 출근 기록 시 '시간 단위 / 일 단위' 선택 UI 추가
**문제**: 현재 공수(gongsu)만 입력 가능
**해결**: 탭/라디오 버튼으로 "시간 단위" / "일 단위" 선택 추가

### 3. 엑셀 업로드 양식 샘플 다운로드 기능 추가
**문제**: 엑셀 양식을 사용자가 모름
**해결**: 샘플 양식 다운로드 버튼 추가

### 4. Home 페이지에 '대시보드 바로가기' 버튼 추가
**문제**: /home에서 /dashboard로 이동 동선 불명확
**해결**: 명확한 "대시보드로 가기" 버튼 추가

### 5. 랜딩 페이지를 첫 화면 및 로그인 페이지로 설정
**상태**: ✅ **이미 완료됨** (커밋 f2316c9)
**확인**: app/page.tsx가 랜딩 페이지로 설정되어 있음

---

## 코드베이스 분석 결과

### 관련 파일 매핑

| 요구사항 | 수정 필요 파일 | 파일 유형 |
|---------|---------------|----------|
| 1. Toast 알림 | `app/components/attendance/AttendanceForm.tsx`<br>`app/components/attendance/BulkAttendanceForm.tsx` | 프론트엔드 |
| 2. 시간/일 단위 UI | `app/components/attendance/AttendanceForm.tsx`<br>`app/api/attendance/route.ts` (확인) | 프론트엔드 + 백엔드 |
| 3. 엑셀 샘플 | `app/components/excel/ExcelUploadModal.tsx`<br>`public/samples/` (생성) | 프론트엔드 + 파일 |
| 4. 대시보드 버튼 | `app/home/page.tsx` | 프론트엔드 |
| 5. 랜딩 페이지 | `app/page.tsx` (확인만) | - |

### 현재 구조 분석

#### AttendanceForm.tsx 현황
```typescript
// 현재 구조
- Worker 선택 드롭다운
- 날짜 선택
- 공수(gongsu) 입력 (+0.5/-0.5 매크로 버튼)
- 주휴수당 체크박스
- 메모 입력
- 제출 시: window.alert() 사용 ❌
```

#### ExcelUploadModal.tsx 현황
```typescript
// 현재 구조
- 파일 선택 (drag-drop 지원)
- 업로드 타입별 안내 텍스트
- 성공/실패 메시지
- 샘플 다운로드 버튼 없음 ❌
```

#### Home Page 현황
```typescript
// 현재 구조
- Site selector
- 통계 카드 (근로자 수, 오늘 출근, 월 인건비)
- 비용 차트
- 리스크 레이더
- 캘린더 뷰
- 하단 탭바 (홈, 근로자, +, 대장, 설정)
- Dashboard 직접 이동 버튼 없음 ❌
```

---

## 작업 계획 (우선순위별)

### 🔴 Phase A: 긴급 (1일) - UX 개선

**우선순위 1 - Toast 알림 시스템 도입**
- 영향도: 높음 (모든 폼에서 사용)
- 난이도: 낮음
- 작업량: 2-3시간

**우선순위 2 - 대시보드 바로가기 버튼**
- 영향도: 높음 (사용자 네비게이션)
- 난이도: 낮음
- 작업량: 1시간

### 🟡 Phase B: 중요 (1-2일) - 기능 추가

**우선순위 3 - 엑셀 샘플 다운로드**
- 영향도: 중간 (업로드 사용성)
- 난이도: 낮음
- 작업량: 2-3시간

**우선순위 4 - 시간/일 단위 선택 UI**
- 영향도: 중간 (출근 기록 유연성)
- 난이도: 중간
- 작업량: 4-6시간

### 🟢 Phase C: 확인 (0.5일)

**우선순위 5 - 랜딩 페이지 확인**
- 영향도: 낮음 (이미 완료)
- 난이도: 없음
- 작업량: 30분 (확인만)

---

## 각 요구사항별 상세 계획

### 1️⃣ Toast 알림 시스템 도입

#### 목표
window.alert을 세련된 Toast 알림으로 교체

#### 기술 스택 선택
**권장**: `sonner` (by shadcn/ui)
- 이유:
  - 가볍고 빠름 (2.4KB)
  - 접근성 우수 (ARIA)
  - Next.js 호환
  - TypeScript 지원
  - 커스터마이징 쉬움

**대안**: `react-hot-toast`

#### 구현 계획

##### Step 1: 패키지 설치
```bash
npm install sonner
```

##### Step 2: ToastProvider 설정
**파일**: `app/layout.tsx` 또는 `app/components/providers/ToastProvider.tsx`

```typescript
import { Toaster } from 'sonner'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
```

##### Step 3: AttendanceForm.tsx 수정
**파일**: `app/components/attendance/AttendanceForm.tsx`

```typescript
import { toast } from 'sonner'

// Before
window.alert('출근 등록이 완료되었습니다.')

// After
toast.success('출근 등록이 성공적으로 완료되었습니다.', {
  description: `${workerName} - ${date}`,
  duration: 3000,
})
```

##### Step 4: BulkAttendanceForm.tsx 수정
**파일**: `app/components/attendance/BulkAttendanceForm.tsx`

```typescript
// 성공 시
toast.success('일괄 출근 등록이 완료되었습니다.', {
  description: `${savedCount}명의 근로자 출근 기록`,
})

// 실패 시
toast.error('출근 등록에 실패했습니다.', {
  description: error.message,
})
```

##### Step 5: 다른 폼에도 적용
- WorkerForm.tsx
- SiteForm.tsx
- CompanyForm.tsx
- ExcelUploadModal.tsx

#### 테스트 계획
- [ ] 출근 등록 성공 시 Toast 표시
- [ ] 일괄 등록 성공 시 Toast 표시
- [ ] 에러 발생 시 Toast 표시
- [ ] 모바일에서 Toast 위치 확인

---

### 2️⃣ 시간/일 단위 선택 UI 추가

#### 목표
출근 기록 시 "시간 단위" (시작/종료 시간) 또는 "일 단위" (공수) 선택 가능

#### 현재 구조 분석

**AttendanceForm.tsx 현재**:
```typescript
- gongsu (공수) 입력만 가능
- 1.0공수 = 8시간 자동 계산
- +0.5/-0.5 매크로 버튼
```

**데이터베이스 스키마** (`prisma/schema.prisma`):
```prisma
model Attendance {
  id              String   @id @default(uuid()) @db.Uuid
  worker_id       String   @db.Uuid
  date            DateTime @db.Date
  hours_worked    Decimal  @db.Decimal(4, 2)  // 시간
  gongsu          Decimal? @db.Decimal(3, 1)  // 공수
  // ...
}
```

**API 엔드포인트** (`app/api/attendance/route.ts`):
- POST 요청에서 `hours_worked` 또는 `gongsu` 받음
- 변환 로직 이미 존재

#### UI 설계

##### Option 1: 탭 UI (권장)
```
┌─────────────────────────────────────┐
│  [시간 단위]  [일 단위] ← 탭      │
├─────────────────────────────────────┤
│  시간 단위 선택 시:                  │
│  ├─ 시작 시간: [09:00] [AM/PM]      │
│  └─ 종료 시간: [18:00] [AM/PM]      │
│                                     │
│  일 단위 선택 시:                    │
│  ├─ 공수: [1.0] [+0.5] [-0.5]       │
│  └─ (현재 UI와 동일)                 │
└─────────────────────────────────────┘
```

##### Option 2: 라디오 버튼
```
○ 시간 단위  ● 일 단위
```

#### 구현 계획

##### Step 1: State 추가
```typescript
const [inputMode, setInputMode] = useState<'time' | 'gongsu'>('gongsu')
const [startTime, setStartTime] = useState('09:00')
const [endTime, setEndTime] = useState('18:00')
```

##### Step 2: 탭 UI 컴포넌트
```typescript
<div className="flex gap-2 mb-4">
  <button
    className={inputMode === 'time' ? 'active' : ''}
    onClick={() => setInputMode('time')}
  >
    시간 단위
  </button>
  <button
    className={inputMode === 'gongsu' ? 'active' : ''}
    onClick={() => setInputMode('gongsu')}
  >
    일 단위
  </button>
</div>
```

##### Step 3: 조건부 렌더링
```typescript
{inputMode === 'time' ? (
  <div>
    <label>시작 시간</label>
    <input type="time" value={startTime} onChange={...} />

    <label>종료 시간</label>
    <input type="time" value={endTime} onChange={...} />
  </div>
) : (
  <div>
    {/* 기존 공수 입력 UI */}
  </div>
)}
```

##### Step 4: 시간 계산 로직
```typescript
const calculateHours = (start: string, end: string): number => {
  const [startHour, startMin] = start.split(':').map(Number)
  const [endHour, endMin] = end.split(':').map(Number)

  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin

  const diff = endMinutes - startMinutes
  return diff / 60 // 시간으로 변환
}

// 제출 시
const hoursWorked = inputMode === 'time'
  ? calculateHours(startTime, endTime)
  : gongsu * 8
```

##### Step 5: API 호출
```typescript
await fetch('/api/attendance', {
  method: 'POST',
  body: JSON.stringify({
    worker_id: workerId,
    date: selectedDate,
    hours_worked: hoursWorked,
    gongsu: inputMode === 'gongsu' ? gongsu : hoursWorked / 8,
    input_mode: inputMode, // 로그용
  }),
})
```

#### 백엔드 확인 사항
- `app/api/attendance/route.ts`에서 이미 `hours_worked` 처리 가능
- 추가 수정 불필요 (현재 스키마로 충분)

---

### 3️⃣ 엑셀 샘플 다운로드 기능 추가

#### 목표
엑셀 업로드 모달에 샘플 양식 다운로드 버튼 추가

#### 현재 구조

**ExcelUploadModal.tsx**:
- 파일 선택 UI
- 업로드 타입별 안내 텍스트
- `attendance` / `workers` / `ledger` 타입

**Excel Parser** (`lib/excel/parser.ts`):
```typescript
parseAttendanceExcel() // 이름 | 날짜 | 근무시간 | 주휴 | 메모
parseWorkersExcel()    // 이름 | 전화번호 | 주민번호 | 은행 | 계좌 | 시급
parsePayrollLedgerExcel() // 통합 노임대장
```

#### 구현 계획

##### Step 1: 샘플 엑셀 파일 생성
**경로**: `public/samples/`

**파일 목록**:
1. `attendance_sample.xlsx` - 출근 기록 샘플
2. `workers_sample.xlsx` - 근로자 정보 샘플
3. `ledger_sample.xlsx` - 노임대장 샘플

**샘플 데이터 (attendance_sample.xlsx)**:
| 이름 | 날짜 | 근무시간 | 주휴수당 | 비고 |
|------|------|---------|---------|------|
| 홍길동 | 2026-04-01 | 8 | O | |
| 김철수 | 2026-04-01 | 9 | X | 연장근무 |

**샘플 데이터 (workers_sample.xlsx)**:
| 이름 | 전화번호 | 주민번호 | 은행 | 계좌번호 | 시급 |
|------|---------|---------|------|---------|------|
| 홍길동 | 010-1234-5678 | 900101-1****** | 국민은행 | 123-456-789 | 25000 |

##### Step 2: ExcelUploadModal.tsx 수정
```typescript
<div className="mb-4 p-3 bg-blue-50 rounded-lg">
  <p className="text-sm text-blue-900 mb-2">
    💡 엑셀 양식을 모르시나요?
  </p>
  <button
    onClick={downloadSample}
    className="text-sm text-blue-600 hover:text-blue-800 font-semibold underline"
  >
    📥 샘플 양식 다운로드
  </button>
</div>
```

##### Step 3: 다운로드 함수
```typescript
const downloadSample = () => {
  const sampleFiles = {
    attendance: '/samples/attendance_sample.xlsx',
    workers: '/samples/workers_sample.xlsx',
    ledger: '/samples/ledger_sample.xlsx',
  }

  const link = document.createElement('a')
  link.href = sampleFiles[uploadType]
  link.download = `노무PRO_${uploadType}_샘플.xlsx`
  link.click()

  toast.success('샘플 양식을 다운로드했습니다.')
}
```

##### Step 4: 샘플 파일 생성 스크립트
**파일**: `scripts/generate-excel-samples.ts`

```typescript
import XLSX from 'xlsx'

const generateAttendanceSample = () => {
  const data = [
    ['이름', '날짜', '근무시간', '주휴수당', '비고'],
    ['홍길동', '2026-04-01', 8, 'O', ''],
    ['김철수', '2026-04-01', 9, 'X', '연장근무'],
  ]

  const ws = XLSX.utils.aoa_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '출근기록')
  XLSX.writeFile(wb, 'public/samples/attendance_sample.xlsx')
}

// workers, ledger도 동일하게 생성
```

##### Step 5: npm 스크립트 추가
```json
"scripts": {
  "generate:samples": "tsx scripts/generate-excel-samples.ts"
}
```

---

### 4️⃣ Home 페이지에 대시보드 바로가기 버튼

#### 목표
/home에서 /dashboard로 쉽게 이동할 수 있는 버튼 추가

#### 현재 구조 분석

**app/home/page.tsx**:
- 상단: Site selector
- 중앙: 통계 카드, 차트, 캘린더
- 하단: 탭바 (홈, 근로자, +, 대장, 설정)

#### UI 배치 옵션

##### Option 1: 상단 헤더 우측 (권장)
```
┌────────────────────────────────────┐
│  [Site Selector ▼]  [대시보드로→] │ ← 추가
├────────────────────────────────────┤
│  통계 카드...                       │
└────────────────────────────────────┘
```

##### Option 2: 프로필 드롭다운 메뉴에 추가
```
┌─────────────────┐
│ 프로필 설정      │
│ 대시보드로 이동  │ ← 추가
│ 로그아웃        │
└─────────────────┘
```

##### Option 3: 플로팅 액션 버튼 (FAB)
```
                    ╭─────╮
                    │ ☰   │ ← 우측 하단 고정
                    ╰─────╯
```

#### 구현 계획 (Option 1 권장)

##### Step 1: 버튼 컴포넌트
```typescript
// app/home/page.tsx
<div className="flex items-center justify-between mb-6">
  <SiteSelector />

  <Link href="/dashboard">
    <Button variant="outline" className="gap-2">
      <FiGrid className="w-4 h-4" />
      대시보드
    </Button>
  </Link>
</div>
```

##### Step 2: 모바일 대응
```typescript
// 768px 이상: 텍스트 버튼
// 768px 미만: 아이콘만
<Link href="/dashboard">
  <Button variant="outline" className="gap-2">
    <FiGrid className="w-4 h-4" />
    <span className="hidden md:inline">대시보드</span>
  </Button>
</Link>
```

##### Step 3: Tooltip 추가
```typescript
import Tooltip from '@/app/components/ui/Tooltip'

<Tooltip content="전체 메뉴 보기" position="bottom">
  <Link href="/dashboard">
    <Button variant="outline">
      <FiGrid className="w-4 h-4" />
    </Button>
  </Link>
</Tooltip>
```

---

### 5️⃣ 랜딩 페이지 첫 화면 설정

#### 상태
✅ **이미 완료됨**

#### 확인 사항

**커밋**: `f2316c9` - "feat: use landing page as primary entry point and add social login"

**파일 확인**:
- `app/page.tsx` - 랜딩 페이지가 루트 경로 (/)에 설정됨
- 로그인 전: 서비스 소개, 회원가입 폼
- 로그인 후: /home으로 리디렉션

**추가 작업 불필요**

---

## 에이전트 배정 계획

### 백엔드 Agent (backend-designer)

**담당 작업**:
- ✅ API 확인 (attendance route가 hours_worked 처리 가능한지)
- ✅ 데이터베이스 스키마 확인 (추가 필드 필요 여부)
- ⚠️ 예상: 추가 작업 불필요 (현재 구조로 충분)

**작업 시간**: 1시간 (확인만)

---

### 프론트엔드 Agent (Plan + Implement)

**담당 작업**:
1. Toast 알림 시스템 도입 (2-3시간)
   - sonner 설치
   - ToastProvider 설정
   - 모든 alert() 교체

2. 시간/일 단위 선택 UI (4-6시간)
   - AttendanceForm.tsx 수정
   - 탭 UI 구현
   - 시간 계산 로직
   - 테스트

3. 엑셀 샘플 다운로드 (2-3시간)
   - 샘플 파일 생성 스크립트
   - ExcelUploadModal.tsx 수정
   - 다운로드 버튼 추가

4. 대시보드 바로가기 버튼 (1시간)
   - Home page 수정
   - 링크 추가

**작업 시간**: 9-13시간 (1.5일)

---

### UX Designer Agent (ux-designer)

**담당 작업**:
1. Toast 알림 메시지 문구 검토
2. 시간/일 단위 선택 UI 레이아웃 검토
3. 엑셀 업로드 모달 UX 개선 제안
4. 대시보드 버튼 배치 위치 검토
5. 전체 사용자 플로우 검증

**작업 시간**: 2-3시간

---

## 예상 일정

### Day 1: Phase A (긴급 UX 개선)

**오전** (4시간):
- [ ] Toast 알림 시스템 도입
  - [ ] sonner 설치 및 설정
  - [ ] AttendanceForm.tsx 수정
  - [ ] BulkAttendanceForm.tsx 수정
  - [ ] 다른 폼에 적용

**오후** (4시간):
- [ ] 대시보드 바로가기 버튼
  - [ ] Home page 수정
  - [ ] 모바일 대응
  - [ ] Tooltip 추가
- [ ] UX 검토 및 테스트

---

### Day 2: Phase B (기능 추가)

**오전** (4시간):
- [ ] 엑셀 샘플 다운로드
  - [ ] 샘플 파일 생성 스크립트
  - [ ] 3개 샘플 파일 생성
  - [ ] ExcelUploadModal 수정
  - [ ] 다운로드 기능 구현

**오후** (4시간):
- [ ] 시간/일 단위 선택 UI (Part 1)
  - [ ] 탭 UI 구현
  - [ ] State 관리
  - [ ] 조건부 렌더링

---

### Day 3: Phase B 완료 및 테스트

**오전** (3시간):
- [ ] 시간/일 단위 선택 UI (Part 2)
  - [ ] 시간 계산 로직
  - [ ] API 연동
  - [ ] 에러 처리

**오후** (3시간):
- [ ] 통합 테스트
  - [ ] 모든 기능 테스트
  - [ ] 모바일 테스트
  - [ ] 접근성 테스트
- [ ] 버그 수정
- [ ] 문서 업데이트

---

### 최종 체크리스트

#### Phase A: 긴급 UX 개선
- [ ] Toast 알림 시스템 도입
  - [ ] sonner 설치
  - [ ] ToastProvider 설정
  - [ ] AttendanceForm.tsx 수정
  - [ ] BulkAttendanceForm.tsx 수정
  - [ ] WorkerForm.tsx 수정
  - [ ] SiteForm.tsx 수정
  - [ ] CompanyForm.tsx 수정
  - [ ] ExcelUploadModal.tsx 수정

- [ ] 대시보드 바로가기 버튼
  - [ ] Home page 버튼 추가
  - [ ] 모바일 반응형 확인
  - [ ] Tooltip 추가

#### Phase B: 기능 추가
- [ ] 엑셀 샘플 다운로드
  - [ ] 샘플 생성 스크립트 작성
  - [ ] attendance_sample.xlsx 생성
  - [ ] workers_sample.xlsx 생성
  - [ ] ledger_sample.xlsx 생성
  - [ ] ExcelUploadModal 버튼 추가
  - [ ] 다운로드 기능 구현

- [ ] 시간/일 단위 선택 UI
  - [ ] 탭 UI 컴포넌트
  - [ ] 시간 입력 폼
  - [ ] 공수 입력 폼 (기존)
  - [ ] 시간 계산 로직
  - [ ] API 연동
  - [ ] 에러 처리

#### Phase C: 확인
- [ ] 랜딩 페이지 확인
  - [ ] app/page.tsx 확인
  - [ ] 루트 경로 동작 확인

#### 테스트
- [ ] Toast 알림 표시 확인
- [ ] 시간 단위 입력 확인
- [ ] 일 단위 입력 확인
- [ ] 엑셀 샘플 다운로드 확인
- [ ] 대시보드 이동 확인
- [ ] 모바일 반응형 확인
- [ ] 접근성 확인

---

## 리스크 및 고려사항

### 잠재적 이슈

1. **Toast 알림 중복**
   - 문제: 짧은 시간에 여러 Toast 표시 시 화면 가득 참
   - 해결: `toast.dismiss()` 사용, 최대 3개 제한

2. **시간 계산 로직**
   - 문제: 야간 근무 (23:00 ~ 06:00) 처리
   - 해결: 날짜를 넘어가는 경우 24시간 더하기

3. **엑셀 샘플 파일 크기**
   - 문제: Git에 바이너리 파일 커밋
   - 해결: 10KB 이하로 유지, .gitattributes 설정

4. **모바일 시간 입력**
   - 문제: iOS/Android 시간 입력 UI 차이
   - 해결: HTML5 `<input type="time">` 사용 (네이티브 UI)

### 성능 고려사항

- Toast 라이브러리: sonner (2.4KB) - 가벼움
- 엑셀 파일: 각 10KB 이하 유지
- 추가 HTTP 요청 없음 (샘플 파일은 static)

---

## 다음 단계

1. ✅ 계획 수립 완료
2. ⏭️ 백엔드 에이전트 실행 (API 확인)
3. ⏭️ 프론트엔드 에이전트 실행 (구현)
4. ⏭️ UX 디자이너 에이전트 실행 (검토)
5. ⏭️ 통합 테스트
6. ⏭️ 배포

---

**작성 완료**: 2026-04-23
**검토자**: Claude Sonnet 4.5
**승인 대기 중**
