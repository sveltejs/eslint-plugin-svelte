<script>
	import MyComponent from './MyComponent.svelte';
	let color = 'red';
</script>

<MyComponent --b={color} --a={color} />
