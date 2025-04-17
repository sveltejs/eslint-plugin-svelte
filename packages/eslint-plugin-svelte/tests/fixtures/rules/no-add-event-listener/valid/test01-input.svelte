<script>
	import { on } from 'svelte/events';

	const handler = (ev) => {
		console.log(ev);
	};

	function onClick(event) {
		const target = event.currentTarget;

		on(target, 'focus', handler);
	}

	on(window, 'message', handler);
	on(document, 'visibilitychange', handler);

</script>

<button onclick={onClick}>Hello</button>
