<script lang="ts">
	interface ConditionalProps {
		name: string;
	}
	interface Props {
		age: number;
	}
	type AllProps = ConditionalProps extends { name: string } ? Props : never;
	let { age }: AllProps = $props();
	console.log(age);
</script>
