---
name: add-eslint-rule
description: Walks through the full workflow of adding a new ESLint rule to eslint-plugin-svelte — scaffolding via `pnpm run new`, implementing the rule, writing fixture-based tests, updating generated artifacts via `pnpm run update`, and adding a changeset. Use this when the user asks to add, implement, or create a new lint rule in this repository.
---

# Add a new ESLint rule to eslint-plugin-svelte

This skill describes the end-to-end workflow for adding a new rule to `eslint-plugin-svelte`. It covers the repository's automation scripts so you don't reinvent any of them.

## When to use

Use this skill whenever the user asks to:

- Add / implement / create a new lint rule for Svelte code.
- Port an existing rule from another plugin.
- Detect a new pattern in `.svelte` files and report / autofix it.

Do **not** use it for fixing or modifying an existing rule (just edit the rule file directly), or for general refactors of plugin internals.

## Prerequisites

- Repository root is the monorepo root (`eslint-plugin-svelte/`).
- All commands below run from `packages/eslint-plugin-svelte/` unless noted.
- Node + `pnpm install` already done.

## Step-by-step workflow

### 1. Confirm the target Svelte version and rule semantics

Before writing any code, pin down:

- **What pattern is being reported.** Quote the relevant Svelte docs (use the `svelte` MCP server's `get-documentation` if available).
- **Which Svelte major version(s) the pattern applies to.** Rules that only make sense in Svelte 5 (declaration tags, runes, etc.) must be gated with `conditions: [{ svelteVersions: ['5'] }]`. Rules that only apply pre-5 use `['3/4']`. Search existing rules for examples: `grep -rn "svelteVersions" packages/eslint-plugin-svelte/src/rules/`.
- **Whether to autofix or suggest.** Autofix only if the transformation is unambiguous and preserves behavior. Otherwise use `hasSuggestions: true` and provide a `suggest` array. Look at `no-at-debug-tags.ts` (suggestion-style) and `prefer-derived-over-derived-by.ts` (autofix-style) for templates.
- **Category.** Pick from existing values used in `meta.docs.category`: `'Best Practices'`, `'Stylistic Issues'`, `'Security Vulnerability'`, `'Possible Errors'`, `'System'`, `'Extension Rules'`, `'SvelteKit'`.

### 2. Scaffold with `pnpm run new`

From `packages/eslint-plugin-svelte/`:

```sh
pnpm run new <rule-id>
```

This script (`tools/new-rule.ts`) creates four artifacts:

- `src/rules/<rule-id>.ts` — rule skeleton.
- `tests/src/rules/<rule-id>.ts` — RuleTester runner that loads fixtures.
- `docs/rules/<rule-id>.md` (at the repo root `docs/`) — documentation skeleton.
- `tests/fixtures/rules/<rule-id>/{valid,invalid}/` — fixture directories.

Never hand-author these — always go through `pnpm run new` so the scaffolding matches the repository's expected layout.

### 3. Implement the rule

Edit `src/rules/<rule-id>.ts`:

- Fill in `meta.docs.description`, `category`, `recommended`.
- Add `conditions` (see step 1) if the rule is version-sensitive.
- Set `type: 'problem' | 'suggestion' | 'layout'`.
- Set `fixable: 'code'` or `hasSuggestions: true` as appropriate.
- Replace `messages: {}` with real message IDs.
- Implement `create(context)` returning visitors. For Svelte-specific AST nodes (e.g. `SvelteConstTag`, `SvelteDeclarationTag`, `SvelteIfBlock`, `SvelteMustacheTag`), use string visitor keys — they are already typed via `src/types-for-node.ts`.

Conventions to follow:

- Match existing comment style — generally **no JSDoc** on the default export; short single-line comments only when intent is non-obvious.
- Use `context.sourceCode` (not the deprecated `context.getSourceCode()`).
- Keep fixers minimal: prefer `fixer.removeRange` / `fixer.replaceTextRange` with explicit offsets over textual heuristics where possible.

### 4. Add fixtures

The test runner (`tests/utils/utils.ts → loadTestCases`) discovers fixtures automatically. Conventions:

- **Input files** go in `tests/fixtures/rules/<rule-id>/{valid,invalid}/` and must end with `-input.svelte` (or `-input.svelte.ts`, `-input.ts`, etc. — anything matching `*-input.*`).
- For invalid fixtures, `-errors.yaml` and `-output.svelte` are **generated automatically** the first time you run tests. Delete those files and rerun to regenerate when the rule changes.
- To force regeneration of all fixture outputs: `pnpm run test:update-fixtures -- -g <rule-id>` (or set `UPDATE_FIXTURES=1`).
- Per-fixture config: drop a JSON file beside the input, named `<basename>-config.json` (e.g. `case01-config.json`) for options/parser settings. To apply config to all fixtures in a directory, use `_config.json`.
- Per-fixture environment requirements: drop `<basename>-requirements.json` with `{ "svelte": ">=5.55.9" }` etc. Fixtures whose requirements don't match the currently installed deps are skipped silently.
- Use `{"only": true}` in a config file to focus a single fixture during dev — **remove before committing**.

Make sure to cover at least:

- A baseline valid case (so the rule has something to *not* report).
- A baseline invalid case showing the primary message.
- Edge cases relevant to the rule (whitespace, nested blocks, multiple matches per file).

### 5. Run tests

Always run tests scoped to the rule to keep feedback fast:

```sh
pnpm run mocha "tests/src/**/*.ts" --reporter dot --timeout 60000 -- -g <rule-id>
```

To regenerate fixtures while running:

```sh
UPDATE_FIXTURES=1 pnpm run mocha "tests/src/**/*.ts" --reporter dot --timeout 60000 -- -g <rule-id>
```

Inspect the generated `*-errors.yaml` and `*-output.svelte` — they encode the rule's behavior contract. Don't blindly accept them; verify they match intent.

After per-rule tests pass, run the full suite once before committing:

```sh
pnpm run test
```

### 6. Run `pnpm run update`

From `packages/eslint-plugin-svelte/`:

```sh
pnpm run update
```

This sequences eight generators (see `tools/update.ts`):

- `update-rules` — regenerates `src/utils/rules.ts` (the registry array). **Required** for the test runner to find the new rule via `plugin.rules[<rule-id>]`. Without this, tests fail with `Cannot read properties of undefined (reading 'meta')`.
- `update-rulesets` — refreshes config presets (`recommended`, etc.) based on `meta.docs.recommended`.
- `update-docs` — regenerates header blocks in each rule's doc file.
- `update-readme` — refreshes the rules table in the repo root `README.md`.
- `update-docs-rules-index` — refreshes `docs/rules.md`.
- `update-types-for-node` — refreshes `src/types-for-node.ts` (node visitor types).
- `update-meta` — refreshes `src/meta.ts` (version metadata).
- `update-rule-types` — regenerates `src/rule-types.ts` (typed rule option entries).

If `pnpm run update` errors partway through (e.g. on a Prettier/PostCSS parse error in some unrelated doc), check `git diff` to confirm the early generators (which include `update-rules`) ran. As long as `src/utils/rules.ts` lists your new rule, the test suite will work; you can run failing generators individually via `pnpm run ts ./tools/<generator>.ts`.

After `update`, **revert unrelated drift** in fixtures or other rules — `git checkout -- <path>` for any file that was touched but isn't part of your rule. Common drift sources: `tests/fixtures/rules/max-lines-per-block/**/*-errors.yaml` formatting churn.

### 7. Lint

```sh
pnpm run lint:es src/rules/<rule-id>.ts
```

Auto-fix with `pnpm run lint-fix`. The plugin lints itself, so any style violations in your new rule will block CI.

### 8. Add a changeset

From the repo root:

```sh
pnpm exec changeset
```

…or hand-write `.changeset/<slug>.md`:

```md
---
'eslint-plugin-svelte': minor
---

feat: add `svelte/<rule-id>` rule
```

Use `minor` for new rules, `patch` for bug fixes / docs-only changes, `major` for breaking changes. Look at recent merged changesets via `git log -- .changeset/*.md` for tone.

### 9. Commit

Stage exactly the files you intend to ship — at minimum:

- `.changeset/<slug>.md`
- `README.md` (auto-edited)
- `docs/rules.md` (auto-edited)
- `docs/rules/<rule-id>.md`
- `packages/eslint-plugin-svelte/src/rule-types.ts` (auto-edited)
- `packages/eslint-plugin-svelte/src/rules/<rule-id>.ts`
- `packages/eslint-plugin-svelte/src/utils/rules.ts` (auto-edited)
- `packages/eslint-plugin-svelte/tests/fixtures/rules/<rule-id>/`
- `packages/eslint-plugin-svelte/tests/src/rules/<rule-id>.ts`

Skip any fixture/doc that wasn't intentionally changed (revert with `git checkout`).

## Quick checklist

- [ ] `pnpm run new <rule-id>` scaffolded.
- [ ] Rule implemented in `src/rules/<rule-id>.ts` with `meta`, `messages`, `conditions` (if version-sensitive), and visitors.
- [ ] At least one valid + one invalid fixture.
- [ ] `pnpm run mocha "tests/src/**/*.ts" -- -g <rule-id>` passes.
- [ ] Generated `*-errors.yaml` and `*-output.svelte` reviewed.
- [ ] `pnpm run update` completed; `src/utils/rules.ts` lists the rule.
- [ ] Full `pnpm run test` passes.
- [ ] `pnpm run lint:es` clean.
- [ ] `docs/rules/<rule-id>.md` filled in (description, examples, "Further Reading").
- [ ] Changeset added with `minor` bump.
- [ ] Unrelated drift reverted from the working tree.

## Common pitfalls

- **`Cannot read properties of undefined (reading 'meta')` during tests.** You forgot `pnpm run update` (or at least `pnpm run ts ./tools/update-rules.ts`). The rule isn't in the registry yet.
- **Fixtures silently skipped.** A `*-requirements.json` is excluding the fixture under the current dep versions. Confirm with `pnpm list svelte` etc.
- **Rule fires on the wrong Svelte version.** Forgot `conditions` in `meta`. Add a `svelteVersions` array.
- **Auto-fix breaks code in edge cases (whitespace, comments).** Prefer working with the AST's `range` and `getText` plus a precise regex, rather than full-text replacement of the node.
- **`pnpm run update` blew up mid-way.** Check `git status`; the earlier generators usually completed. Don't block the whole rule on an unrelated Prettier error in a doc you didn't touch.
- **Prettier formatting error on commit.** Run `pnpm run lint-fix` or check the offending file via the `--check` output.

## Reference: rule anatomy

Smallest viable rule, mirroring the repo's conventions:

```ts
import { createRule } from '../utils/index.js';

export default createRule('<rule-id>', {
  meta: {
    docs: {
      description: '...',
      category: 'Best Practices',
      recommended: false
    },
    fixable: 'code',
    schema: [],
    messages: {
      unexpected: '...'
    },
    type: 'suggestion',
    conditions: [
      {
        svelteVersions: ['5']
      }
    ]
  },
  create(context) {
    return {
      SvelteConstTag(node) {
        context.report({
          node,
          messageId: 'unexpected',
          fix(fixer) {
            // minimal, range-based fix
            return null;
          }
        });
      }
    };
  }
});
```
