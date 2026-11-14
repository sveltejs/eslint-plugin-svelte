<!-- prettier-ignore -->
<script lang="ts">
    let a: any;
    $: (a as any) = 1;
    $: a! = 1;
</script>
