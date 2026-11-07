<script lang="ts">
  interface Props {
    getHref?: (item: string) => string;
    format?(item: string): string;
  }

  let { getHref, format }: Props = $props();
</script>
