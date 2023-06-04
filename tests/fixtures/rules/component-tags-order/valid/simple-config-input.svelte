<script>
  export let foo = FOO
</script>

<script context="module">
  const FOO = "foo"
</script>

<div>{foo}</div>

<style>
  div {
    color: blue;
  }
</style>
