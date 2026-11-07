<script lang="ts" generics="T, S extends string">
  type Item = T;
  interface Props {
    getItem: () => T;
    getOptional: () => T | undefined;
    getWrapped: () => (T);
    getAlias: () => Item;
    getMaybe: () => T | void;
    getLabel: () => S;
    load: () => Promise<T>;
    loadMaybe: () => void | Promise<T>;
    pick<U>(value: U): U;
  }

  let { getItem, getOptional, getWrapped, getAlias, getMaybe, getLabel, load, loadMaybe, pick }: Props = $props();
</script>
