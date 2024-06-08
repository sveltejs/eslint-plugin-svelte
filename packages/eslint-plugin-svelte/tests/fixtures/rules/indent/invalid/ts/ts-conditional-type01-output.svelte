<!-- prettier-ignore -->
<script lang="ts">
  type X = A extends B ?
    C :
      D extends E ?
      F :
      G extends H ?
      I :
      J;
</script>

<!--tests/fixtures/rules/indent/invalid/ts/ts-conditional-type01-input.svelte-->
