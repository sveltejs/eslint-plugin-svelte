<script>
	import { readable, writable } from 'svelte/store';

	readable(false, () => true);
	readable(false, (foo) => true);

	writable(false, () => true);
	writable(false, (foo) => true);

	readable(false, (foo) => {
		foo;
		insideACallback(() => {
			foo;
		});
		conflictingName(() => {
			const foo = 303;
			foo;
		});
	});

	readable(false, () => {
		const set = 303;
	});
</script>
