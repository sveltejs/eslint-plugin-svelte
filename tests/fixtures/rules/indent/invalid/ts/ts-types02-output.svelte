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

  type E = [
    number,
    string?,
    boolean?
  ]
    |
    [
      {
      }
      ,
      [
        number?
      ]
      |
      null
      &
      boolean[
      ]
    ]
    &
    {
    }

  type F<T> =
    T extends
      (
        infer
          U
      )[
      ]
      ?
        U
      :
        T extends
          infer
            U
      ?
        U
      :
        T extends
          Promise<
            infer
              U
          >
      ?
        U
      :
        T
  ;
</script>

<!--tests/fixtures/rules/indent/invalid/ts/ts-types02-input.svelte-->
