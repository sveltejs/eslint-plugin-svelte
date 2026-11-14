<script>
	import { pushState } from '$app/navigation';

	const empty = '';

	pushState(`` + '/some/path', {});
	pushState('' + '/some/path', {});
	pushState(`${''}/some/path`, {});
	pushState(empty + '/some/path', {});
</script>
