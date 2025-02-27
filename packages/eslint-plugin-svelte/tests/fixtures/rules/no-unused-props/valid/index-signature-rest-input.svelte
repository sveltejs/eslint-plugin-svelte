<script lang="ts">
	interface Props {
		name: string;
		age: number;
		[key: string]: string | number | boolean;
	}
	let { name, age, ...rest }: Props = $props();
	console.log(name, age, rest.isAdmin, rest.role);
</script>
