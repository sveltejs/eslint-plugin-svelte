<script lang="ts" generics="T">
  const current = undefined;
  declare function get(item: T): void;
  interface Props {
    click: () => typeof current;
    save: () => ReturnType<typeof get>;
  }
  let { click, save }: Props = $props();
</script>
