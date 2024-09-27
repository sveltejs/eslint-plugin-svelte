<!-- prettier-ignore -->
{#snippet
  foo(
    {
      a
    }
  )
}
{/snippet}
{@render
  foo(
    {
      a
    }
  )
}
<div>
  {#snippet example()}
    <div></div>
  {/snippet}

  {
    #snippet example_2()
  }
    <div></div>
  {
    /snippet
  }
</div>
{
  #snippet example_3
    (

    )
}
  <div></div>
{
  /snippet
}
