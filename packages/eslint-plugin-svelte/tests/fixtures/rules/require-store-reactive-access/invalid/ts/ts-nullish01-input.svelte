<script lang="ts">
	import { writable, type Readable } from 'svelte/store';

	const count = writable<number | null>(null);
	export let props: { count: Readable<number | null> };
	console.log(count ?? 0);
	console.log(count || 0);
	console.log(props.count ?? 0);
	console.log(getCount() ?? 0);

	function getCount(): Readable<number | null> {
		return count;
	}
</script>
