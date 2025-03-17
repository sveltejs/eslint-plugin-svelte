<script lang="ts">
	interface InternalConfig {
		secretKey: string;
		debugMode: boolean;
	}
	interface Props {
		config: InternalConfig;
		value: number;
	}
	let { config, value }: Props = $props();
	console.log(value, config);
</script>
