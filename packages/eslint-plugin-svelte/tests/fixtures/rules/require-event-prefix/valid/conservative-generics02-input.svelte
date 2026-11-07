<script lang="ts" generics="V extends void">
  interface Props {
    reset<V extends void>(): V;
    clear: () => V;
  }

  let { reset, clear }: Props = $props();
</script>
