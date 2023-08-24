<script>
	import { readable, writable } from 'svelte/store';

	readable(false, () => true);
	readable(false, (foo) => true);

	writable(false, () => true);
	writable(false, (foo) => true);
</script>
