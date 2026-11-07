<script lang="ts">
  type Empty = void;
  interface Row { done: undefined; }
  interface Props {
    click: () => Empty;
    clear: () => Row['done'];
  }
  let { click, clear }: Props = $props();
</script>
