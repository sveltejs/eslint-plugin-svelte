<script>
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';

	let { condition } = $props();

	goto(condition ? resolve('/foo') : '');
	goto(condition ? '' : resolve('/foo'));
	goto(condition ? '' : '');
</script>
