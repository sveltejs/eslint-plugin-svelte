<script lang="ts">
	type Props = {
		user: { a: { name: string; age: number }; b: { name: string } };
		z: string;
	};
	let { user }: Props = $props();
	const k = 'a' as 'a' | 'b';
	const v = user[k].name;
</script>

<p>{v}</p>
