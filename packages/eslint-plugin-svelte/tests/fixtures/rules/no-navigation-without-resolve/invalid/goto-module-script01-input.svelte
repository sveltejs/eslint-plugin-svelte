<script module>
	import { goto } from '$app/navigation';

	export function go() {
		goto('/from-module');
	}
</script>

<script>
	import { base } from '$app/paths';
</script>

<a href="{base}/x">X</a>
