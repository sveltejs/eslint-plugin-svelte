<script lang="ts">
  export let foo: null | string = "abc"

  const a = foo.length
  $: b = foo?.length
</script>
