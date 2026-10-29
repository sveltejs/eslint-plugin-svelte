<script>
	import { goto } from '$app/navigation';

	const section = 'section';
	const value = '#section';

	goto('#');
	goto('#section');
	goto('#' + 'section');
	goto('#' + section);
	goto(`#${section}`);
	goto(value);
</script>
