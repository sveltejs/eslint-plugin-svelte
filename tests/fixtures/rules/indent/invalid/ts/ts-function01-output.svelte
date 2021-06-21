<!-- prettier-ignore -->
<script lang="ts">
  class
    A
  {
    fn <
      T
    >
      (
        e
          :
          T
      )
      :
      R

    fn <
      T
    >
      (
        e
          :
          T
      )
      :
      R
    {
      a++
    }

    fn2 <
      T extends (A)
    >
      (
      )
      : R
    {
      a++
    }
  }
</script>

<!--tests/fixtures/rules/indent/invalid/ts/ts-function01-input.svelte-->
