<script lang="ts">
	interface Props {
		_internal: string;
		$store: boolean;
		'@decorator': string;
		'#private': number;
		'~tilde': boolean;
		normalUsed: string;
	}

	const { normalUsed }: Props = $props();
	console.log(normalUsed);
</script>
