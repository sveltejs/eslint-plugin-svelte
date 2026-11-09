<script>
	import { source, list, Item } from './source.js';

	let other = 1;
	const fromCall = source();
	const fromOther = other;

	let called = $derived(source());
	let read = $derived(source.value);
	let spread = $derived([...list]);
	let spreadObject = $derived({ ...source });
	let hasKey = $derived('key' in source);
	let created = $derived(new Item());
	let tagged = $derived(source`text`);
	let awaited = $derived(await source);
	let optional = $derived(source?.value);
	let unknown = $derived(notDefined);
	let global = $derived(window);
	let local = $derived(other);
	let fromCallConst = $derived(fromCall);
	let fromOtherConst = $derived(fromOther);
	let byFunction = $derived.by(() => 0);
	let noArgument = $derived();
	let spreadArgument = $derived(...list);
</script>

{called}{read}{spread}{spreadObject}{hasKey}{created}{tagged}{awaited}{optional}{unknown}{global}
{local}{fromCallConst}{fromOtherConst}{byFunction}{noArgument}{spreadArgument}
