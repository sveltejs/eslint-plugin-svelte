<script>
  export let prop = 42
  /* ✓ GOOD */
  $: double1 = prop * 2
</script>
