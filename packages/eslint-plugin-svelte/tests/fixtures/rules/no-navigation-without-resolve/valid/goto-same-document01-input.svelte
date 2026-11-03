<script>
	import { goto, pushState, replaceState, preloadData } from '$app/navigation';

	goto('');
	goto('', { shallow: true, state: { modal: true } });
	goto('?page=2');
	goto('#top');
	pushState('', { modal: true });
	pushState('#top', {});
	replaceState('?tab=info', {});
	preloadData('?page=2');
</script>
