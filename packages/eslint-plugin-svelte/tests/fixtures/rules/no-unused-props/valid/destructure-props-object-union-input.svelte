<script lang="ts">
	type Props = {
		disabled?: boolean;
		label: string;
	};
	type LinkProps = Props & { as: 'link'; href: string };
	type ButtonProps = Props & { as: 'button'; onClick: () => void };

	const props: LinkProps | ButtonProps = $props();
	const { disabled, label } = props;
</script>

{#if props.as === 'link'}
	<a href={props.href} aria-disabled={disabled}>{label}</a>
{:else}
	<button onclick={() => !disabled && props.onClick()}>{label}</button>
{/if}
