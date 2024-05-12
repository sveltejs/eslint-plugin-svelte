<script>
	/* eslint no-console: 0 -- test */
	let value = 'Hello World';
</script>

<input
	on:input={() => console.log('Old value:', value)}
	bind:value
	on:input={() => console.log('New value:', value)}
/>
<input on:input={() => console.log('Old value:', value)} bind:value />
<input bind:value on:input={() => console.log('New value:', value)} />
