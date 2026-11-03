<script lang="ts" module>
	export class Store<T> {
		value!: T;
		extra!: T;
	}
</script>

<script lang="ts">
	interface Props {
		s: Store<string>;
	}
	let { s }: Props = $props();
</script>

<p>{s.value}</p>
