<script>
	import { goto } from '$app/navigation';

	let unknown;
	const key = 'shallow';
	const no = false;

	goto('', { shallow: true, [key]: false });
	goto('', { shallow: true, ['shallow']: false });
	goto('', { shallow: true, [unknown]: false });
	goto('', { shallow: no });
</script>
