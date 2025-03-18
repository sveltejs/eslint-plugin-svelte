<script lang="ts">
  interface Props {
    custom: number;
  }

  let { custom }: Props = $props();

  console.log(custom);
</script>
