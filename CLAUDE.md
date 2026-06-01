# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

pnpm workspace monorepo. Two workspace members:

- `packages/eslint-plugin-svelte` — the published plugin. All rule, config, and processor code lives here.
- `docs-svelte-kit` — SvelteKit site published as the docs at https://sveltejs.github.io/eslint-plugin-svelte.

`docs/rules/*.md` (at the repo root) is the source of truth for per-rule documentation; the docs site reads from it. `README.md` at the repo root is copied into the published package by `prerelease`.

`pnpm-workspace.yaml` pins a `minimumReleaseAge` of 24h for dependencies (supply-chain protection), with an allowlist for trusted scopes (`@sveltejs/*`, `svelte`, `svelte-eslint-parser`, `eslint`, etc.). If you add a dep that needs immediate updates, it must go on that allowlist.

## Common commands

Run from the **repo root** unless noted:

- `pnpm install` — install workspace deps.
- `pnpm build` — build all workspace packages.
- `pnpm test` — run tests in every workspace.

Run from `packages/eslint-plugin-svelte`:

- `pnpm test` — run the mocha suite (`tests/src/**/*.ts`, 60s timeout, dot reporter).
- `pnpm test -- -g <pattern>` — run only tests matching the mocha grep pattern (typically the rule name, e.g. `pnpm test -- -g indent`).
- `pnpm test:update-fixtures` — regenerate missing `*-errors.json` / `*-output.svelte` fixture files. Also re-run after intentionally changing rule output, after first deleting the stale files.
- `pnpm test:debug` — same as `pnpm test` but with debug env from `.env-cmdrc.json`.
- `pnpm lint` / `pnpm lint-fix` — ESLint over the package (it lints itself).
- `pnpm new <rule-id>` — scaffold a new rule. Creates `src/rules/<id>.ts`, `tests/src/rules/<id>.ts`, `docs/rules/<id>.md`, and `tests/fixtures/rules/<id>/{valid,invalid}/`.
- `pnpm update` — regenerate all auto-generated files (rules index, README rule tables, config rule lists, rule types, types-for-node). **Run this after adding/renaming/removing a rule or changing rule metadata.**
- `pnpm build:meta` — regenerate only `src/meta.ts` (version info).

To preview the docs site: `cd docs-svelte-kit && pnpm build && pnpm preview`.

## Rule architecture

Every rule is defined with `createRule(ruleName, { meta, create })` from `src/utils/index.ts`. `createRule` does two things you need to know about:

1. It fills in `meta.docs.url`, `meta.docs.ruleId` (`svelte/<name>`), and `meta.docs.ruleName` automatically — do not hard-code them.
2. It wraps `create` with a **conditions gate**. If `meta.conditions` is set, the rule's visitors are only registered when the file's `SvelteContext` (Svelte version, runes mode, file type like `.svelte` / `.svelte.ts`, SvelteKit version, SvelteKit file type) matches at least one condition. When the parser isn't `svelte-eslint-parser` (i.e. `svelteContext` is `null`), the rule still runs. Use `conditions` for runes-only or Svelte-5-only or SvelteKit-only rules instead of doing version checks inside `create`.

Rules consume the AST from [`svelte-eslint-parser`](https://github.com/sveltejs/svelte-eslint-parser) (re-exported as `AST`). The plugin also ships a `processor` (`src/processor/index.ts`, registered as `processors['.svelte']` and `processors.svelte`) — keep that in mind when changing how `.svelte` source is sliced for linting.

### Auto-generated files — never hand-edit

These are rewritten by `pnpm update` / `pnpm build:meta`. Edit the source then regenerate:

- `src/utils/rules.ts` — the rule list (imports + array). Driven by files in `src/rules/`.
- `src/configs/flat/{all,recommended,base,prettier}.ts` — derived from each rule's `meta.docs.recommended` / `category` / `conflictWithPrettier`.
- `src/rule-types.ts` — typed rule option surface.
- `src/types-for-node.ts` — AST node listener types.
- `src/meta.ts` — package name/version.
- `README.md` rule tables and the rules index in `docs/rules/index.md`.

The generators live in `packages/eslint-plugin-svelte/tools/`. `tools/update.ts` is the umbrella that runs them all.

## Tests

Mocha + a fixture-driven `RuleTester` wrapper from `tests/utils/eslint-compat.ts`. A rule test typically does:

```ts
tester.run('<rule-id>', rule, loadTestCases('<rule-id>'));
```

`loadTestCases` (in `tests/utils/utils.ts`) walks `tests/fixtures/rules/<rule-id>/{valid,invalid}/`:

- Input files end in `-input.svelte` (or `-input.svelte.ts`, `-input.svelte.js`).
- Per-test config: a sibling `<name>-config.json`. Directory-wide config: `_config.json`.
- For invalid tests, expected errors live in `<name>-errors.json` and expected fix output in `<name>-output.svelte`. **If these files are missing they are auto-generated on the next test run** — verify the generated content, commit it, and re-run to confirm green.
- To focus on a single fixture, add `{"only": true}` to its `-config.json`. Remove before opening a PR.

## Release flow

Uses [changesets](https://github.com/changesets/changesets). Add a changeset (`pnpm changeset`) for any user-visible change; the release PR and publish are automated via `.github/workflows`. `prerelease` cleans, rebuilds, and copies the root `README.md` into the package directory so the published tarball has it.
