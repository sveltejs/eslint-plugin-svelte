<script lang="ts" generics="T">
  interface Events {
    click: unknown;
    map<U>(value: U): U;
  }
  interface Row {
    value: T;
    extra: any;
  }
  type RowAlias = {
    value: T;
    extra: any;
  };
  interface Props {
    click: () => Events['click'];
    extra: () => Row['extra'];
    aliasExtra: () => RowAlias['extra'];
  }

  let { click, extra, aliasExtra }: Props = $props();
</script>
