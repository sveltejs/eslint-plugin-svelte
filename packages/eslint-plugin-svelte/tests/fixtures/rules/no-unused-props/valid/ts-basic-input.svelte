<script lang="ts">
	// fix: https://github.com/sveltejs/eslint-plugin-svelte/issues/1028#issuecomment-2728101827
	type Prop = {
		value: string;
		value2: string;
	};

	interface Props {
		myObjectProp: Prop;
	}

	const { myObjectProp }: Props = $props();
</script>

<p>{myObjectProp.value} {myObjectProp.value2}</p>
