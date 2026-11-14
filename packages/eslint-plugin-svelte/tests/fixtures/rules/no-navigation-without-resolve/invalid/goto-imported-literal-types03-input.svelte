<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		HOME,
		LOGIN,
		M,
		type MenuItem,
		type NavHref,
		type WrittenItem
	} from './_links';

	// From a function result: not trusted.
	let { a, active, docs }: { a: NavHref; active: MenuItem['href']; docs: WrittenItem['href'] } =
		$props();
	goto(a);
	goto(active);
	function go(h: typeof HOME) {
		goto(h);
	}
	goto(LOGIN);
	goto(M.about);
	// Written out: trusted.
	goto(docs);
	go(HOME);
</script>

{#snippet link(href: typeof HOME)}
	<a {href}>Home</a>
{/snippet}
{@render link(HOME)}
