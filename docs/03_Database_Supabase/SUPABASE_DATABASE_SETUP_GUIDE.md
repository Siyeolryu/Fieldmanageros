# 🎯 Supabase 데이터베이스 연결 설정 가이드

## 📌 지금 해야 할 일

브라우저에서 다음 페이지가 열려있어야 합니다:
```
https://supabase.com/dashboard/project/ejgsotsviobjfvfqovcj/database/settings
```

만약 안 열렸다면 위 주소를 복사해서 브라우저에 붙여넣으세요.

---

## 1단계: Connection String 찾기 (10초)

페이지를 아래로 스크롤하면 **"Connection String"** 이라는 큰 제목이 보입니다.

그 아래에 3개의 탭이 있습니다:
```
┌─────────────┬──────────────┬─────────────┐
│   URI       │  JDBC       │   .NET      │
└─────────────┴──────────────┴─────────────┘
```

**"URI"** 탭을 클릭하세요. (보통 기본으로 선택되어 있습니다)

---

## 2단계: Mode 선택하기 (5초)

URI 탭 아래에 **"Mode"** 라는 선택 버튼이 2개 있습니다:

```
○ Session mode
○ Transaction mode
```

**"Transaction mode"**를 선택하세요. (동그라미에 점이 찍힙니다)

---

## 3단계: 연결 문자열 복사하기 (10초)

이제 아래에 긴 텍스트 상자가 보입니다:

```
┌──────────────────────────────────────────────────────┐
│ postgresql://postgres.[PROJECT-ID]:[YOUR-PASSWORD]@ │
│ aws-0-ap-northeast-1.pooler.supabase.com:6543/...   │
│                                                [복사] │
└──────────────────────────────────────────────────────┘
```

**오른쪽에 있는 "복사" 아이콘** (또는 "Copy" 버튼)을 클릭하세요.

---

## 4단계: 메모장에 붙여넣기 (10초)

1. 윈도우 검색에서 **"메모장"** 을 엽니다
2. `Ctrl + V` 를 눌러 복사한 내용을 붙여넣습니다
3. 이렇게 생긴 문자열이 나타납니다:

```
postgresql://postgres.ejgsotsviobjfvfqovcj:[YOUR-PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?workaround=supabase-pooler.vercel
```

---

## 5단계: 비밀번호 교체하기 (20초)

메모장에서:

1. `[YOUR-PASSWORD]` 부분을 찾습니다
   - (또는 `********` 같은 별표가 보일 수 있습니다)

2. 이 부분을 **`guswk0925!!`** 로 교체합니다

**교체 전:**
```
postgresql://postgres.ejgsotsviobjfvfqovcj:[YOUR-PASSWORD]@aws-0...
```

**교체 후:**
```
postgresql://postgres.ejgsotsviobjfvfqovcj:guswk0925!!@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?workaround=supabase-pooler.vercel
```

3. 메모장 내용 **전체 선택** (`Ctrl + A`)
4. **복사** (`Ctrl + C`)

---

## 6단계: 나에게 알려주기 (5초)

복사한 연결 문자열을 채팅창에 붙여넣어 주세요.

예시:
```
postgresql://postgres.ejgsotsviobjfvfqovcj:guswk0925!!@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?workaround=supabase-pooler.vercel
```

그러면 제가 자동으로 설정을 완료하겠습니다!

---

## ⚠️ 만약 Connection String이 안 보인다면?

### 방법 1: 다른 탭 확인
페이지 위쪽에 탭이 여러 개 있습니다:
```
┌─────────┬─────────┬─────────┬─────────┐
│ General │ Backups │ Network │  API    │
└─────────┴─────────┴─────────┴─────────┘
```

**"API"** 탭을 클릭하고 아래로 스크롤하세요.

### 방법 2: 직접 주소로 이동
브라우저 주소창에 이 주소를 입력하세요:
```
https://supabase.com/dashboard/project/ejgsotsviobjfvfqovcj/settings/api
```

그리고 페이지를 아래로 스크롤하여 "Connection pooling" 섹션을 찾으세요.

---

## 📝 요약

1. ✅ URI 탭 클릭
2. ✅ Transaction mode 선택
3. ✅ 복사 버튼 클릭
4. ✅ 메모장에 붙여넣기
5. ✅ `[YOUR-PASSWORD]` → `guswk0925!!` 교체
6. ✅ 전체 복사해서 나에게 보내기

**예상 소요 시간: 1분**

---

## 🎁 복사할 내용이 이미 여기 있어요!

만약 복잡하면, 아래 문자열을 그대로 복사해서 나에게 보내주세요:
(단, 실제 대시보드에서 복사한 것과 형식이 다를 수 있으니 위 단계를 따르는 게 더 정확합니다)

```
postgresql://postgres.ejgsotsviobjfvfqovcj:guswk0925!!@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
```

---

**작성 일시**: 2026-04-26
**난이도**: ⭐ (매우 쉬움)
