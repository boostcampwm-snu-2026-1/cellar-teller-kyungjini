# cellar-teller

cellar-teller is a mobile-first React and Supabase web app for managing a personal wine inventory.
The current MVP slice supports manual wine entry, a Supabase-backed inventory list, a selected
wine detail view, and a read-only cellar grid.

## Local Environment

Copy `.env.example` to `.env` and fill in the Supabase project values:

```bash
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>
```

Use the Supabase `anon public` key for the React app. Do not put a `service_role` key in `.env`.

See `docs/supabase.md` for the reusable Supabase setup notes.

## Current MVP Slice

The manual wine create form validates values before it sends a Supabase request:

- wine name is required
- vintage must be a whole number from 1800 through 2200
- price must be a valid non-negative number
- purchase date must be a valid `YYYY-MM-DD` date
- rating, when provided, must be a whole number from 1 through 5

The inventory list can open a selected wine detail view with persisted field values from the
loaded Supabase data. If the selected wine is no longer in the loaded list, the app shows a
recoverable not-found state with a way back to the inventory list.

The cellar tab renders a read-only 5 by 6 Zone A grid from each wine row's `is_cellar`,
`cellar_zone`, `row_num`, and `col_num` fields. Bottles without a cellar position appear in the
outside storage list.

## Seed Data

Seed the current cellar inventory sample into the configured Supabase project:

```bash
npm run seed:wines
```

The seed uses fixed UUIDs from `supabase/seed-wines.json` and upserts by `id`, so re-running the
command updates the same 27 rows instead of inserting duplicates.

## Testing

Run the component test suite with Vitest and React Testing Library:

```bash
npm test
```

Use watch mode while developing tests:

```bash
npm run test:watch
```

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
