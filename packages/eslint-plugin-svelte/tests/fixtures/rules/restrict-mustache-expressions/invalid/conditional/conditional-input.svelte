<script lang="ts">

let foo: null | string = "test";
</script>
{#if foo === null}
    {foo }
{/if}