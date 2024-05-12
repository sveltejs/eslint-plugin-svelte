<script lang="ts">
  export let foo: null | boolean = null
  export let bar: string = "foo"

  const a = foo ?? bar
  $: b = foo ?? bar
  $: {
    let baz: null | boolean = null
    c = baz ?? bar
  }
</script>
