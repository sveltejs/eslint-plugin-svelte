<script lang="ts">
	interface Props {
		name: string;
		age: number;
		role: string;
		[key: string]: string | number;
	}
	let { name, age }: Props = $props();
	console.log(name, age);
</script>
