<script lang="ts">
let foo: string | null = null as unknown as string | null
</script>
{#if foo}
    { foo }
{/if}