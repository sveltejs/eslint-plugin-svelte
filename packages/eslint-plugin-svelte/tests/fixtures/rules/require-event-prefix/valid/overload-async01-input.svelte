<script lang="ts">
  interface Props {
    save(): Promise<void>;
    save(value: string): PromiseLike<void>;
    getItem(): void;
    getItem(value: string): string;
  }
  let { save, getItem }: Props = $props();
</script>
