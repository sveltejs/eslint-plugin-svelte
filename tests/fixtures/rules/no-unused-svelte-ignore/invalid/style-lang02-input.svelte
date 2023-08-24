<div class="foo">
	<div class="bar" />
</div>

<!-- svelte-ignore css-invalid-global -->
<style lang="postcss">
	.foo {
		height: 20px;
		width: 20px;
		& .foo {
			height: 10px;
			width: 10px;
		}
	}
</style>
