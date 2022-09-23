<script lang="ts">
  export let foo: null | boolean = null
  export let bar: string = "foo"

  const a = foo ?? bar
  $: b = foo ?? bar
</script>
