<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch1 = createEventDispatcher<{ one: never; two: number }>();
	const dispatch2 = createEventDispatcher<Record<string, never>>();
	const dispatch3 = createEventDispatcher<any>();
	const dispatch4 = createEventDispatcher<unknown>();
</script>
