<script lang="ts">
  interface Props {
    select(): void;
    select(value: string): undefined;
  }

  let { select }: Props = $props();
</script>
