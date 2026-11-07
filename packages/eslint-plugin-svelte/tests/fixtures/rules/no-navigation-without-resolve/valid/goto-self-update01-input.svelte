<script>
	import { goto } from '$app/navigation';

	let filters = $state({ q: '', page: 1 });
	let user = { name: 'a' };
	user = { ...user, name: 'b' };
	let list = $state(['?a']);

	function next() {
		filters = { ...filters, page: filters.page + 1 };
		list = [...list, '?b'];
		goto(`?q=${filters.q}`);
	}
</script>

<a href="https://x.com/{user.name}">X</a>
{#each list as href, i (i)}
	<a {href}>Item</a>
{/each}
