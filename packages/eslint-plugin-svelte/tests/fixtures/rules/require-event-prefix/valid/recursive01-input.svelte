<script lang="ts" generics="T">
  type A = { b: B; value: T };
  type B = { a: A; label: string };
  interface Props {
    getA: () => unknown | A;
    getB: () => unknown | B;
  }

  let { getA, getB }: Props = $props();
</script>
