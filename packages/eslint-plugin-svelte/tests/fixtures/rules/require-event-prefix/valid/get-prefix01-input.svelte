<script lang="ts">
  interface Props {
    getHref: (value: string) => string;
    getLabel: (item: unknown) => string;
  }

  let { getHref, getLabel }: Props = $props();
</script>
