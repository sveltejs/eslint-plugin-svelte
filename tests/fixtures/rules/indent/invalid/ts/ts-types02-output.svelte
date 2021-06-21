<!-- prettier-ignore -->
<script lang="ts">
  type T
    =
    [
      number
      ,
      number
    ]

  type A
    =
    keyof
      T
  type B
    =
    typeof
      C

  type D = (v)
    =>
    v is
      number
</script>

<!--tests/fixtures/rules/indent/invalid/ts/ts-types02-input.svelte-->
