# cellar-teller

cellar-teller는 개인 와인 컬렉션을 등록하고, 실제 셀러 위치를 시각적으로 관리하며, 보유 와인 중 지금 마시기 좋은 병을 추천받을 수 있는 React 기반 웹 애플리케이션입니다. 수업 프로젝트 결과물로서 프론트엔드 상태 관리, Supabase 연동, 데이터 기반 UI, 외부 AI API 활용 흐름을 하나의 서비스 형태로 구현하는 것을 목표로 했습니다.

## 프로젝트 개요

와인을 보관하다 보면 어떤 병을 어디에 두었는지, 어떤 병을 먼저 마셔야 하는지, 구매 정보와 시음 메모가 어디에 남아 있는지 관리하기 어렵습니다. cellar-teller는 이 문제를 작은 개인 셀러 관리 서비스로 풀어냅니다.

현재 구현된 핵심 흐름은 다음과 같습니다.

- 와인 정보를 직접 입력하고 Supabase에 저장합니다.
- 저장된 와인 목록을 불러와 인벤토리 카드로 보여줍니다.
- 개별 와인의 상세 정보, 보관 위치, 메모, 가격, 평점을 확인합니다.
- 셀러 선반 구조를 시각화하고 병의 위치를 드래그 앤 드롭으로 이동합니다.
- 보유 와인 목록을 바탕으로 Gemini API에 자연어 추천을 요청합니다.
- 샘플 와인 데이터를 seed로 넣어 데모 환경을 빠르게 구성할 수 있습니다.

## 주요 기능

### 1. 와인 인벤토리

- 이름, 생산자, 빈티지, 타입, 품종, 지역, 구매일, 가격, 평점, 메모를 입력할 수 있습니다.
- 폼 제출 전 필수값과 숫자 범위를 검증합니다.
- Supabase `wines` 테이블에서 목록을 조회하고, 로딩/빈 상태/오류 상태를 구분해 표시합니다.
- 와인 카드에서 상세 화면으로 이동해 저장된 필드를 한 번에 확인할 수 있습니다.

### 2. 셀러 시각화

- 실제 보관 선반을 `T5`, `T4`, `T3`, `T2`, `T1`, `B1`, `B2` 구조로 표현합니다.
- 셀러에 배치된 와인은 병뚜껑 형태의 overview로, 선반을 열면 세로 병 형태로 보여줍니다.
- 와인 타입에 따라 red, white, rose, sparkling 등의 시각적 구분을 적용했습니다.
- 위치가 없는 와인은 `Unmapped bottles` 영역에 모아 보여줍니다.

### 3. 드래그 앤 드롭 위치 관리

- 셀러 안의 병을 다른 슬롯으로 이동할 수 있습니다.
- 외부 보관 영역으로 드롭해 셀러 밖 보관 상태로 변경할 수 있습니다.
- 이미 병이 있는 위치에 드롭하면 두 병의 위치를 교환합니다.
- UI에서는 먼저 이동 결과를 반영하고, Supabase 저장에 실패하면 이전 상태로 되돌립니다.

### 4. 와인 추천

- 추천 탭에서 자연어로 요청을 입력할 수 있습니다.
- 예시 프롬프트를 눌러 빠르게 추천 요청을 구성할 수 있습니다.
- 현재 인벤토리 중 소비되지 않은 와인만 추천 후보로 사용합니다.
- Gemini 응답은 추천 와인, 추천 이유, 마시기 우선순위를 포함한 JSON 형태로 파싱합니다.

### 5. 샘플 데이터

- `supabase/seed-wines.json`에 데모용 와인 인벤토리를 준비했습니다.
- `npm run seed:wines` 명령으로 Supabase에 샘플 데이터를 upsert합니다.
- 고정 UUID를 사용하므로 seed를 여러 번 실행해도 같은 레코드를 갱신합니다.

## 기술 스택

- Frontend: React, TypeScript, Vite
- Styling: 컴포넌트별 CSS 파일과 전역 CSS
- Backend: Supabase Postgres, Supabase JavaScript Client
- AI: Google Gemini REST API
- Test: Vitest, React Testing Library
- Tooling: ESLint, TypeScript compiler

## 프로젝트 구조

```text
src/
  components/              화면 단위 UI 컴포넌트
  config/                  셀러 선반 배치 설정
  lib/                     Supabase client 초기화
  services/                Supabase, Gemini API 연동 로직
  types/                   Wine, Cellar, Recommendation 타입 정의
  utils/                   폼 검증, 셀러 이동, 표시 포맷 유틸리티
supabase/
  migrations/              wines 테이블 schema 변경 내역
  seed-wines.json          데모용 와인 seed 데이터
scripts/
  seed-wine-inventory.mjs  Supabase seed 실행 스크립트
docs/
  system-architecture.md   시스템 설계 문서
  supabase.md              Supabase 설정 메모
```

## 실행 방법

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example`을 복사해 `.env` 파일을 만들고 값을 채웁니다.

```bash
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>
VITE_GEMINI_API_KEY=<gemini-api-key>
```

Supabase 키는 React 앱에서 사용할 수 있는 `anon public` key를 사용합니다. `service_role` key는 브라우저에 노출되면 안 되므로 `.env`에 넣지 않습니다.

`VITE_GEMINI_API_KEY`는 추천 기능을 사용할 때 필요합니다. 현재 구현은 수업 프로젝트 데모를 위해 브라우저에서 Gemini API를 직접 호출합니다. 실제 서비스로 확장할 경우 API key 보호를 위해 Supabase Edge Function 같은 서버 측 경유 구조로 옮기는 것이 적합합니다.

### 3. Supabase 테이블 준비

`supabase/migrations`의 SQL을 Supabase SQL Editor 또는 Supabase CLI로 적용합니다.

```text
supabase/migrations/20260609000000_existing_wines_inventory.sql
supabase/migrations/20260614000000_add_wine_depth_num.sql
```

현재 `wines` 테이블은 와인 기본 정보와 셀러 위치 정보를 함께 저장합니다. 주요 위치 필드는 다음과 같습니다.

- `is_cellar`: 셀러 내부 보관 여부
- `cellar_zone`: 셀러 구역
- `row_num`: 선반 행 번호
- `col_num`: 슬롯 번호
- `depth_num`: 앞/중간/뒤 깊이 번호

### 4. 샘플 데이터 주입

```bash
npm run seed:wines
```

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 Vite가 안내하는 로컬 주소로 접속합니다.

## 검증 명령

```bash
npm run lint
npm test
npm run build
```

- `npm run lint`: ESLint 규칙을 검사합니다.
- `npm test`: Vitest와 React Testing Library 기반 테스트를 실행합니다.
- `npm run build`: TypeScript 빌드와 Vite production build를 실행합니다.

## 구현 포인트

- Supabase row 데이터를 프론트엔드 `Wine` 타입으로 변환하는 service layer를 분리했습니다.
- `depth_num` 컬럼이 없는 기존 Supabase 환경도 읽을 수 있도록 fallback 조회 로직을 넣었습니다.
- 셀러 이동 로직은 `applyCellarMove` 유틸리티로 분리해 UI와 데이터 계산을 분리했습니다.
- 추천 prompt 생성과 Gemini 응답 파싱을 별도 유틸리티와 service로 분리했습니다.
- 와인명, 가격, 타입별 색상 계산을 표시 유틸리티로 분리해 카드, 상세, 추천 화면에서 재사용합니다.

## 현재 한계와 개선 방향

- 인증과 사용자별 데이터 분리는 아직 적용하지 않았습니다.
- 현재 Supabase 정책은 데모 편의를 위해 anon read/write를 허용하는 개발용 설정입니다.
- Gemini API key는 클라이언트 환경 변수로 사용되므로, 실제 배포 시 서버 측 API로 옮겨야 합니다.
- 시음 기록 타임라인, 와인 수정/삭제, 사진 업로드 기능은 후속 구현 범위입니다.
- 드래그 앤 드롭은 데스크톱 중심으로 구현되어 있어 모바일 터치 조작 개선이 필요합니다.

## 참고 문서

- [시스템 아키텍처](docs/system-architecture.md)
- [Supabase 설정 메모](docs/supabase.md)
