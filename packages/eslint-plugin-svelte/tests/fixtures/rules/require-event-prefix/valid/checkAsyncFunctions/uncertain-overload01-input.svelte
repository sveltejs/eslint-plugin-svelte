<script lang="ts">
  interface Props {
    get(): void;
    get(value: string): unknown;
    load(): Promise<void>;
    load(value: string): Promise<any>;
    fail: () => Promise<never>;
  }
  let { get, load, fail }: Props = $props();
</script>
