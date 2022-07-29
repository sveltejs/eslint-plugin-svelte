#  (svelte/no-reactive-literals)

> Don't assign literal values in reactive statements

## :book: Rule Details

This rule reports on any assignment of a static, unchanging value within a reactive statement because it's not necessary.

<ESLintCodeBlock>

<!--eslint-skip-->

```svelte
<script>
  /* eslint svelte/no-reactive-literals: "error" */
  /* ✓ GOOD */
  let foo = "bar";
  
  /* ✗ BAD */
  $: foo = "bar";
</script>
```
</ESLintCodeBlock>

## :wrench: Options

Nothing

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/src/rules/no-reactive-literals.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-svelte/blob/main/tests/src/rules/no-reactive-literals.ts)
