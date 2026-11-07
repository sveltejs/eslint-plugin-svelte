<script lang="ts" generics="T">
  type Result<X> = X extends string ? string : void;
  interface Row<X> { value: X extends string ? string : void }
  interface Props {
    getIndexed: () => Row<T>['value'];
    getItem: () => Result<T>;
    getDirect: () => T extends string ? string : void;
  }
  let { getItem, getDirect, getIndexed }: Props = $props();
</script>
