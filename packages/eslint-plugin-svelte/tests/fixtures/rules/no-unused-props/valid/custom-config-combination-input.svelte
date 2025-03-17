<script lang="ts">
	import type { BaseProps, FooDTO } from './shared-types';
	interface Props {
		base: BaseProps;
		my_foo: FooDTO;
		_my_bar: string;
		baz: string;
	}
	let { base, my_foo }: Props = $props();
	console.log(base.age, my_foo.foo, my_foo.bar);
</script>
