<script lang="ts">
  interface Thenable {
    then(onfulfilled: (value: void) => void): void;
  }
  interface Props {
    custom: () => PromiseLike<void>;
    other: () => Thenable;
    load: () => Promise<unknown>;
    save: () => Promise<undefined>;
    nested: () => Promise<Promise<void>>;
  }

  let { custom, other, load, save, nested }: Props = $props();
</script>
