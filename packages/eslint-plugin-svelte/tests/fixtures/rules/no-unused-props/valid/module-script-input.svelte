<script module lang="ts">
	interface Props {
		name: string;
		age: number;
	}
</script>

<script lang="ts">
	let { name, age }: Props = $props();
	console.log(name, age);
</script>
