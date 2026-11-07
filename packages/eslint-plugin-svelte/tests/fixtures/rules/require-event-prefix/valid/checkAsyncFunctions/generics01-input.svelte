<script lang="ts" generics="T">
  type Item = T;
  type Result<E, R> = Promise<R>;
  interface Loader extends Promise<T> {}
  interface Props {
    load: () => Promise<T>;
    loadAll: () => Promise<T[]>;
    loadAlias: () => Promise<Item>;
    loadResult: () => Result<string, T>;
    loader: () => Loader;
    fetch<U>(): Promise<U>;
  }

  let { load, loadAll, loadAlias, loadResult, loader, fetch }: Props = $props();
</script>
