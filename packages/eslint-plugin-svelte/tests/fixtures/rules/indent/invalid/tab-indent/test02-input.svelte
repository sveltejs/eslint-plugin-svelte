<!-- prettier-ignore -->
<script>
    let text = "abc"
    const maxlength = 42
    const attrs = { disabled: true }
    function click() {}
</script>

<!-- prettier-ignore -->
<input
    type="text"
    class="
        a
        b
    "
    bind:value={text}
    {maxlength}
    {...attrs}
    readonly />
<!-- prettier-ignore -->
<button
    type="button"
    on:click={click}
    {maxlength}
    {...attrs}>
    CLICK ME!
</button>
<!-- prettier-ignore -->
<div
    data-attr
>
    <div
        data-attr
    >
        <div
            data-attr
        >
            <input
                type
                    =
                    "text"
                class
                    ="
                        a
                        b
                    "
                bind:value
                    =
                    {
                        text
                    }
                {
                    maxlength
                }
                {
                    ...attrs
                }
                readonly
            />
            <!-- prettier-ignore -->
            <button
                type="button"
                on:click={
                    click
                }
                {
                    maxlength
                }
                {
                    ...attrs
                }
            >
                CLICK
                ME!
            </button
            >
        </div
        >
    </div
    >
    <div
        data-attr
    >
    </div
    >
</div
>

<!--tests/fixtures/rules/indent/invalid/tab-indent/test02-input.svelte-->

<!-- prettier-ignore -->
<style>
.my-class
{
}
</style>
