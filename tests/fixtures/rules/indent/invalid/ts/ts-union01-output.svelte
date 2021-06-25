<!-- prettier-ignore -->
<script lang="ts">
  type A =
    | a
    | b
    | c
    | d


  type T =
    a
    |
    b
  type U =
    |
    a
    |
    b
  type V =
    a
    &
    b
  type W =
    &
    a
    &
    b
  type X =
    &
    (
      a
      |
      b
    )

  type T =
    a
    | b
  type U =
    | a
    | b
  type V =
    a
    & b
  type W =
    & a
    & b
  type X =
    &
    (
      a
      | b
    )
</script>

<!--tests/fixtures/rules/indent/invalid/ts/ts-union01-input.svelte-->
