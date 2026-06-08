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
- `supabase/migrations/20260609000000_create_wines.sql`에 최소 `wines` table과 owner-scoped RLS 정책을 작성했다.
- `src/services/wineService.ts`에서 와인 생성과 목록 조회를 담당한다.
- `src/App.tsx`에서 Supabase에서 읽은 와인 목록의 loading, empty, error 상태를 표시한다.
- 아직 인증 UX는 구현하지 않았다.

## Wines migration 적용

Supabase CLI가 프로젝트에 연결되기 전에는 Supabase Dashboard의 SQL Editor에서 다음 파일 내용을 실행한다.

```text
supabase/migrations/20260609000000_create_wines.sql
```

적용 후 `public.wines` table이 생성되고 RLS가 활성화된다.

## RLS와 인증 제약

`wines` table은 `owner_id = auth.uid()` 기준으로 select, insert, update, delete를 허용한다. 따라서 실제 wine row를 보거나 만들려면 Supabase Auth 세션이 필요하다.

현재 인증 UI는 아직 없으므로 `npm run dev`에서는 다음 중 하나가 보인다.

- migration 적용 전: table이 없다는 오류 메시지.
- migration 적용 후, 인증 세션 없음: 빈 wine list 상태.
- 인증 UI 또는 테스트 세션 준비 후: 현재 로그인 사용자의 wine list.

개발 편의를 위해 RLS를 끄거나 anon 전체 공개 정책을 추가하면 #4의 owner-scoped RLS 요구와 충돌한다. 임시 공개 정책이 필요하면 별도 이슈로 명시한다.
