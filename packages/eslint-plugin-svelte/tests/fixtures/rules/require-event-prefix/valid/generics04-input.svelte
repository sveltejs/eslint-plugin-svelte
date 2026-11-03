<script lang="ts" generics="T, R extends { value: unknown; label: string }">
  interface Row<X> {
    value: X;
    label: string;
  }
  type Box<X> = { value: X };
  type Tree = { value: T; children: Tree[] } | undefined;
  type Node = { value: T; next: Next };
  type Next = Node[] | undefined;
  interface Props {
    getRowValue: () => Row<T>['value'];
    getBoxValue: () => Box<T>['value'];
    getRValue: () => R['value'];
    getTree: () => Tree;
    getNext: () => Next;
  }

  let { getRowValue, getBoxValue, getRValue, getTree, getNext }: Props = $props();
</script>
