# cellar-teller 구현 계획

## 목적

이 문서는 GitHub Issues를 만들기 전 검토하기 위한 중간 산출물이다. React + Supabase 기반 MVP를 작은 단위의 기술 작업으로 나누고, 구현 순서와 상태 관리 경계를 명확히 한다.

이 문서가 승인되기 전에는 GitHub Issues를 생성하지 않는다.

## MVP 전략

1차 MVP의 최우선 목표는 Supabase와 연결된 가장 작은 end-to-end 흐름을 먼저 검증하는 것이다. 사용자가 수동으로 와인 정보를 입력하면 Supabase 데이터베이스에 저장되고, 데이터베이스에 저장된 와인 정보를 다시 화면에서 조회할 수 있어야 한다.

프론트엔드 디자인, 고급 화면 구성, Drag & Drop, 시음 기록, 추천 기능은 이 DB vertical slice가 동작한 뒤 순차적으로 구현한다. 사진 촬영, 사진 업로드, AI 기반 와인 정보 draft 기능은 후순위로 미룬다.

각 작업은 가능한 한 100-150라인 이하의 production code 변경으로 리뷰 가능해야 한다. 큰 기능은 schema, service, provider, UI shell, interaction, 검증 작업으로 분리한다.

LLM API를 사용하는 기능은 마실 와인 추천으로 제한한다. 추천 기능은 실제 LLM API와 mock API를 모두 구현해, 개발과 테스트에서는 deterministic한 mock 응답을 사용하고 통합 환경에서는 실제 provider로 교체할 수 있게 한다.

## 이슈와 마일스톤 운영 방식

GitHub Issue는 아래의 Atomic Task 하나를 기준으로 만든다. 마일스톤 하나를 이슈 하나로 올리지 않는다.

마일스톤은 여러 개의 작은 이슈를 묶는 계획 단위다. GitHub Milestone 기능을 사용할 수 있으면 GitHub Milestone으로 묶고, 그렇지 않으면 `milestone:<slug>` 라벨을 각 이슈와 관련 PR에 붙인다.

모든 이슈 본문에는 작업 기준 브랜치를 명시한다. 기본값은 `Base Branch: dev`이고, 작업 브랜치는 `Working Branch: dev/<type>-<short-slug>` 형식으로 둔다. PR은 working branch에서 base branch인 `dev`로 올린다.

에이전트가 이슈를 배정받아 작업을 시작할 때의 기본 흐름은 다음과 같다.

1. `git checkout dev`
2. `git pull --ff-only`
3. `git checkout -b dev/<type>-<short-slug>`
4. 작업 완료 후 `gh pr create --base dev --head dev/<type>-<short-slug>`

작업 브랜치 예시는 다음과 같다.

- `dev/feat-app-route-shell`
- `dev/feat-wine-create-form`
- `dev/fix-cellar-drop-rollback`
- `dev/chore-supabase-env`
- `dev/refactor-storage-service`

Issue와 PR 라벨은 같은 의미 체계를 사용한다.

- `milestone:<slug>`: 계획 묶음. 예: `milestone:app-shell`, `milestone:cellar-dnd`.
- `feature`: 새 사용자 기능.
- `bug`: 결함 수정. 버그 이슈와 해당 수정 PR에 모두 붙인다.
- `chore`: 설정, 도구, 환경 변수, 빌드, 유지보수.
- `refactor`: 동작 변경 없는 구조 개선.
- `test`: 테스트만 추가하거나 테스트 인프라를 다루는 작업.
- `docs`: 문서만 변경하는 작업.
- `frontend`: React UI 또는 client state 변경.
- `backend`: Supabase Edge Function 또는 server-side logic.
- `database`: schema, migration, RLS, seed.
- `mobile`: 모바일 레이아웃과 터치 UX 검증이 중요한 작업.
- `ai`: 추천 LLM 또는 mock recommendation provider 관련 작업.

## 세분화된 목표 마일스톤

### M0: 계획과 프로젝트 운영 기준

- 구현 계획과 시스템 아키텍처를 최신 MVP 범위로 유지한다.
- 이슈, PR, 브랜치, 라벨 규칙을 스킬과 문서에 반영한다.

### M1: Supabase 연결과 와인 DB Vertical Slice

- Supabase client와 환경 변수를 설정한다.
- 최소 `wines` schema와 RLS를 만든다.
- 수동 와인 입력이 DB에 저장되는지 확인한다.
- DB에 저장된 와인 목록을 화면에서 조회하는지 확인한다.

### M2: 최소 React 화면과 데이터 경계

- 와인 입력 폼과 와인 목록 화면을 최소 UI로 만든다.
- `wineService`를 통해 create/list 흐름을 분리한다.
- 복잡한 디자인과 라우팅은 뒤로 미룬다.

### M3: App Shell과 라우팅 정리

- 모바일 우선 layout, route placeholder, bottom navigation을 만든다.
- 이후 셀러, 시음 기록, 추천 화면이 같은 shell 아래 붙을 수 있게 한다.

### M4: 인벤토리 관리 확장

- 와인 상세, 수정, 삭제 흐름을 추가한다.
- validation, loading, empty, error 상태를 보강한다.

### M5: 보관 위치 데이터 기반

- `storage_locations`, `cellar_slots`, `wine_positions` schema와 RLS를 만든다.
- storage service와 provider를 추가한다.

### M6: 셀러 맵 정적 UI

- 셀러 grid와 외부 보관 가로 목록을 읽기 가능한 UI로 만든다.
- Drag & Drop 없이 위치 상태 렌더링부터 완성한다.

### M7: 셀러 Drag & Drop

- drag state, drop target, move, swap, persistence, rollback을 분리해서 구현한다.
- 위치 변경은 storage service를 통해서만 저장한다.

### M8: 시음 기록 데이터 기반

- `tasting_entries` schema, RLS, service를 만든다.
- timeline UI와 분리해 데이터 경계를 먼저 만든다.

### M9: 시음 기록 UI와 기본 통계

- 시음 timeline, entry form, 기본 통계를 구현한다.
- AI 요약은 포함하지 않는다.

### M10: 추천 기능 계약과 Mock API

- 추천 조건과 결과 타입, recommendation service, mock provider를 구현한다.
- LLM API key 없이 end-to-end UI 검증이 가능해야 한다.

### M11: 실제 LLM 추천 연동

- Supabase Edge Function에서 실제 LLM API를 호출한다.
- mock provider와 동일한 응답 shape로 정규화한다.

### M12: 반응형 검증과 문서 동기화

- 모바일, 태블릿, 데스크톱에서 핵심 흐름을 확인한다.
- README와 architecture 문서를 실제 구현 상태에 맞춘다.

### B1: 후순위 사진 및 AI Draft

- 사진 촬영, 업로드, AI 와인 정보 draft는 MVP 이후 별도 계획으로 다룬다.

## React 컴포넌트 트리

### App Shell

```text
App
  AppProviders
    AuthProvider
    InventoryProvider
    StorageProvider
    Router
      AppLayout
        BottomNavigation
        PageOutlet
```

### 주요 Route

```text
PageOutlet
  InventoryPage
  CellarMapPage
  WineFormPage
  WineDetailPage
  TastingHistoryPage
  RecommendationPage
```

### 셀러 Grid와 외부 보관 목록

```text
CellarMapPage
  CellarMapHeader
    StorageSummary
    ViewModeControl
  CellarTransferProvider
    CellarMapWorkspace
      CellarGridPanel
        CellarSection
          CellarRow
            CellarSlot
              SlotBottleCard
              EmptySlotDropTarget
      OutsideStoragePanel
        OutsideStorageList
          OutsideBottleCard
          OutsideDropTarget
    DragOverlayBottle
    CellarMapStatusBar
```

### 수동 와인 입력

```text
WineFormPage
  WineFormHeader
  WineForm
    WineIdentityFields
    WinePurchaseFields
    WineNoteField
    WineFormActions
```

### 추천 기능

```text
RecommendationPage
  RecommendationCriteriaForm
    OccasionField
    PairingField
    PriceRangeField
    PreferenceField
    ConstraintField
  RecommendationResultPanel
    RecommendedWineCard
    RecommendationReasonList
    RecommendationWarningList
```

### 시음 기록

```text
TastingHistoryPage
  TastingStatsSummary
  TastingTimeline
    TastingTimelineItem
  TastingEntryForm
```

## 상태 관리 경계

### Server State

Supabase에서 읽고 쓰는 데이터는 server state로 본다. 화면 component가 Supabase query를 직접 작성하지 않고 service module을 통해 접근한다.

권장 service module은 다음과 같다.

- `src/services/supabaseClient.ts`
- `src/services/wineService.ts`
- `src/services/storageService.ts`
- `src/services/tastingService.ts`
- `src/services/recommendationService.ts`

Server state에는 다음이 포함된다.

- 와인 레코드.
- 셀러 슬롯.
- 보관 위치.
- 와인 위치.
- 시음 기록.
- 추천 요청과 추천 결과 로그.

### React Context State

React Context는 여러 route와 workflow에서 공유되는 상태에만 사용한다.

권장 context는 다음과 같다.

- `AuthProvider`: 현재 Supabase user session.
- `InventoryProvider`: 와인 목록, refresh 함수, loading, error.
- `StorageProvider`: 셀러 슬롯, 외부 보관 목록, 위치 변경 함수, loading, error.

Context에는 폼 입력값, drag hover, modal open 상태 같은 짧은 생명주기의 UI 상태를 넣지 않는다.

### Local Component State

Local state는 해당 interaction을 소유한 component 가까이에 둔다.

Local state에는 다음이 포함된다.

- 저장 전 폼 입력값.
- 선택한 필터와 정렬 옵션.
- 추천 조건 입력값.
- 현재 추천 요청의 pending, success, error 상태.
- local modal open 또는 selected item 상태.

### Drag & Drop State

Drag & Drop 상태는 `CellarMapPage` 내부의 `CellarTransferProvider`로 제한한다.

`CellarTransferProvider`가 소유하는 상태는 다음과 같다.

- 현재 drag 중인 wine id.
- source type: `cellar-slot` 또는 `outside-list`.
- source slot id 또는 outside item id.
- 현재 drop target id.
- 낙관적 이동 preview.
- commit, rollback, clear-drag 함수.

Drop 시 처리 순서는 다음과 같다.

1. source와 target을 검증한다.
2. operation type을 계산한다: slot 이동, 외부 이동, slot swap.
3. 즉시 UI에 낙관적 이동 preview를 적용한다.
4. `storageService.moveWinePosition` 또는 `storageService.swapWinePositions`를 호출한다.
5. 성공하면 StorageProvider 상태를 갱신한다.
6. 실패하면 낙관적 상태를 rollback하고 error를 표시한다.

데이터베이스는 성공한 mutation 이후의 최종 source of truth로 유지한다.

### 추천 상태

추천 UI의 입력값과 요청 상태는 `RecommendationPage` local state로 둔다. 추천 service는 Edge Function 호출만 담당한다.

추천 provider 선택은 클라이언트 UI의 핵심 상태가 아니다. 기본적으로 환경 변수 또는 Edge Function 설정으로 `mock` 또는 `llm` provider를 선택한다. 개발 환경은 mock provider를 기본값으로 둔다.

추천 응답 공통 shape는 다음을 목표로 한다.

```ts
type RecommendationResult = {
  wineId: string
  title: string
  reason: string
  matchedCriteria: string[]
  warnings: string[]
  provider: 'mock' | 'llm'
}
```

## Atomic Task 초안과 실행 순서

아래 각 항목은 기본적으로 GitHub Issue 하나에 대응한다. 구현 중 버그가 발견되면 별도 `fix:` 이슈로 만들고 `bug` 라벨을 붙인다. 해당 수정 PR도 동일하게 `bug` 라벨을 붙인다.

| Task | Milestone Label | Primary Labels |
| --- | --- | --- |
| 1-8 | `milestone:supabase-wine-vertical` | `feature`, `frontend`, `database`, `backend` |
| 9-11 | `milestone:inventory-foundation` | `feature`, `frontend`, `mobile` |
| 12-14 | `milestone:app-shell` | `feature`, `frontend`, `mobile` |
| 15-17 | `milestone:storage-schema` | `feature`, `database`, `backend` |
| 18-19 | `milestone:cellar-static-ui` | `feature`, `frontend`, `mobile` |
| 20-23 | `milestone:cellar-dnd` | `feature`, `frontend`, `mobile` |
| 24-25 | `milestone:tasting-data` | `feature`, `database`, `backend` |
| 26-28 | `milestone:tasting-ui` | `feature`, `frontend`, `mobile` |
| 29-32 | `milestone:recommendation-mock` | `feature`, `ai`, `frontend`, `backend` |
| 33-34 | `milestone:recommendation-llm` | `feature`, `ai`, `backend`, `frontend` |
| 35 | `milestone:verification-docs` | `test`, `frontend`, `mobile` |
| 36 | `milestone:verification-docs` | `docs`, `chore` |

### 1. Supabase 환경 변수와 Client 설정

- Supabase URL과 anon key를 읽는 client module을 만든다.
- `.env.example` 또는 README에 필요한 환경 변수를 기록한다.
- 완료 기준: secret을 코드에 박지 않고 React 앱에서 Supabase client를 초기화한다.

### 2. 최소 Wine Domain Type 정의

- 수동 입력 MVP에 필요한 `Wine`, `CreateWineInput`, `UpdateWineInput` 타입을 만든다.
- 필드는 이름, 생산자, 빈티지, 품종, 가격, 날짜, 노트로 제한한다.
- 완료 기준: service와 form이 같은 타입을 공유한다.

### 3. 최소 Wines Schema 작성

- `wines` table migration을 작성한다.
- 수동 입력 필드, owner, created_at, updated_at을 포함한다.
- 완료 기준: Supabase에 적용 가능한 SQL을 리뷰할 수 있다.

### 4. Wines RLS 정책 작성

- `wines` table에 RLS를 활성화한다.
- owner 기준 select, insert, update, delete policy를 추가한다.
- 완료 기준: 사용자별 와인 데이터 접근 범위가 정책으로 제한된다.

### 5. Wine Service Create/List 작성

- `wineService.createWine`과 `wineService.listWines`를 만든다.
- Supabase error를 UI에서 표시 가능한 message로 정규화한다.
- 완료 기준: component가 Supabase query를 직접 작성하지 않는다.

### 6. 최소 Wine Create Form 구현

- 이름, 생산자, 빈티지, 품종, 가격, 날짜, 노트 입력 필드를 만든다.
- 제출 시 `wineService.createWine`을 호출한다.
- 완료 기준: 유효한 입력이 Supabase `wines` table에 저장된다.

### 7. 최소 Wine List 구현

- `wineService.listWines`로 DB 데이터를 조회해 목록에 표시한다.
- loading, empty, error 상태만 최소로 처리한다.
- 완료 기준: Supabase에 저장된 와인 정보가 화면에 표시된다.

### 8. Supabase Wine Vertical Slice 검증

- 로컬 앱에서 와인 입력 후 DB 저장과 화면 조회를 수동 검증한다.
- 필요한 경우 간단한 integration smoke test 또는 manual verification note를 추가한다.
- 완료 기준: 새로 입력한 와인이 새로고침 후에도 DB에서 다시 조회된다.

### 9. Wine Create Form Validation 보강

- 필수값, 숫자 가격, 빈티지 범위, 날짜 형식을 검증한다.
- 저장 실패와 성공 상태를 사용자에게 표시한다.
- 완료 기준: 잘못된 입력은 Supabase 요청 전에 차단된다.

### 10. Wine Detail 구현

- 단일 와인 기본 정보를 보여준다.
- 목록에서 상세로 이동할 수 있게 한다.
- 완료 기준: DB에서 조회한 와인 상세가 렌더링된다.

### 11. Wine Edit/Delete 구현

- 기존 와인을 수정하고 삭제하는 service와 UI를 추가한다.
- 완료 기준: 수정과 삭제 결과가 Supabase와 화면 목록에 반영된다.

### 12. App Route Shell 정리

- 인벤토리, 셀러 맵, 와인 폼, 시음 기록, 추천 route를 정리한다.
- 완료 기준: 주요 route가 공통 layout 안에서 렌더링된다.

### 13. Bottom Navigation 구현

- 모바일 우선 bottom navigation을 추가한다.
- 완료 기준: 주요 화면 사이를 터치로 이동할 수 있다.

### 14. InventoryProvider 추가

- 와인 목록, refresh, loading, error 상태를 context로 제공한다.
- 완료 기준: 인벤토리 화면이 provider에서 와인 데이터를 읽는다.

### 15. Storage Schema 작성

- `storage_locations`, `cellar_slots`, `wine_positions` schema를 작성한다.
- owner, timestamp, 기본 제약 조건을 포함한다.
- 완료 기준: 와인 위치를 DB에서 표현할 수 있다.

### 16. Storage RLS 작성

- 보관 위치 관련 table에 RLS를 활성화한다.
- owner 기준 접근 정책을 추가한다.
- 완료 기준: 사용자별 위치 데이터 접근 범위가 정책으로 제한된다.

### 17. Storage Service와 Provider 작성

- 셀러 슬롯과 와인 위치 조회 함수를 만든다.
- 위치 관련 loading, error, refresh 상태를 provider로 제공한다.
- 완료 기준: 셀러 맵 화면이 DB 위치 데이터를 읽을 수 있다.

### 18. Cellar Grid 정적 Layout 구현

- section, row, slot 계층을 렌더링한다.
- 점유 슬롯과 빈 슬롯 상태를 구분한다.
- 완료 기준: 모바일과 데스크톱에서 grid가 읽기 가능하다.

### 19. Outside Storage List 구현

- 셀러 슬롯에 없는 와인을 가로 스크롤 목록으로 보여준다.
- empty와 overflow 상태를 처리한다.
- 완료 기준: 모바일에서 터치 스크롤이 가능하다.

### 20. CellarTransferProvider 구현

- active item, source, target, preview, commit, rollback 상태를 만든다.
- 완료 기준: drag gesture 상태가 server state를 직접 바꾸지 않는다.

### 21. Cellar Drop Target 구현

- 빈 슬롯 drop과 점유 슬롯 drop을 구분한다.
- move 또는 swap payload를 계산한다.
- 완료 기준: drop 시 올바른 operation payload가 생성된다.

### 22. Outside Drop Target 구현

- 셀러 슬롯의 와인을 외부 보관 목록으로 이동하는 target을 만든다.
- 완료 기준: cellar-to-outside 이동 payload가 생성된다.

### 23. Drag & Drop Persistence 연결

- transfer commit을 storage service move와 swap 함수에 연결한다.
- 낙관적 update, rollback, error 표시를 추가한다.
- 완료 기준: 성공한 drop은 refresh 후 유지되고 실패한 drop은 복구된다.

### 24. Tasting Schema 작성

- `tasting_entries` table과 RLS policy를 추가한다.
- wine과 owner 관계를 포함한다.
- 완료 기준: 시음 기록이 사용자와 와인에 안전하게 연결된다.

### 25. Tasting Service 작성

- list, create, update, delete 함수를 만든다.
- 날짜순 정렬을 service 경계에서 보장한다.
- 완료 기준: timeline이 정렬된 데이터를 받는다.

### 26. Tasting Timeline 구현

- 시음 기록을 시간순으로 렌더링한다.
- empty, loading, error 상태를 처리한다.
- 완료 기준: 모바일에서 가로 overflow 없이 보인다.

### 27. Tasting Entry Form 구현

- 시음 날짜, 노트, 선택적 평점 field를 만든다.
- 선택한 와인과 연결해 저장한다.
- 완료 기준: 저장한 기록이 timeline에 표시된다.

### 28. Basic Tasting Statistics 구현

- 품종, 생산자, 빈티지, 시음 빈도 기준 기본 통계를 계산한다.
- 완료 기준: AI 호출 없이 local loaded data로 통계를 보여준다.

### 29. Recommendation Type 작성

- 추천 조건과 추천 결과 타입을 정의한다.
- 완료 기준: mock과 LLM provider가 같은 응답 타입을 사용한다.

### 30. Recommendation Service 작성

- `recommendationService.requestRecommendation`을 만든다.
- 완료 기준: UI는 Edge Function 호출 세부사항을 알 필요가 없다.

### 31. Recommendation Criteria UI 구현

- 상황, 음식 페어링, 가격대, 품종 선호, 제약 조건 입력 UI를 만든다.
- 완료 기준: 추천 조건을 submit할 수 있고 inventory를 변경하지 않는다.

### 32. Mock Recommendation Provider 구현

- Edge Function 또는 local service boundary에 deterministic mock provider를 만든다.
- 현재 인벤토리와 조건을 받아 고정 규칙으로 추천 결과를 반환한다.
- 완료 기준: LLM API key 없이 추천 UI를 end-to-end로 검증할 수 있다.

### 33. Recommendation Edge Function Shell 작성

- `recommend-wine` Edge Function shell을 만든다.
- provider 선택값에 따라 mock 또는 llm provider로 라우팅한다.
- 완료 기준: 공통 응답 shape를 반환하고 provider 값이 결과에 포함된다.

### 34. LLM Recommendation Provider 구현

- 서버 측에서 실제 LLM API를 호출한다.
- 인벤토리 context를 compact한 structured payload로 전달한다.
- 응답을 검증해 공통 shape로 정규화한다.
- 완료 기준: API key는 client에 노출되지 않고 추천 결과가 기존 wine id에 연결된다.

### 35. Recommendation Result UI와 Responsive Verification

- 추천 와인, 추천 이유, 매칭 조건, 주의사항을 표시한다.
- mock과 llm provider 결과를 같은 UI로 렌더링한다.
- 모바일, 태블릿, 데스크톱 폭에서 핵심 흐름을 확인한다.
- 완료 기준: 추천 결과 panel과 주요 화면이 좁은 모바일에서 사용 가능하다.

### 36. Documentation Sync

- README와 architecture 문서를 실제 구현 상태에 맞게 갱신한다.
- 완료 기준: 로컬 실행, Supabase 설정, 추천 provider 설정, MVP 범위가 문서화된다.

## 후순위 백로그 작업

### B1. Photo Storage Foundation

- Supabase Storage bucket과 photo metadata table을 추가한다.
- 완료 기준: 와인 또는 draft session에 사진 metadata를 연결할 수 있다.

### B2. Photo Capture And Upload UI

- 모바일 사진 촬영과 여러 장 업로드 UI를 만든다.
- 완료 기준: consecutive photo upload 흐름이 가능하다.

### B3. AI Draft Session Schema

- 텍스트 trigger, 사진 목록, draft status, generated field payload를 저장한다.
- 완료 기준: draft data가 저장된 wine record와 분리된다.

### B4. AI Draft Review UI

- 생성된 draft 값을 수동 와인 입력 폼에 복사할 수 있게 한다.
- 완료 기준: 사용자가 명시적으로 저장하기 전에는 wine record가 생성되지 않는다.

## 이슈 생성 전 확인사항

- 첫 MVP에서 인증을 반드시 포함할지, 개발 중 단일 사용자 모드를 허용할지 결정한다.
- 초기 셀러 구조의 section, row, column, label 규칙을 확정한다.
- 외부 보관 목록의 수동 정렬을 MVP에 포함할지 결정한다.
- 추천 mock provider의 기본 규칙을 확정한다.
- 실제 LLM provider에 사용할 모델과 환경 변수 이름을 확정한다.
