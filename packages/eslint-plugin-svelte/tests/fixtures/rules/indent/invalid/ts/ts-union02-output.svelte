<!-- prettier-ignore -->
<script lang="ts">
  type A = | a
    | b
    | c
    | d


  type T =a
    |
    b
    |
    c
  type U = | c
    |
    a
    |
    b
  type V = c &
    a
    &
    b
  type W = & c
    &
    a
    &
    b
  type X = c
    &
    (
      a
      |
      b
    )

  type T = c |
    a
    | b
  type U = | c
    | a
    | b
  type V = c
    & a
    & b
  type W = c
    & a
    & b
  type X = c
    &
    (
      a
      | b
    )
</script>

<!--tests/fixtures/rules/indent/invalid/ts/ts-union01-input.svelte-->
