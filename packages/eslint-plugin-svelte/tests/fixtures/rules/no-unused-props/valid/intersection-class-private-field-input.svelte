<script lang="ts" module>
	export class Foo<T> {
		#value: T;
		constructor(value: T) {
			this.#value = value;
		}
		get value() {
			return this.#value;
		}
	}
</script>

<script lang="ts">
	interface Props {
		a: Foo<string> & { extra: number };
	}
	let { a }: Props = $props();
</script>

<p>{a.value} {a.extra}</p>
