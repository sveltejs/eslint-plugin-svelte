<script lang="ts">
  let { id }: { id: string } = $props();
</script>

<div {id}>1</div>

<div>2</div>

<style>
  #a {
    color: red;
  }
</style>
