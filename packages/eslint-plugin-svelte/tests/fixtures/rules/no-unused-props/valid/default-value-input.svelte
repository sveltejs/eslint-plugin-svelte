<script lang="ts">
	interface Props {
		newTaskAttributes: { attribute: number; attribute2: string };
	}

	const { newTaskAttributes = { attribute: 0, attribute2: '' } }: Props = $props();
</script>

<div class="col-span-full">
	<div>
		{newTaskAttributes.attribute}
		{newTaskAttributes.attribute2}
	</div>
</div>
