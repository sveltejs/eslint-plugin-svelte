<script lang="ts">
	interface Props {
		name: string;
		age: number;
	}
	let props: Props = $props();
	console.log(props.name, props.age);
</script>
