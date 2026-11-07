<script lang="ts" generics="T">
  type Result<X> = void;
  type Conditional<X> = X extends string ? void : undefined;
  interface Row<X> {
    value: X;
    done: void;
  }
  interface Props {
    click: () => Result<T>;
    done: () => Row<T>['done'];
    conditional: () => Conditional<T>;
    generic<U>(): U extends string ? void : undefined;
  }
  let { click, done, conditional, generic }: Props = $props();
</script>
