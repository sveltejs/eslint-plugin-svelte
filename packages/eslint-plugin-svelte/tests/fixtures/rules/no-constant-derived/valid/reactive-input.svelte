<script>
	import { store } from './store.js';

	let { post, first, last } = $props();
	let count = $state(0);
	const object = $state({ value: 1 });

	let doubled = $derived(count * 2);
	let fullName = $derived(`${first} ${last}`);
	let likes = $derived(post.likes);
	let value = $derived(object);
	let fromStore = $derived($store);
	let quadrupled = $derived(doubled * 2);
	let items = $derived([count]);
	let entry = $derived({ count });
	let key = $derived({ [first]: 1 });
</script>

{doubled}{fullName}{likes}{value}{fromStore}{quadrupled}{items}{entry}{key}
