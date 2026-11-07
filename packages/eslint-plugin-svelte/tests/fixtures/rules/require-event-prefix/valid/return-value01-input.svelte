<script lang="ts">
  interface Props {
    getHref(item: string): string;
    formatDate: (date: Date) => string;
    isVisible: (index: number) => boolean;
    validate: (value: string) => boolean | void;
    load(): Promise<string>;
  }

  let { getHref, formatDate, isVisible, validate, load }: Props = $props();
</script>
