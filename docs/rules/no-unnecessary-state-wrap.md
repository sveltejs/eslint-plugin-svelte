---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/no-unnecessary-state-wrap'
description: 'Disallow unnecessary $state wrapping of reactive classes'
since: 'v3.2.0'
---

# svelte/no-unnecessary-state-wrap

> Disallow unnecessary $state wrapping of reactive classes

- :gear: This rule is included in `"plugin:svelte/recommended"`.
- :bulb: Some problems reported by this rule are manually fixable by editor [suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions).

## :book: Rule Details

In Svelte 5, several built-in classes from `svelte/reactivity` are already reactive by default:

- `SvelteSet`
- `SvelteMap`
- `SvelteURL`
- `SvelteURLSearchParams`
- `SvelteDate`
- `MediaQuery`

Therefore, wrapping them with `$state` is unnecessary and can lead to confusion.

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-unnecessary-state-wrap: "error" */
  import {
    SvelteSet,
    SvelteMap,
    SvelteURL,
    SvelteURLSearchParams,
    SvelteDate,
    MediaQuery
  } from 'svelte/reactivity';

  // ✓ GOOD
  const set1 = new SvelteSet();
  const map1 = new SvelteMap();
  const url1 = new SvelteURL('https://example.com');
  const params1 = new SvelteURLSearchParams('key=value');
  const date1 = new SvelteDate();
  const mediaQuery1 = new MediaQuery('(min-width: 800px)');

  // ✗ BAD
  const set2 = $state(new SvelteSet());
  const map2 = $state(new SvelteMap());
  const url2 = $state(new SvelteURL('https://example.com'));
  const params2 = $state(new SvelteURLSearchParams('key=value'));
  const date2 = $state(new SvelteDate());
  const mediaQuery2 = $state(new MediaQuery('(min-width: 800px)'));
</script>
```

## :wrench: Options

```json
{
  "svelte/no-unnecessary-state-wrap": [
    "error",
    {
      "additionalReactiveClasses": [],
      "allowReassign": ["SvelteSet"]
    }
  ]
}
```

- `additionalReactiveClasses` ... An array of class names that should also be considered reactive. This is useful when you have custom classes that are inherently reactive. Default is `[]`.
- `allowReassign` ... Can be either a boolean or an array of class names:
  - If `true`, allows `$state` wrapping of any reactive classes when the variable is reassigned.
  - If an array, allows `$state` wrapping for the specified reactive classes when the variable is reassigned.
  - Default is `["SvelteSet"]`.

### Examples with Options

#### `additionalReactiveClasses`

```svelte
<script>
  /* eslint svelte/no-unnecessary-state-wrap: ["error", { "additionalReactiveClasses": ["MyReactiveClass"] }] */
  import { MyReactiveClass } from './foo';

  // ✓ GOOD
  const myState1 = new MyReactiveClass();

  // ✗ BAD
  const myState2 = $state(new MyReactiveClass());
</script>
```

#### `allowReassign`

```svelte
<script>
  /* eslint svelte/no-unnecessary-state-wrap: ["error", { "allowReassign": true }] */
  import { SvelteSet, SvelteMap } from 'svelte/reactivity';

  // ✓ GOOD
  let set1 = $state(new SvelteSet());
  set1 = new SvelteSet([1, 2, 3]); // Variable is reassigned

  let map1 = $state(new SvelteMap());
  map1 = new SvelteMap(); // Variable is reassigned

  // ✗ BAD
  const set2 = $state(new SvelteSet()); // const cannot be reassigned
  let set3 = $state(new SvelteSet()); // Variable is never reassigned
</script>
```

#### `allowReassign` as array

```svelte
<script>
  /* eslint svelte/no-unnecessary-state-wrap: ["error", { "allowReassign": ["SvelteSet"] }] */
  import { SvelteSet, SvelteMap } from 'svelte/reactivity';

  // ✓ GOOD
  let set = $state(new SvelteSet());
  set = new SvelteSet([1, 2, 3]); // SvelteSet is in allowReassign and variable is reassigned

  // ✗ BAD
  let map = $state(new SvelteMap()); // SvelteMap is not in allowReassign
  map = new SvelteMap();

  const set2 = $state(new SvelteSet()); // const cannot be reassigned
  let set3 = $state(new SvelteSet()); // Variable is never reassigned
</script>
```

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v3.2.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/no-unnecessary-state-wrap.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/no-unnecessary-state-wrap.ts)
