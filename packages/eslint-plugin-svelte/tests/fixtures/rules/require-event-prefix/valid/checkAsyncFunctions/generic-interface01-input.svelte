<script lang="ts">
  interface Props<X> {
    loadItem: () => Promise<X>;
  }

  let { loadItem }: Props<unknown> = $props();
</script>
