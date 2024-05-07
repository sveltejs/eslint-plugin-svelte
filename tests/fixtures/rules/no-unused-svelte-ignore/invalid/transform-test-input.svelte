<script>
</script>

<!-- ✓ GOOD -->
<!-- svelte-ignore a11y_autofocus a11y_missing_attribute -->
<img src="https://example.com/img.png" autofocus />

<!-- ✗ BAD -->
<!-- svelte-ignore a11y_autofocus a11y_missing_attribute -->
<img src="https://example.com/img.png" alt="Foo" />

<div class="foo">
	<div class="bar" />
</div>

<!-- svelte-ignore css_unused_selector -->
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
