<script lang="ts" generics="T">
  type Result = void | Promise<Result>;
  type Row = { value: T; extra: unknown; children: Row[] };
  interface Props {
    run: () => Result;
    getExtra: () => Row['extra'];
  }

  let { run, getExtra }: Props = $props();
</script>
