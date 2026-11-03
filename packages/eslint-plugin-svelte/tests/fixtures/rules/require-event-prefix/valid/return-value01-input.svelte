<script lang="ts">
  interface Props {
    getHref(item: string): string;
    formatDate: (date: Date) => string;
    isVisible: (index: number) => boolean;
    validate: (value: string) => boolean | void;
    fail: () => never;
    load(): Promise<string>;
  }

  let { getHref, formatDate, isVisible, validate, fail, load }: Props = $props();
</script>
