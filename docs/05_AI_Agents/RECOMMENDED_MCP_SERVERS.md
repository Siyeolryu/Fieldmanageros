# Baseball Insight Pro - 추천 MCP 서버

## 프로젝트 개요
KBO 리그 야구 예측 분석 플랫폼을 위한 필수 및 권장 MCP 서버 목록입니다.

---

## 🗄️ 데이터베이스 (필수)

### 1. **Supabase MCP Server** ✅ (이미 설치됨)
- **서버 ID**: `@supabase-community/supabase-mcp`
- **설치 명령**: `smithery mcp add @supabase-community/supabase-mcp`
- **기능**:
  - Supabase 프로젝트 연결
  - 테이블 관리 및 데이터 쿼리
  - 실시간 데이터베이스 작업
- **사용 사례**: 사용자 관리, 구독 데이터, 게임 예측 저장
- **문서**: [Supabase MCP Server](https://smithery.ai/server/@supabase-community/supabase-mcp)

### 2. **Neon Postgres MCP Server** (대안)
- **서버 ID**: `@neondatabase-labs/mcp-server-neon`
- **설치 명령**: `smithery mcp add @neondatabase-labs/mcp-server-neon`
- **기능**:
  - 자연어로 Neon Postgres 데이터베이스 관리
  - 프로젝트, 브랜치, 쿼리, 마이그레이션 관리
  - Neon API 통합
- **사용 사례**: Supabase 대안으로 사용 가능
- **문서**: [Neon MCP Server](https://mcp.so/server/mcp-server-neon/neondatabase-labs)

### 3. **PostgreSQL MCP Server** (직접 연결)
- **서버 ID**: `@smithery-ai/postgres`
- **설치 명령**: `smithery mcp add @smithery-ai/postgres`
- **기능**:
  - PostgreSQL 데이터베이스 스키마 검사
  - 읽기 전용 쿼리 실행
  - 테이블 구조 설명
- **사용 사례**: 로컬 PostgreSQL 데이터베이스 직접 연결
- **문서**: [PostgreSQL MCP Server](https://smithery.ai/server/@smithery-ai/postgres)

---

## 🌦️ 날씨 API (필수 - 환경 분석용)

### 4. **Weather MCP Server**
- **서버 ID**: `@isdaniel/mcp_weather_server` 또는 `@sd543521/mcp_weather_server`
- **설치 명령**: `smithery mcp add @isdaniel/mcp_weather_server`
- **기능**:
  - API 키 없이 현재 및 과거 날씨 데이터 조회
  - 도시별 날씨 정보 제공
  - 온도, 습도, 바람 방향/속도 데이터
- **사용 사례**:
  - 경기장별 환경 분석
  - 날씨가 타구 속도에 미치는 영향 분석
  - 바람 방향/습도 데이터 수집
- **문서**:
  - [Weather Server 1](https://smithery.ai/servers/@isdaniel/mcp_weather_server)
  - [Weather Server 2](https://smithery.ai/server/@sd543521/mcp_weather_server)

---

## 🌐 웹 스크래핑 & 브라우저 자동화 (중요)

### 5. **Microsoft Playwright MCP Server** ⭐ (강력 추천)
- **서버 ID**: `microsoft/playwright-mcp`
- **설치 명령**: `smithery mcp add microsoft/playwright-mcp`
- **기능**:
  - Chromium, Firefox, WebKit 브라우저 자동화
  - 동적 JavaScript 렌더링 페이지 처리
  - 스크린샷 캡처, 폼 입력, 페이지 네비게이션
  - 접근성 스냅샷을 통한 구조화된 데이터 추출
- **사용 사례**:
  - KBO 공식 웹사이트에서 실시간 경기 데이터 수집
  - 선수 통계 페이지 스크래핑
  - 동적으로 로드되는 게임 일정 수집
- **문서**:
  - [Microsoft Playwright MCP](https://github.com/microsoft/playwright-mcp)
  - [Smithery - Playwright](https://smithery.ai/server/@executeautomation/playwright-mcp-server)

### 6. **Fetch MCP Server**
- **서버 ID**: `fetch-mcp`
- **설치 명령**: `smithery mcp add fetch-mcp`
- **기능**:
  - HTML, JSON, 플레인 텍스트, 마크다운 형식으로 웹 콘텐츠 가져오기
  - 효율적인 LLM 사용을 위한 콘텐츠 변환
- **사용 사례**:
  - 정적 페이지에서 야구 뉴스/분석 수집
  - API 엔드포인트 호출
- **문서**: [Fetch MCP Server](https://smithery.ai/server/fetch-mcp)

### 7. **Puppeteer MCP Server** (대안)
- **서버 ID**: `@automatalabs/puppeteer` (예상)
- **기능**:
  - Chrome/Chromium 브라우저 자동화
  - JavaScript 실행 및 동적 콘텐츠 처리
  - 스크린샷 및 PDF 생성
- **사용 사례**: Playwright의 대안으로 사용 가능

---

## 📊 데이터 분석 & 통합 (선택)

### 8. **Dumpling AI MCP Server**
- **서버 ID**: `@Dumpling-AI/mcp-server-dumplingai`
- **설치 명령**: `smithery mcp add @Dumpling-AI/mcp-server-dumplingai`
- **기능**:
  - 데이터 스크래핑, 콘텐츠 처리, AI 기능 통합
  - 문서 변환, 지식 관리
- **사용 사례**: 복잡한 데이터 처리 및 변환
- **문서**: [Dumpling AI MCP](https://smithery.ai/servers/@Dumpling-AI/mcp-server-dumplingai)

---

## 🚀 설치 순서 (우선순위)

### Phase 1: 필수 서버 (즉시 설치)
```bash
# 1. 날씨 API (환경 분석용)
smithery mcp add @isdaniel/mcp_weather_server

# 2. Playwright (웹 스크래핑용)
smithery mcp add microsoft/playwright-mcp

# 3. Fetch (HTTP 요청용)
smithery mcp add fetch-mcp
```

### Phase 2: 데이터베이스 최적화 (백엔드 구현 시)
```bash
# Neon 또는 추가 PostgreSQL 서버 (필요 시)
smithery mcp add @neondatabase-labs/mcp-server-neon
# 또는
smithery mcp add @smithery-ai/postgres
```

### Phase 3: 고급 기능 (선택)
```bash
# 고급 데이터 처리
smithery mcp add @Dumpling-AI/mcp-server-dumplingai
```

---

## 📋 프로젝트별 사용 사례

### 환경 분석 (stats.env)
- **Weather MCP**: 경기장 날씨, 바람 방향, 습도 수집
- **사용 예시**: "서울 잠실구장의 오늘 날씨와 바람 방향은?"

### 데이터 분석 (stats.data)
- **Playwright MCP**: KBO 공식 사이트에서 선수 ERA, OPS, 타구 속도 데이터 수집
- **Supabase MCP**: 수집된 통계 데이터 저장 및 조회
- **사용 예시**: "최근 5경기 두산 베어스 투수 ERA 데이터 수집"

### 심리/동기 분석 (stats.psych)
- **Fetch MCP**: 야구 뉴스 사이트에서 팀 동향, 감독 인터뷰 수집
- **Playwright MCP**: 순위표, 경기 일정 스크래핑
- **사용 예시**: "현재 KBO 순위와 플레이오프 진출 상황은?"

### 선수 메트릭 (ACWR, HRV, WPA, PER)
- **Playwright MCP**: 고급 선수 통계 페이지 스크래핑
- **Supabase MCP**: 선수별 메트릭 저장 및 시계열 분석

---

## ⚙️ 설정 파일 위치

모든 MCP 서버는 다음 위치에 자동으로 추가됩니다:
- 전역: `C:\Users\tlduf\.claude.json`
- 프로젝트: `C:\Users\tlduf\.cursor\projects\dev3_nomu\.mcp.json` (생성 가능)

---

## 📚 참고 자료

- [Smithery.ai 공식 사이트](https://smithery.ai/)
- [Smithery GitHub - MCP Servers](https://github.com/smithery-ai/mcp-servers)
- [Playwright MCP Tutorial - ScrapingBee](https://www.scrapingbee.com/blog/playwright-mcp-web-scraping-smithery-tutorial-cursor/)
- [Web Scraping With MCP Servers Guide](https://brightdata.com/blog/ai/web-scraping-with-mcp)
- [Supabase MCP Documentation](https://supabase.com/docs/guides/getting-started/mcp)
- [MCP Gateways for PostgreSQL](https://www.mintmcp.com/blog/mcp-gateways-postgresql-integration)

---

## 💡 추가 팁

1. **MCP 서버 확인**: 설치 후 `/mcp` 명령으로 연결 상태 확인
2. **권한 설정**: `/permissions`에서 각 MCP 도구 권한 관리
3. **프로젝트별 설정**: `.mcp.json` 파일을 생성하여 팀원과 공유 가능
4. **성능 최적화**: 불필요한 서버는 `/mcp disable <server-name>`으로 비활성화

---

**생성일**: 2026-04-01
**프로젝트**: Baseball Insight Pro (KBO League Prediction Platform)
**Branch**: db (Database Implementation)
