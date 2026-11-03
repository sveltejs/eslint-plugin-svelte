<script lang="ts">
  interface Props {
    custom: () => any;
    other(): unknown;
    wrapped: () => (unknown);
  }

  let { custom, other, wrapped }: Props = $props();
</script>
