<!-- prettier-ignore -->
<script lang="ts">
  type Props = {
    children: import('svelte').Snippet,
  }

  const { children }: Props = $props();
</script>

{@render children()}

<!-- tests/fixtures/rules/indent/valid/ts/ts-import-type01-input.svelte -->
