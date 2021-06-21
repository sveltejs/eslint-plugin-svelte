<!-- prettier-ignore -->
<script lang="ts">
  interface A {
    fn
      ?
      (
        a
          :
          string
      )
      :
      number
  }

  interface B {
    [
      k
        :
        string
    ]
      :
      string[
      ];
  }

  interface C {
    <
      T
        extends
          U
    >
      (
        e
          :
          E,
      )
      :
      R
    ;
  }
</script>

<!--tests/fixtures/rules/indent/invalid/ts/ts-interface01-input.svelte-->
