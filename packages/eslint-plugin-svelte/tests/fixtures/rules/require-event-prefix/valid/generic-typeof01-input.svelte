<script lang="ts" generics="T">
  const current = null as T;
  declare function get(): T;
  interface Row { value: T }
  declare const row: Row;
  interface Props {
    getItem: () => typeof current;
    getResult: () => ReturnType<typeof get>;
    getValue: () => (typeof row)['value'];
  }
  let { getItem, getResult, getValue }: Props = $props();
</script>
