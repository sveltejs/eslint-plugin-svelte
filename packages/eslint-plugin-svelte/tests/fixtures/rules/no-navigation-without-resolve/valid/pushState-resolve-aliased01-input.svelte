<script>
	import { resolve as alias } from '$app/paths';
	import { pushState } from '$app/navigation';

	pushState(alias('/foo/'));
</script>
