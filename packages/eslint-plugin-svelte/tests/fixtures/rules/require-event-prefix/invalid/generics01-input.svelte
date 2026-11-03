<script lang="ts" generics="T, V extends void">
  interface Props {
    select: (item: T) => void;
    reset: () => V;
    clear<U extends void>(): U;
  }

  let { select, reset, clear }: Props = $props();
</script>
