---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/no-useless-props'
description: 'disallow component props that no call site ever passes (whole-program, opt-in)'
---

# svelte/no-useless-props

> disallow component props that no call site ever passes (whole-program, opt-in)

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>

## :book: Rule Details

This rule reports a component prop that **no call site anywhere in your project ever passes** — neither as an attribute (`<C prop={…}>`), a binding (`bind:prop`), a spread, nor as body/`{#snippet}` content. Such a prop always takes its default, so it is dead from the consumer side: usually it should be removed (along with the now-unreachable code behind it), or a caller is missing.

This complements [`svelte/no-unused-props`](./no-unused-props.md): that rule flags a prop never **read inside** its own component (a single-file check), whereas this rule flags a prop never **passed from outside** (a whole-program check). The two together catch both ends of a dead prop.

Because "is this prop ever passed?" cannot be answered from one file, the rule does a **one-time whole-program pre-scan** the first time it runs (powered by [`svelte-shaker`](https://github.com/baseballyama/svelte-shaker)), caches the result, and then reports per file. It only reports **high-confidence** cases and is designed to never produce false positives:

- a component with **zero call sites** is skipped — it is an entry / route page whose props are framework-injected (a SvelteKit `+page.svelte`'s `data`, a `mount()` target, etc.);
- a component that **escapes as a value** (`<svelte:component this={C}>`, `const X = C`) is skipped — its prop usage is unknowable;
- a prop is reported only when **every** call site neither names it nor carries a spread that might set it.

An incomplete scan (e.g. a component reached only through an unfollowed import alias) can only make the rule **under**-report, never over-report.

> This rule targets apps where every prop should have a consumer. For a published component **library** whose props are a public API, many props are intentionally optional and unused internally — do not enable this rule there.

<!--eslint-skip-->

```svelte
<script lang="ts">
  /* eslint svelte/no-useless-props: "error" */

  // ✓ GOOD — `used` is passed by some <Comp used={…}> somewhere in the project.
  // ✗ BAD  — `decoration` is never passed by any call site.
  let { used, decoration } = $props();
</script>

<p>{used}</p><p>{decoration}</p>
```

## :wrench: Options

```json
{
  "svelte/no-useless-props": [
    "error",
    {
      "include": ["src"],
      "aliases": { "$lib": "src/lib" }
    }
  ]
}
```

- `include` (`string[]`, default `["src"]`) — directories, relative to the ESLint working directory, that contain the whole app. **Every `.svelte` call site must be inside them** for the analysis to be complete; otherwise the rule simply under-reports.
- `aliases` (`Record<string, string>`, default `{ "$lib": "src/lib" }`) — import-prefix aliases mapped to a directory (relative to the cwd), so aliased imports such as `import X from '$lib/X.svelte'` resolve during the scan.

## :stopwatch: Performance & caveats

Unlike an ordinary per-file rule, this one parses and analyzes **every component in the project**. To keep that affordable it runs the whole-program scan **once** on the first file of a lint run and caches the result for the rest of the run, but that one-time cost still scales with project size (it grows with the number of `.svelte` files — expect on the order of a few seconds for a large app). Enabling it therefore adds a fixed startup cost to `eslint`; it is best suited to CI / pre-commit and a deliberate opt-in for editors.

The scan reads files from **disk**. In a long-lived editor session, edits to _other_ files are not reflected until the cache is rebuilt (a fresh ESLint process); and a finding in the file you are editing is suppressed when its on-disk text has drifted from the buffer, to avoid reporting at the wrong location. Treat the diagnostics as accurate on save / in CI, and approximate while typing.

## :warning: Requirements

This rule needs the optional peer dependency [`svelte-shaker`](https://www.npmjs.com/package/svelte-shaker) installed, and a Node version with synchronous `require(ESM)` support (**Node >= 22.12**). If either is missing the rule prints a one-time warning and does nothing.

It also requires **Svelte 5 runes** (`$props()`).

## :books: Further Reading

- [`svelte/no-unused-props`](./no-unused-props.md) — the single-file counterpart (props never read inside the component).
- [`svelte-shaker`](https://github.com/baseballyama/svelte-shaker) — the whole-program Svelte tree-shaker that powers the analysis.

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/no-useless-props.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/no-useless-props.ts)
