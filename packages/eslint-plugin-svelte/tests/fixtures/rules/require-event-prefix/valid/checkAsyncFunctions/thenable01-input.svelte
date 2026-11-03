<script lang="ts">
  interface Props {
    getQuery: () => { then: string };
  }

  let { getQuery }: Props = $props();
</script>
