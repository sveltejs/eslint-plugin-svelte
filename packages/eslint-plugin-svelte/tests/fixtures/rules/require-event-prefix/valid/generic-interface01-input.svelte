<script lang="ts">
  interface Props<X> {
    getItem: () => X;
    loadItem: () => Promise<X>;
  }

  let { getItem, loadItem }: Props<unknown> = $props();
</script>
