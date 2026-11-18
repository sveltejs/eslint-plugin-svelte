<div>
  {#snippet foo()}
    <p>
      {@render baz()
      }
    </p>
  {/snippet}
  {#snippet bar()}
    {@render qux(a, (b))
    }
    {#snippet inner()}
      <span>{(x)}</span>
    {/snippet}
  {/snippet}
  {#snippet
    multi
      (
      )
  }
    {f()}
  {/snippet}
</div>
