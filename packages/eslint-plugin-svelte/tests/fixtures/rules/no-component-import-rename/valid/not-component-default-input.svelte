<script>
	import Foo from './Bar.js';
	import Baz from './Qux';
	import counter from './Counter.svelte.js';
	import createStore from './store.svelte.ts';
	import Raw from './Raw.svelte?raw';
	import * as Namespace from './Other.svelte';
	import { count, increment as add } from './Counter.svelte';
	import './Side.svelte';

	const Lazy = import('./Lazy.svelte');
</script>
