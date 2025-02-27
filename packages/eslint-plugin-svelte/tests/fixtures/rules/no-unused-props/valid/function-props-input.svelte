<script lang="ts">
	interface Props {
		onClick: (event: MouseEvent) => void;
		transform: <T>(value: T) => string;
		async: () => Promise<void>;
	}

	const props: Props = $props();
	props.onClick(new MouseEvent('click'));
	const result = props.transform(42);
	await props.async();
</script>
