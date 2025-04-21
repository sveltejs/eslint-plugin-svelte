<script lang="ts">
	const handler = (ev: Event) => {
		console.log(ev);
	};

	(window as any).addEventListener('message', handler);
	(window.addEventListener as any)('message', handler);
</script>

<div>Hello</div>
