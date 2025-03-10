<script lang="ts">
  interface Props {
    custom: any;
  }

  let { custom }: Props = $props();

  console.log(custom);
</script>
