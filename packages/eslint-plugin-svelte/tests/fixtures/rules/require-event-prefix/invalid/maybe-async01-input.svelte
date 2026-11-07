<script lang="ts">
  interface Props {
    submit: () => void | Promise<void>;
    save: () => Promise<void> | undefined;
    reset(): void | PromiseLike<void>;
  }

  let { submit, save, reset }: Props = $props();
</script>
