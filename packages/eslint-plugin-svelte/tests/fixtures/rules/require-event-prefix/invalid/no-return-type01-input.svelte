<script lang="ts">
  interface Props {
    // @ts-expect-error -- implicitly `any`
    custom();
  }

  let { custom }: Props = $props();
</script>
