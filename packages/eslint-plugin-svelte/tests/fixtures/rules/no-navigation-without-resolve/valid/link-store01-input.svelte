<script>
	import { writable } from 'svelte/store';

	const href = writable('/about');
</script>

<!-- `$href` is the value of the store, which the rule cannot see. -->
<a href={$href}>Click me!</a>
