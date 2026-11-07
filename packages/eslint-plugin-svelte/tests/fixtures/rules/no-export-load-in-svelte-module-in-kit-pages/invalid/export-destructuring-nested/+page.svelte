<script context="module">
	const obj = { a: [() => {}] };
	export const {
		a: [load]
	} = obj;
</script>
