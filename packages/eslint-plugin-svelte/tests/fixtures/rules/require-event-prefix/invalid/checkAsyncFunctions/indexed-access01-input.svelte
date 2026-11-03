<script lang="ts">
  interface Events {
    click: unknown;
    map<U>(value: U): U;
  }
  interface Props {
    click: () => Promise<Events['click']>;
  }

  let { click }: Props = $props();
</script>
