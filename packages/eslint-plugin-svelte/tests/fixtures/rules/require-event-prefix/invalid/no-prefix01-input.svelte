<script lang="ts">
  interface Props {
    custom(): void;
  }

  let { custom }: Props = $props();

  custom();
</script>
