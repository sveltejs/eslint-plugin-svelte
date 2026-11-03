<script lang="ts" generics="T">
  interface Props {
    getItem: () => T;
    getOptional: () => T | undefined;
    getWrapped: () => (T);
    load: () => Promise<T>;
    pick<U>(value: U): U;
  }

  let { getItem, getOptional, getWrapped, load, pick }: Props = $props();
</script>
