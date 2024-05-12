<script>
	import MyComponent from './MyComponent.svelte';
	import { writable } from 'svelte/store';
	let store = writable('hello');
</script>

<MyComponent prop="Hello {store}" />
<MyComponent bind:this={store} />
<MyComponent --my-style-var={store} />
<MyComponent {...store} />
