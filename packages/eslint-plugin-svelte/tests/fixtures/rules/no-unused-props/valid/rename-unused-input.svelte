<script lang="ts">
	interface Props {
		name: string;
		age: number;
		role: string;
	}
	// userRole is unused but it should be reported by @typescript-eslint/no-unused-vars rule.
	let { name: userName, age: userAge, role: userRole }: Props = $props();
	console.log(userName, userAge);
</script>
