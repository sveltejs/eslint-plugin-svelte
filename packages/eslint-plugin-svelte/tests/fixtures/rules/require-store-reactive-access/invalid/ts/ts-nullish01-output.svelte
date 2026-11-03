<script lang="ts">
	import { readable, writable, type Readable, type Writable } from 'svelte/store';

	const count = writable<number | null>(null);
	export let props: { count: Readable<number | null> };
	console.log($count ?? 0);
	console.log($count || 0);
	console.log(props.count ?? 0);
	console.log(getCount() ?? 0);
	const wrapped = writable(0) as Writable<number>;
	console.log($wrapped ?? readable(0));

	function getCount(): Readable<number | null> {
		return count;
	}
</script>
