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
- 아직 schema, RLS, 인증 UX는 구현하지 않았다.
