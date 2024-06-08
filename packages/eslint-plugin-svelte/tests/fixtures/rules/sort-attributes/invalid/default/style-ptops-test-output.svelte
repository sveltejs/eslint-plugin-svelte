<script>
	import MyComponent from './MyComponent.svelte';
	let color = 'red';
</script>

<MyComponent --a={color} --b={color} />
