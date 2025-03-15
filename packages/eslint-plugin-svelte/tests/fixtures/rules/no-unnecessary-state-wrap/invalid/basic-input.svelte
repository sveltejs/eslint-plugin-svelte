<script>
	import {
		SvelteSet,
		SvelteMap,
		SvelteURL,
		SvelteURLSearchParams,
		SvelteDate,
		MediaQuery
	} from 'svelte/reactivity';

	// These should be reported as unnecessary $state wrapping
	const set = $state(new SvelteSet());
	const map = $state(new SvelteMap());
	const url = $state(new SvelteURL('https://example.com'));
	const params = $state(new SvelteURLSearchParams('key=value'));
	const date = $state(new SvelteDate());
	const mediaQuery = $state(new MediaQuery('(min-width: 800px)'));

	// Regular state usage is still valid
	const regularState = $state(42);
	const stateObject = $state({ foo: 'bar' });
</script>
