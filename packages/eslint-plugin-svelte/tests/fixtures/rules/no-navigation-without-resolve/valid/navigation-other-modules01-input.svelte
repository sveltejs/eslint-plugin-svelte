<script>
	import { goto } from './navigation';
	import { redirect } from '@sveltejs/kit';

	goto('/foo');

	export function load() {
		redirect(303, '/login');
	}
</script>
