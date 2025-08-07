<script>
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';

	const value = resolve('/foo/');

	goto(resolve('/foo/'));
	goto(value);
</script>
