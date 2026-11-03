<script lang="ts">
  type Formatter = (value: number) => string;
  interface Props {
    getHref(item: string): string;
    formatDate: (date: Date) => string;
    isVisible: (index: number) => boolean;
    format: Formatter;
    load(): Promise<string>;
  }

  let { getHref, formatDate, isVisible, format, load }: Props = $props();
</script>
