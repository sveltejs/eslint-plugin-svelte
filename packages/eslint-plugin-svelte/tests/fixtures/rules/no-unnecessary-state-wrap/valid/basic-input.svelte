<script>
	import {
		SvelteSet,
		SvelteMap,
		SvelteURL,
		SvelteURLSearchParams,
		SvelteDate,
		MediaQuery
	} from 'svelte/reactivity';

	// Valid usage of reactive classes without $state wrapping
	const set = new SvelteSet();
	const map = new SvelteMap();
	const url = new SvelteURL('https://example.com');
	const params = new SvelteURLSearchParams('key=value');
	const date = new SvelteDate();
	const mediaQuery = new MediaQuery('(min-width: 800px)');

	// Regular state usage is still valid
	const regularState = $state(42);
	const stateObject = $state({ foo: 'bar' });
</script>
