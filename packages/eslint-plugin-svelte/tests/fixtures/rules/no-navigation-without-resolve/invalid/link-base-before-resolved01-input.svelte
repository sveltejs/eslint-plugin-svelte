<script>
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { resolve } from '$app/paths';
</script>

<a href="{base}{resolve('/x')}">X</a>
<a href="{base}?next={resolve('/x')}">OK</a>
<button onclick={() => goto(base + resolve('/x'))}>X</button>
