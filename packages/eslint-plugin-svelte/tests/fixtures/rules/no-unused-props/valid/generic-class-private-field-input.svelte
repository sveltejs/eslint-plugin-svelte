<script lang="ts" module>
	export class FooController<T = unknown> {
		#foo: T;

		constructor(foo: T) {
			this.#foo = foo;
		}

		get foo() {
			return this.#foo;
		}
	}
</script>

<script lang="ts">
	interface Props {
		ctrl: FooController;
	}
	let { ctrl }: Props = $props();

	void ctrl.foo;
</script>
