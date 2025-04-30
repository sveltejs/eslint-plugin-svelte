<script lang="ts">
	import { onMount } from 'svelte'

	let MyComponent: typeof import('./MyComponent.svelte').default | undefined
	onMount(() => {
		import('./MyComponent.svelte').then((component) => {
			MyComponent = component.default
		})
	})
</script>

{#if MyComponent}
	<!-- svelte-ignore reactive-component -->
	<MyComponent />
{/if}
