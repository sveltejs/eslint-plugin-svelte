<script>
	import MyComponent from './MyComponent.svelte';
	import { writable } from 'svelte/store';
	let store = writable('hello');
</script>

<MyComponent prop={store} />
<MyComponent {store} />
<MyComponent bind:value={store} />
<MyComponent bind:store />
<MyComponent bind:this={$store} />
<MyComponent --my-style-var={$store} />
