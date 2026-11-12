<script lang="ts">
  let x = 1;
</script>

<div>
  {#snippet foo ()}
    <p>
      {@render baz((x as number))
      }
    </p>
  {/snippet}
  {#snippet bar(a: number, b: (c: number) => void)}
    {b(a)
    }
  {/snippet}
</div>
