# 노무Pro - Supabase + Prisma 통합 가이드

## 완료된 작업

### 1. 데이터베이스 스키마 ✅
Supabase PostgreSQL에 Prisma 스키마 기반 테이블 생성:
- `profiles` - 사용자 프로필
- `companies` - 건설사
- `sites` - 현장/프로젝트
- `workers` - 근로자
- `attendance` - 출근 기록
- `payroll` - 급여 명세

### 2. RLS (Row Level Security) ✅
모든 테이블에 보안 정책 적용:
- 사용자는 본인의 데이터만 조회/수정/삭제 가능
- Companies → Sites → Workers → Attendance/Payroll 계층 구조 보호
- 최적화된 정책 (auth.uid() 캐싱)

### 3. 인증 시스템 ✅
- Supabase Auth 완전 통합
- 이메일/비밀번호 로그인
- 자동 프로필 생성 (트리거)
- 보호된 라우트 (middleware)

### 4. API 통합 ✅
기존 API 라우트들이 Prisma를 통해 Supabase와 연결됨:
- `/api/workers` - 근로자 CRUD
- `/api/attendance` - 출근 기록 CRUD
- `/api/payroll` - 급여 CRUD
- `/api/companies` - 건설사 CRUD
- `/api/sites` - 현장 CRUD

## 사용 방법

### 1. 인증

#### 클라이언트 컴포넌트에서 사용
```tsx
'use client'

import { useAuth } from '@/lib/hooks/useAuth'

export default function MyComponent() {
  const { user, loading, supabase } = useAuth()

  if (loading) return <div>로딩 중...</div>
  if (!user) return <div>로그인이 필요합니다</div>

  return <div>환영합니다, {user.email}!</div>
}
```

#### 서버 컴포넌트에서 사용
```tsx
import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function ServerComponent() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return <div>환영합니다, {user.email}!</div>
}
```

### 2. 데이터베이스 쿼리

#### Prisma 사용 (API 라우트)
```typescript
import prisma from '@/lib/prisma'

// 근로자 조회
const workers = await prisma.worker.findMany({
  where: { siteId: 'some-uuid' },
  include: {
    site: true,
    attendance: true
  }
})

// 출근 기록 생성
const attendance = await prisma.attendance.create({
  data: {
    workerId: 'worker-uuid',
    siteId: 'site-uuid',
    date: new Date(),
    hoursWorked: 8.0,
    isWeeklyHoliday: false
  }
})
```

#### Supabase 직접 사용 (클라이언트)
```tsx
'use client'

import { createSupabaseClient } from '@/lib/supabase/client'

export default function MyComponent() {
  const supabase = createSupabaseClient()

  const fetchWorkers = async () => {
    const { data, error } = await supabase
      .from('workers')
      .select('*, site:sites(*)')
      .eq('is_active', true)

    if (error) console.error(error)
    else console.log(data)
  }

  return <button onClick={fetchWorkers}>근로자 조회</button>
}
```

### 3. 프론트엔드 통합 예제

#### 근로자 목록 페이지
```tsx
'use client'

import { useEffect, useState } from 'react'

export default function WorkersPage() {
  const [workers, setWorkers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/workers')
      .then(res => res.json())
      .then(data => {
        setWorkers(data)
        setLoading(false)
      })
  }, [])

  if (loading) return <div>로딩 중...</div>

  return (
    <div>
      <h1>근로자 목록</h1>
      <ul>
        {workers.map(worker => (
          <li key={worker.id}>
            {worker.name} - {worker.hourlyRate}원/시간
          </li>
        ))}
      </ul>
    </div>
  )
}
```

#### 출근 기록 생성
```tsx
'use client'

export default function AttendanceForm() {
  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)

    const response = await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workerId: formData.get('workerId'),
        siteId: formData.get('siteId'),
        date: formData.get('date'),
        hoursWorked: Number(formData.get('hoursWorked')),
        isWeeklyHoliday: formData.get('isWeeklyHoliday') === 'on'
      })
    })

    if (response.ok) {
      alert('출근 기록이 저장되었습니다')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit">저장</button>
    </form>
  )
}
```

## 데이터베이스 마이그레이션

### Prisma 스키마 수정 후
```bash
# 1. Prisma 스키마 수정 (prisma/schema.prisma)
# 2. SQL 마이그레이션 생성
npx prisma migrate dev --name your_migration_name

# 3. Prisma 클라이언트 재생성
npx prisma generate
```

### Supabase에 직접 마이그레이션 적용
MCP를 통해 Supabase에 직접 마이그레이션을 적용할 수 있습니다:
```typescript
// Claude Code MCP 사용
mcp__supabase__apply_migration({
  name: "migration_name",
  query: "SQL 쿼리"
})
```

## 보안 체크리스트

- ✅ RLS 정책 활성화됨
- ✅ 사용자별 데이터 격리
- ✅ 인증된 사용자만 API 접근 가능
- ✅ 비밀번호 안전하게 관리 (Supabase Auth)
- ✅ HTTPS 사용 (프로덕션)

## 환경 변수

`.env.local`에 다음 변수들이 설정되어 있어야 합니다:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=your-database-url
DIRECT_URL=your-direct-url
```

## 테스트

### 1. 회원가입 테스트
1. `/auth/login` 접속
2. "회원가입" 클릭
3. 이메일/비밀번호 입력
4. 이메일 확인 후 활성화

### 2. 로그인 테스트
1. `/auth/login` 접속
2. 이메일/비밀번호 입력
3. 홈페이지로 리다이렉트 확인

### 3. API 테스트
```bash
# 로그인 후 쿠키와 함께 요청
curl http://localhost:3000/api/workers
curl http://localhost:3000/api/attendance?siteId=some-uuid
```

## 다음 단계

1. **회사/현장 생성 기능** - 사용자가 회사와 현장을 만들 수 있는 UI 추가
2. **근로자 관리 UI** - 기존 WorkerForm/WorkerList 컴포넌트와 통합
3. **출근 관리 UI** - CalendarView와 AttendanceForm 통합
4. **급여 계산 자동화** - Payroll 생성 및 계산 로직 구현
5. **대시보드 통계** - 현황판에 실시간 데이터 표시

## 문제 해결

### RLS 정책으로 데이터 조회 안 됨
- 로그인 상태 확인
- `auth.uid()`가 올바른 사용자 ID를 반환하는지 확인
- 해당 데이터의 owner_id가 현재 사용자 ID와 일치하는지 확인

### Prisma 타입 오류
```bash
npx prisma generate
```

### 마이그레이션 충돌
Supabase와 Prisma 마이그레이션이 충돌할 경우:
1. Supabase에서 직접 마이그레이션 적용 (MCP 사용)
2. Prisma 스키마를 Supabase 상태에 맞게 수정
3. `prisma db pull`로 동기화

## 참고 문서

- [Supabase 공식 문서](https://supabase.com/docs)
- [Prisma 공식 문서](https://www.prisma.io/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
