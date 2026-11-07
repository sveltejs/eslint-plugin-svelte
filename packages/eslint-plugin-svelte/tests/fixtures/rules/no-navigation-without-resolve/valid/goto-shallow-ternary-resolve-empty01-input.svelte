<script>
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';

	const condition = true;

	goto(condition ? resolve('/foo') : '', { shallow: true });
	goto(condition ? '' : resolve('/foo'), { shallow: true });
	goto(condition ? '' : '', { shallow: true });
	const url = condition ? resolve('/foo') : '';
	goto(url, { shallow: true });
	const resolved = resolve('/foo');
	goto(condition ? resolved : '', { shallow: true });
</script>
