<!-- prettier-ignore -->
<script>
  export let boxes;
</script>

<!-- prettier-ignore -->
{#each boxes as box}
{
@const
area
=
box.width
*
box.height
}
{box.width} * {box.height} = {area}
{/each}
