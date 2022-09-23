<script lang="ts">
  export let foo: null | boolean = null

  const a = foo == null
  $: b = foo == null
</script>
