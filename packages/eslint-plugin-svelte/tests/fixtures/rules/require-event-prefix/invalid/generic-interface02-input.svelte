<script lang="ts" generics="T">
  interface Props<X> {
    run: () => X;
    select: (item: T) => void;
  }

  let { run, select }: Props<void> = $props();
</script>
