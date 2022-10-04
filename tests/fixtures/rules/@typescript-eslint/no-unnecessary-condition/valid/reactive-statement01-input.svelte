<script lang="ts">
  export let foo = false
  export let bar: string | undefined = undefined

  $: a = !foo && bar
</script>
