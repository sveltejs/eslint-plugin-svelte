<script lang="ts">
	interface Props {
		title: string;
		description: string;
		items: string[];
	}
	let props: Props = $props();
</script>

<h1>{props.title}</h1>
<p>{props.description}</p>
<ul>
	{#each props.items as item}
		<li>{item}</li>
	{/each}
</ul>
