<script lang="ts">
	interface Props {
		name: string;
		age: number;
		[key: string]: string | number | boolean;
		[index: number]: string | number;
	}
	let { name, ...rest }: Props = $props();
	console.log(name);
</script>
