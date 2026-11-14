<script>
	import { goto } from '$app/navigation';

	let unknown;
	const notShallow = { state: {} };
	const explicitlyNotShallow = { shallow: false };
	const overridden = { shallow: true, ...explicitlyNotShallow };
	const overriddenByUnknown = { shallow: true, ...unknown };
	const shallowOpts = { shallow: true };

	goto('', notShallow);
	goto('', overridden);
	goto('', overriddenByUnknown);
	goto('', unknown);
	goto('/foo', shallowOpts);
</script>
