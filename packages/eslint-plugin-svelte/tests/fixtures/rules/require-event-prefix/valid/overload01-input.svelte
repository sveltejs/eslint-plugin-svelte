<script lang="ts">
  interface Props {
    select(): void;
    select(value: string): string;
  }

  let { select }: Props = $props();
</script>
