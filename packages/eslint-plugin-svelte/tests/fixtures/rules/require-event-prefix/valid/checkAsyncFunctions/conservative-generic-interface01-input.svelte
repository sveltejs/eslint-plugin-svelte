<script lang="ts" generics="T">
  interface Props<X> {
    load: () => Promise<X>;
  }

  let { load }: Props<void> = $props();
</script>
