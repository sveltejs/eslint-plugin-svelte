<script>
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	let { prefix } = $props();
</script>

<a href="{prefix}{resolve('/a')}">A</a>
<button onclick={() => goto(prefix + resolve('/a'))}>A</button>
