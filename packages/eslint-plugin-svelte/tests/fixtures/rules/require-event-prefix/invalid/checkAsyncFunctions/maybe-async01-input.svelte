<script lang="ts">
  interface Props {
    submit: () => void | Promise<void>;
    save: () => Promise<void> | undefined;
  }

  let { submit, save }: Props = $props();
</script>
