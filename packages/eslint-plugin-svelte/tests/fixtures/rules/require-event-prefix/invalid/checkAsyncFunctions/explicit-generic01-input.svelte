<script lang="ts" generics="T">
  interface Props {
    select: (item: T) => (void | undefined | null);
    save: () => Promise<void>;
    clear: () => PromiseLike<undefined>;
    nested: () => Promise<Promise<void>>;
  }
  let { select, save, clear, nested }: Props = $props();
</script>
