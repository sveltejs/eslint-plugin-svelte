<script lang="ts">
  export let foo = false
  export let bar: string | undefined = undefined

  const a = !foo && bar
</script>
