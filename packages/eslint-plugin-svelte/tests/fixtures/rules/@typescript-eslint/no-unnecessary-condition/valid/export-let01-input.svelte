<script lang="ts">
  export let foo: number | null = null
  export let bar = false

  const a = foo || 42
  const b = !bar && foo
</script>
