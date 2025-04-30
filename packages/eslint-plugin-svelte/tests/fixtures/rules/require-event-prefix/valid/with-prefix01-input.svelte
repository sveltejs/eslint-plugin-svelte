<script lang="ts">
  interface Props {
    oncustom(): void;
  }

  let { oncustom }: Props = $props();

  oncustom();
</script>
