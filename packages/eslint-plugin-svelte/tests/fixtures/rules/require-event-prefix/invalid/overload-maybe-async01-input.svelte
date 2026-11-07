<script lang="ts">
  type Async = Promise<void>;
  interface Props {
    click(): void;
    click(value: string): Async;
    save(value: string): Promise<void>;
    save(): void;
    clear(): Promise<void>;
    clear(value: string): undefined;
  }
  let { click, save, clear }: Props = $props();
</script>
