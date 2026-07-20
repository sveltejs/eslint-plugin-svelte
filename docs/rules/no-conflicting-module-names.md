---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/no-conflicting-module-names'
description: 'disallow a `.svelte` component and a same-named runes module (e.g. `Foo.svelte` and `Foo.svelte.ts`) from coexisting'
---

# svelte/no-conflicting-module-names

> disallow a `.svelte` component and a same-named runes module (e.g. `Foo.svelte` and `Foo.svelte.ts`) from coexisting

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>

## :book: Rule Details

Since Svelte 5 you can write runes modules named `.svelte.ts` and `.svelte.js`. When a component `Foo.svelte` and a module `Foo.svelte.ts` sit in the same folder, the import specifier `./Foo.svelte` no longer has one meaning. Different tools resolve it differently:

| Tool                                                    | `./Foo.svelte` resolves to |
| ------------------------------------------------------- | -------------------------- |
| Bundlers (Vite) and `svelte-check`                      | `Foo.svelte` (component)   |
| Plain TypeScript (`tsc`, typescript-eslint type checks) | `Foo.svelte.ts` (module)   |

Plain TypeScript does not know the `.svelte` extension, so it appends `.ts` and lands on the module. Your app builds and runs with the component, while type checking and type-aware lint quietly use the module. The mismatch is silent and hard to spot.

This rule reports the `.svelte` component when a sibling module file with the same name exists. Renaming the module (for example to `foo-state.svelte.ts`) removes the ambiguity.

The following module extensions trigger a report: `.ts`, `.tsx`, `.js`, `.jsx`, `.mts`, `.cts`, `.mjs`, `.cjs`.

Declaration files are not reported. `Foo.svelte.d.ts` and `Foo.d.svelte.ts` are legitimate and do not shadow the component.

<!-- prettier-ignore-start -->
```

src/
  Foo.svelte
  Foo.svelte.ts   // ✗ BAD: collides with Foo.svelte

src/
  Foo.svelte
  foo-state.svelte.ts   // ✓ GOOD: a different name, no collision
```

<!-- prettier-ignore-end -->

## :wrench: Options

Nothing.

## :couple: Related Rules

- None

## :books: Further Reading

- [Repro repository](https://github.com/baseballyama/svelte-module-collision-repro)

## :mag: Preset

This rule is not included in any preset. Enable it explicitly if you want it.

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/no-conflicting-module-names.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/no-conflicting-module-names.ts)
