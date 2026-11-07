<script lang="ts">
  interface Props {
    load(): Promise<string>;
    fetchItems: () => Promise<string[]>;
  }

  let { load, fetchItems }: Props = $props();
</script>
