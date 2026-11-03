<script lang="ts">
  interface Props {
    custom: () => any;
    other(): unknown;
  }

  let { custom, other }: Props = $props();
</script>
