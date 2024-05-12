<script>
	import MyComponent from './MyComponent.svelte';
	import { writable } from 'svelte/store';
	let store = writable('hello');
	let component = writable(MyComponent);
</script>

<svelte:component this={$component} prop="Hello {$store}" />
<svelte:component this={$component} bind:this={$store} />
<svelte:component this={$component} --my-style-var={$store} />
<svelte:component this={$component} {...$store} />
