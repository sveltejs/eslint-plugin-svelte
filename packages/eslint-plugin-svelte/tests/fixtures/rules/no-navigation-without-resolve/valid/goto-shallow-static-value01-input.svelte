<script>
	import { goto } from '$app/navigation';

	let unknown;
	const key = 'shallow';
	const yes = true;

	goto('', { [key]: true });
	goto('', { ['shallow']: true });
	goto('', { 'shallow': true });
	goto('', { shallow: yes });
	goto('', { [unknown]: false, shallow: true });
	goto('', { shallow: true, ['state']: {} });
</script>
