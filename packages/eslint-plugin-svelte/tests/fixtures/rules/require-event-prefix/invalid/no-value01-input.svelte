<script lang="ts">
  interface Props {
    fail: () => never;
    clear: () => null;
    reset: () => void | null;
    custom: () => unknown | void;
  }

  let { fail, clear, reset, custom }: Props = $props();
</script>
