<script>
	import { replaceState } from '$app/navigation';

	const section = 'section';
	const value = '#section';

	replaceState('#', {});
	replaceState('#section', {});
	replaceState('#' + 'section', {});
	replaceState('#' + section, {});
	replaceState(`#${section}`, {});
	replaceState(value, {});
</script>
