<script lang="ts">
	let isChecked = $state(false);

	let type = $state('checkbox');
</script>

<!-- dynamic type assignments are not supported by this rule -->
<input {type} bind:value={isChecked} />
