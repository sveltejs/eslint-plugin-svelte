<script lang="ts">
	const foo = $derived.by(function (): this is object {
		return true;
	});
</script>

{foo}
