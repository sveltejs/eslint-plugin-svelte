<!-- comment1 -->
<svelte:options />

<!-- comment2 -->
<script context="module">
  const FOO = "foo"
</script>

<!-- comment3 -->
<script>
  export let foo = FOO
</script>

<!-- comment4 -->
<svelte:window />
<svelte:document />
<svelte:head />
<svelte:body />

<!-- comment5 -->
<div>{foo}</div>

<!-- comment6 -->
<style>
  div {
    color: blue;
  }
</style>

<!-- comment7 -->