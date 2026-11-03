<script lang="ts">
  interface Props {
    get: () => void;
    getaway(): void;
    close: () => undefined;
    select?: (value: string) => void;
  }

  let { get, getaway, close, select }: Props = $props();
</script>
