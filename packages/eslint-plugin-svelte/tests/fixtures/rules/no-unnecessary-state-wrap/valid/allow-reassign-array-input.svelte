<script>
	import { SvelteSet as AliasSet } from 'svelte/reactivity';
	import { CustomReactiveClass } from './custom';

	// Classes listed in allowReassign are allowed when reassigned
	// (the original export name is used even with an import alias)
	let set = $state(new AliasSet());
	set = new AliasSet([1, 2, 3]);

	let custom = $state(new CustomReactiveClass());
	custom = new CustomReactiveClass();
</script>
