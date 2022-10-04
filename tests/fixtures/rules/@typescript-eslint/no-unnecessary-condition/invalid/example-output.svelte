<script lang="ts">
  export let foo: number | null = null
  /* ✗ BAD */
  let b = foo || 42
  /* ✓ GOOD */
  $: a = foo || 42
</script>

<!-- ✓ GOOD -->
{foo || 42}
