<script lang="ts">
  interface Props {
    custom: () => Promise<void>;
  }

  let { custom }: Props = $props();

  void custom();
</script>
