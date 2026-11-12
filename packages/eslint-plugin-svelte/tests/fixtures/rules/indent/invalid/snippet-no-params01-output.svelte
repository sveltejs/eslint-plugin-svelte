<!-- prettier-ignore -->
<div>
  {#snippet foo()}
    <p>
      {@render baz()
}
    </p>
  {/snippet}
  {#snippet
    bar
      (
      )
  }
    {@render qux(a, (b))
}
  {/snippet}
</div>
