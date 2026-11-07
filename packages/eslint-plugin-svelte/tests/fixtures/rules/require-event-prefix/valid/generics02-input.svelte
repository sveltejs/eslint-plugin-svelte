<script lang="ts" generics="T, K extends keyof T, O extends object">
  interface Row {
    value: T;
  }
  interface Props {
    getKey: (item: T) => K;
    getValue: (item: T) => T[K];
    getMaybeKey: () => K | undefined;
    getKeys: (item: O) => keyof O;
    getRowValue: () => Row['value'];
  }

  let { getKey, getValue, getMaybeKey, getKeys, getRowValue }: Props = $props();
</script>
