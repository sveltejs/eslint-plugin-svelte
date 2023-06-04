<style>
  div {
    color: blue;
  }
</style>

<script>
  export let foo = FOO
</script>

<div>{foo}</div>

<script context="module">
  const FOO = "foo"
</script>

<svelte:options />