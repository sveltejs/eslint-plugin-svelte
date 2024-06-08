<!-- prettier-ignore -->
<script lang="ts">
  interface I
  {
    foo
      ?
      :
      number
  }
  interface I2
    extends
      I
  {
    bar
      :
      string
  }
  class
    Impl
    extends
      E
    implements
      I2
      ,
      I
  {
    public foo
      =
      42
    protected get
    bar
      (
      )
    {
      return 'abc'
    }
  }

  class
    Impl2
    extends
      E
    implements
      I2
      ,
      I
  {
    public foo
      =
      42
    protected get
    bar
      (
      )
    {
      return 'abc'
    }
  }
</script>

<!--tests/fixtures/rules/indent/invalid/ts/ts-interface01-input.svelte-->
