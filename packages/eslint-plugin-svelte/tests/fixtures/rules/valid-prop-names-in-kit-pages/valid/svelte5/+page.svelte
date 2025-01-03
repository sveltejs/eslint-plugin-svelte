<script>
	let { data, errors, form } = $props();

	let comment = '';

	export const snapshot = {
		capture: () => comment,
		restore: (value) => (comment = value)
	};
</script>

{data}, {errors}

{#if form?.success}
	<p>Successfully logged in! Welcome back, {data.user.name}</p>
{/if}

<form method="POST">
	<textarea bind:value={comment} />
	<button>Post comment</button>
</form>
