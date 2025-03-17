<script lang="ts">
	import type { BaseProps, FooDTO } from './shared-types';
	interface Props {
		base: BaseProps;
		my_foo: FooDTO;
		_my_bar: string;
		baz: string;
		qux: string;
	}
	let { my_foo }: Props = $props();
	console.log(my_foo.foo);
</script>
