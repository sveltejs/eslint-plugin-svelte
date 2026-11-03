<script lang="ts" generics="T">
  import type { GenericProps } from './_props';
  type Row = { value: T; extra: string };
  declare const current: T;
  interface Props extends GenericProps<T> {
    getValue: () => Row['value'];
    getCurrent: () => typeof current;
    pick<T>(value: T): T;
  }

  let { getItem, getValue, getCurrent, pick }: Props = $props();
</script>
