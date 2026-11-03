<script lang="ts">
  interface Thenable {
    then(onfulfilled: (value: void) => void): void;
  }
  interface Props {
    custom: () => PromiseLike<void>;
    other: () => Thenable;
    load: () => Promise<unknown>;
  }

  let { custom, other, load }: Props = $props();
</script>
