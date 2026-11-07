<script lang="ts" generics="T">
  type Result<X> = X extends string ? string : void;
  interface Props {
    loadKey: () => Promise<keyof T>;
    loadResult: () => Promise<Result<T>>;
    getItem(): Promise<void>;
    getItem(value: string): string;
  }
  let { loadKey, loadResult, getItem }: Props = $props();
</script>
