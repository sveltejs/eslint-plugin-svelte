<script lang="ts">
  interface Props<X> {
    run: () => X;
    select: (value: X) => void;
  }

  let { run, select }: Props<void> = $props();
</script>
