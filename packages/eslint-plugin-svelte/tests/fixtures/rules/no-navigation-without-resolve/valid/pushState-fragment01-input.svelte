<script>
	import { pushState } from '$app/navigation';

	const section = 'section';
	const value = '#section';

	pushState('#', {});
	pushState('#section', {});
	pushState('#' + 'section', {});
	pushState('#' + section, {});
	pushState(`#${section}`, {});
	pushState(value, {});
</script>
