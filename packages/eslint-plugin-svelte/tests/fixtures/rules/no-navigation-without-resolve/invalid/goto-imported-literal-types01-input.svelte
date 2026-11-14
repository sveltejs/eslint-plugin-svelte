<script lang="ts">
	import { goto } from '$app/navigation';
	import { HOME, ABOUT, TYPED, LINKS, type load } from './_links';

	// Literal types from a function result are not trusted.
	goto(HOME);
	goto(LINKS.b);
	// Written-out literals are.
	goto(ABOUT);
	goto(TYPED);
	goto(LINKS.a);

	// `data` comes from a function result (`load`), so its literal types are not trusted.
	let { data }: { data: ReturnType<typeof load> } = $props();
	goto(data.next);
	goto(data.plain);
</script>
