---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/no-unused-props'
description: 'Warns about defined Props properties that are unused'
since: 'v3.2.0'
---

# svelte/no-unused-props

> Warns about defined Props properties that are unused

- :gear: This rule is included in `"plugin:svelte/recommended"`.

## :book: Rule Details

This rule reports properties that are defined in Props but never used in the component code.  
It helps to detect dead code and improve component clarity by ensuring that every declared prop is utilized.

This rule checks various usage patterns of props:

- Direct property access
- Destructuring assignment
- Method calls
- Computed property access
- Object spread
- Constructor calls (new expressions)
- Assignment to other variables
- Index signatures (e.g. `[key: string]: unknown`)

Additionally, this rule checks if index signatures are properly used. When an index signature is defined but not captured using the rest operator (`...`), the rule will suggest using it.

Note: Properties of class types are not checked for usage, as they might be used in other parts of the application.

:warning: This rule requires `@typescript-eslint/parser` to work. Make sure you have installed `@typescript-eslint/parser` and configured it in your ESLint configuration. Therefore, the rule violations cannot be seen in the examples on this page because this documentation does not use `@typescript-eslint/parser`.

<!--eslint-skip-->

```svelte
<!-- ✓ Good Examples -->
<script lang="ts">
  /* eslint svelte/no-unused-props: "error" */
  // Direct property access
  const props: { value: string } = $props();
  console.log(props.value);
</script>
```

```svelte
<!-- ✓ Good Examples -->
<script lang="ts">
  /* eslint svelte/no-unused-props: "error" */
  // Destructuring assignment
  const { width, height }: { width: number; height: number } = $props();
  console.log(width, height);
</script>
```

```svelte
<!-- ✓ Good Examples -->
<script lang="ts">
  /* eslint svelte/no-unused-props: "error" */
  // Class properties are not checked
  class User {
    constructor(
      public name: string,
      public age: number
    ) {}
  }
  type Props = {
    user: User;
  };
  const props: Props = $props();
  console.log(props.user.name); // age is not reported as unused
</script>
```

```svelte
<!-- ✓ Good Examples -->
<script lang="ts">
  /* eslint svelte/no-unused-props: "error" */
  // Method calls
  const props2: { callback: () => void } = $props();
  props2.callback();
</script>
```

```svelte
<!-- ✓ Good Examples -->
<script lang="ts">
  /* eslint svelte/no-unused-props: "error" */
  // Computed property access
  const props3: { 'data-value': string } = $props();
  const value = props3['data-value'];
</script>
```

```svelte
<!-- ✓ Good Examples -->
<script lang="ts">
  /* eslint svelte/no-unused-props: "error" */
  // Constructor calls
  const props4: { config: { new (): any } } = $props();
  new props4.config();
</script>
```

```svelte
<!-- ✓ Good Examples -->
<script lang="ts">
  /* eslint svelte/no-unused-props: "error" */
  // Using index signature with rest operator
  interface Props {
    a: number;
    [key: string]: unknown;
  }
  let { a, ...rest }: Props = $props();
  console.log(rest);
</script>
```

```svelte
<!-- ✗ Bad Examples -->
<script lang="ts">
  /* eslint svelte/no-unused-props: "error" */
  // Unused property 'b'
  const props: { a: string; b: number } = $props();
  console.log(props.a);
</script>
```

```svelte
<!-- ✗ Bad Examples -->
<script lang="ts">
  /* eslint svelte/no-unused-props: "error" */
  // Unused property in destructuring
  const { x }: { x: number; y: number } = $props();
  console.log(x);
</script>
```

```svelte
<!-- ✗ Bad Examples -->
<script lang="ts">
  /* eslint svelte/no-unused-props: "error" */
  // Unused index signature
  interface Props {
    a: number;
    [key: string]: unknown; // This will be reported
  }
  let { a }: Props = $props();
</script>
```

## :wrench: Options

```js
{
  "svelte/no-unused-props": ["error", {
    // Whether to check properties from imported types
    "checkImportedTypes": false,
    // Patterns to ignore when checking property types
    "ignoreTypePatterns": [],
    // Patterns to ignore when checking for unused props
    "ignorePropertyPatterns": [],
  }]
}
```

- `checkImportedTypes` ... Controls whether to check properties from types defined in external files. Default is `false`, meaning the rule only checks types defined within the component file itself. When set to `true`, the rule will also check properties from imported and extended types.
- `ignoreTypePatterns` ... Regular expression patterns for type names to exclude from checks. Default is `[]` (no exclusions). Most useful when `checkImportedTypes` is `true`, allowing you to exclude specific imported types (like utility types or third-party types) from being checked.
- `ignorePropertyPatterns` ... Regular expression patterns for property names to exclude from unused checks. Default is `[]` (no exclusions). Most useful when `checkImportedTypes` is `true`, allowing you to ignore specific properties from external types that shouldn't trigger warnings.

Examples:

```svelte
<!-- ✓ Good Examples -->
<script lang="ts">
  /* eslint svelte/no-unused-props: ["error", { "checkImportedTypes": true }] */
  // Check properties from imported types
  import type { BaseProps } from './types';
  interface Props extends BaseProps {
    age: number;
  }
  let { name, age }: Props = $props();
  console.log(name, age);
</script>
```

```svelte
<!-- ✓ Good Examples -->
<script lang="ts">
  /* eslint svelte/no-unused-props: ["error", { "ignoreTypePatterns": ["/^Internal/"] }] */
  // Ignore properties from types matching the pattern
  interface InternalConfig {
    secretKey: string;
    debugMode: boolean;
  }
  interface Props {
    config: InternalConfig; // Properties of InternalConfig won't be checked
    value: number;
  }
  let { config, value }: Props = $props();
  console.log(value, config);
</script>
```

```svelte
<!-- ✓ Good Examples -->
<script lang="ts">
  /* eslint svelte/no-unused-props: ["error", { "ignorePropertyPatterns": ["/^_/"] }] */
  // Ignore properties with names matching the pattern
  interface Props {
    _internal: string;
    value: number;
  }
  let { value }: Props = $props();
  console.log(value);
</script>
```

## :gear: Required Configuration

This rule requires `@typescript-eslint/parser` to work. Please refer to the [User Guide](../user-guide.md) for more information.

## :rocket: Version

This rule was introduced in eslint-plugin-svelte v3.2.0

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/src/rules/no-unused-props.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/packages/eslint-plugin-svelte/tests/src/rules/no-unused-props.ts)
