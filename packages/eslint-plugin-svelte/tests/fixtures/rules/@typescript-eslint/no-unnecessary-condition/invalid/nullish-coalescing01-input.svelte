<script lang="ts">
  let foo: null | boolean = null
  let bar: string = "foo"

  const a = foo ?? bar
  $: b = foo ?? bar
  $: {
    let baz: null | boolean = null
    c = baz ?? bar
  }
</script>
