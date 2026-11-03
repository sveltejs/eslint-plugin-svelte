<script lang="ts" generics="P extends Promise<void>">
  type Unknown = unknown;
  type Result<E, R> = Promise<R>;
  interface Props {
    load: () => Promise<Unknown>;
    save: () => Result<string, any>;
    submit: () => P;
    fail: () => Promise<never>;
  }

  let { load, save, submit, fail }: Props = $props();
</script>
