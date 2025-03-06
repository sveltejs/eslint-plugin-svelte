<script lang="ts">
	interface Props {
		name: string;
		age: number;
	}
	let { name }: Props = $props();
	console.log(name);
</script>
