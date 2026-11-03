<script lang="ts" generics="T">
  interface Props {
    load: () => Promise<T>;
    loadAll: () => Promise<T[]>;
  }

  let { load, loadAll }: Props = $props();
</script>
