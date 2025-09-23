<script lang="ts">
	let count = 0;
	function increment() {
		count += 1;
	}
</script>

{count}<br />
<button onclick={increment} type="button">Increment</button>
