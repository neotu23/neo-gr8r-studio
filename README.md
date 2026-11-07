# Gr8r Studio

A calm, structured project management workspace: home dashboard, inbox, my tasks, projects with
board / list / table / calendar / timeline / files views, members, teams, activity and settings.

Built with plain JavaScript ES modules and CSS, bundled by [Vite](https://vite.dev). There is no
UI framework and no runtime dependency.

![Gr8r Studio home dashboard](docs/preview.png)

## Getting started

Requires Node.js 18 or newer (`.nvmrc` pins 22).

```bash
npm install
npm run dev       # http://localhost:5173 with hot reload
npm run build     # production build in dist/
npm run preview   # serve the production build locally
npm run lint      # ESLint
npm run format    # Prettier
```

## Project structure

```
index.html              HTML entry; loads src/main.js
public/favicon.svg      brand mark
vite.config.js          Vite config, including the Lucide icon-subset plugin
eslint.config.js        lint rules (ESLint flat config); formatting by Prettier (.prettierrc.json)
.github/workflows/      CI: lint, format check, build
docs/preview.png        README screenshot
src/
  main.js               entry: imports styles and modules, then boots the app
  styles/
    index.css           imports every stylesheet in cascade order
    tokens.css          colours, spacing, type, radius, the shared --gutter
    base.css  components.css  shell.css  panels.css  overlays.css  states.css  motion.css  responsive.css
    views/              list, board, table, calendar, timeline, projects & files
    pages/              settings, auth & onboarding
  core/                 utilities, constants, icons, store (state + lookups), theme
  data/seed.js          demo workspace data
  ui/                   shared render helpers, toasts, the select dropdown
  shell/                render loop and router, sidebar/topbar layout, skeletons, view engine
  components/           task list renderer
  pages/                one module per route
  views/                project views: board, table, calendar, timeline, files, overview
  overlays/             task drawer, modals, popovers, context menu, command palette
  features/             teams, subtasks, archive (rendering)
  actions/              user actions, event wiring, keyboard shortcuts, drag and drop
```

### Layers

Dependencies point downward:

1. `core/` and `data/` depend on nothing else in the app.
2. `ui/`, `shell/`, `components/`, `pages/`, `views/`, `overlays/` and `features/` render HTML from state.
3. `actions/` change state and re-render. Each action module registers its handlers on the
   shared action table (`A`) when it loads, so `main.js` imports them after `actions/actions.js`.

## Conventions

- **Rendering:** each page or view is a function that returns an HTML string from the store
  (`S`). `render()` rebuilds the shell and keeps focus and scroll positions.
- **Interactions:** elements declare `data-a="actionName"`. `actions/events.js` delegates the
  click to `A.actionName`. Inputs use `data-in`, blur handlers use `data-blur`.
- **Layout:** every page edge uses `var(--gutter)`, so the breadcrumb, page header, toolbar,
  list, table and board start on the same line.
- **Dropdowns:** write a normal `<select class="select">`. `ui/select.js` renders it as the
  design-system menu and keeps the native element as the source of truth.
- **Icons:** call `ic('name')` with any [Lucide](https://lucide.dev) icon name. The
  `virtual:icons` plugin bundles only the icons the source uses.
- **Copy:** never hard-code user-facing text. Wrap it in `t('English source string')` from
  `core/i18n.js` and add the translation to that module's dictionary. Interpolate with named
  parameters — `t('{n} days until {date}', { n, date })` — and use `tn(n, one, other)` when the
  English needs singular/plural forms. Strings the dictionary does not know fall back to English.
  Note that `t` is also a common local name for a task object; import it as `t as tr` in those
  modules.

## Internationalization

The UI ships in English (US) and Simplified Chinese (简体中文).

- **Switching:** Settings → Language, or pick the language from the launch screen. The choice is
  stored in `prefs.lang`, `<html lang>` follows it, and `document.documentElement.lang` drives the
  CJK font stack and line height in `styles/base.css`.
- **First visit:** `detectLang()` reads `navigator.languages`, so Chinese browsers open in Chinese.
- **Coverage:** shell, every page, view, overlay, toast and validation message. Dates, relative
  times (`ago`, `relDate`, `dayBucket`) and month/weekday labels come from `core/i18n.js`, so
  `fmtDate` renders `11月7日` in Chinese and `Nov 7` in English.
- **Demo data:** `data/seed.js` translates its sample workspace through `localizeDemo()`. The data
  is stamped `demo: true`; switching language re-seeds it unless the user has edited anything
  (tracked via `data.touched` in `mutate()`).
- **Adding a language:** add an entry to `LOCALES`, extend `MONTHS`/`WEEKDAYS`, and add a
  dictionary keyed by the English source strings.

## Continuous integration

Every push and pull request runs lint, the format check and a production build
(`.github/workflows/ci.yml`).

## Deploy

`vercel.json` builds with Vite and serves `dist/`.
