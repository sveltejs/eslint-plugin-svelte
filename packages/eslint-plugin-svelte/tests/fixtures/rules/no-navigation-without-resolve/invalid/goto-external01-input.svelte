<script>
	import { goto, pushState, replaceState, preloadData } from '$app/navigation';
	import { resolve } from '$app/paths';

	goto('https://svelte.dev');
	goto('//svelte.dev');
	goto('mailto:a@example.com');
	goto(new URL('https://svelte.dev/docs'));
	goto('https://svelte.dev' + resolve('/foo'));
	pushState('https://svelte.dev', {});
	replaceState('https://svelte.dev', {});
	preloadData('https://svelte.dev');
</script>
