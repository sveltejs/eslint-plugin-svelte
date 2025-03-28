<script>
	import { readable, writable } from 'svelte/store';

	readable(false, function (set) {});
	readable(false, (set) => function () {});

	writable(false, (set) => function () {});
	writable(false, (set) => function () {});
</script>
