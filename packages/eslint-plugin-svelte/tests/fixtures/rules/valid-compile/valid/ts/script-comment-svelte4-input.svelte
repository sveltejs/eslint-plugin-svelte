<script context="module">
  let foo
</script>

<script lang="ts">
  // svelte-ignore unused-export-let
  export let unused
  // svelte-ignore module-script-reactive-declaration
  $: reactive = foo
</script>
