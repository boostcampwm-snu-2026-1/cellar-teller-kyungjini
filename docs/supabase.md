# Supabase 설정 메모

## React 앱 환경 변수

Vite에서 브라우저 번들에 노출되는 환경 변수는 `VITE_` prefix가 필요하다. 로컬 `.env`에는 다음 값을 둔다.

```bash
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>
```

값은 Supabase Dashboard의 Project Settings > API에서 확인한다.

## 키 사용 기준

- React 앱에는 `anon public` key만 사용한다.
- `service_role` key는 브라우저에 노출되면 안 되므로 `.env`에 넣지 않는다.
- `.env`는 git에 커밋하지 않고, 필요한 변수명은 `.env.example`에만 기록한다.

## 현재 구현 상태

- `src/lib/supabase.ts`에서 Supabase client를 초기화한다.
- `VITE_SUPABASE_URL` 또는 `VITE_SUPABASE_ANON_KEY`가 없으면 앱 시작 시 개발자용 오류 메시지를 던진다.
- Supabase SQL Editor에 이미 생성된 `public.wines` inventory table을 기준 schema로 사용한다.
- `supabase/migrations/20260609000000_existing_wines_inventory.sql`에 현재 SQL Editor schema를 기록했다.
- `src/services/wineService.ts`에서 와인 생성과 목록 조회를 담당한다.
- `src/App.tsx`에서 와인 입력 form과 Supabase에서 읽은 와인 목록의 loading, empty, error 상태를 표시한다.
- The wine create form validates required name, vintage range, price, purchase date, and rating before making a Supabase request.
- 현재 Supabase 정책은 빠른 프로토타이핑을 위해 anon read/write를 허용한다.

## Wines migration 적용

현재 remote Supabase에는 SQL Editor로 만든 `public.wines` table이 이미 있다. 같은 schema를 다시 만들거나 다른 환경에 적용해야 할 때는 다음 파일을 기준으로 한다.

```text
supabase/migrations/20260609000000_existing_wines_inventory.sql
```

현재 앱은 다음 컬럼을 직접 사용한다.

- `name`
- `producer`
- `vintage`
- `type`
- `grape_variety`
- `region`
- `purchase_date`
- `purchase_price`
- `tasting_notes`
- `rating`

## RLS와 인증 제약

현재 SQL Editor에서 만든 정책은 다음과 같다.

```sql
CREATE POLICY "Allow public read and write access" ON public.wines
    FOR ALL USING (true) WITH CHECK (true);
```

이 정책은 인증 없이 `npm run dev`에서 와인 추가와 목록 조회를 빠르게 확인하기 위한 개발용 설정이다. 사용자별 데이터 격리가 필요해지는 시점에는 `owner_id` 또는 별도 profile/user mapping을 추가하고 owner-scoped RLS로 전환해야 한다.
