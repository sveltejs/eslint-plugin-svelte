<script>
	import { readable, writable } from 'svelte/store';

	readable(false, function () {});
	readable(false, (foo) => function () {});

	writable(false, () => function () {});
	writable(false, (foo) => function () {});
</script>
