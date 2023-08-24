<script>
</script>

<!-- ✓ GOOD -->
<!-- svelte-ignore a11y-autofocus a11y-missing-attribute -->
<img src="https://example.com/img.png" autofocus />

<!-- ✗ BAD -->
<!-- svelte-ignore a11y-autofocus a11y-missing-attribute -->
<img src="https://example.com/img.png" alt="Foo" />

<div class="foo">
	<div class="bar" />
</div>

<!-- svelte-ignore css-unused-selector -->
<style lang="postcss">
	.foo {
		height: 20px;
		width: 20px;
		& .bar {
			height: 10px;
			width: 10px;
		}
	}
</style>
