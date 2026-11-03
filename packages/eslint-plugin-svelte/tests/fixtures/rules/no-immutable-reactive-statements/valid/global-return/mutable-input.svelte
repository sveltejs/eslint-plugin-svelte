<script lang="ts">
  let a = 0;
  function increment() { a++; }
  $: b = a;
</script>
<button on:click={increment}>{b}</button>
