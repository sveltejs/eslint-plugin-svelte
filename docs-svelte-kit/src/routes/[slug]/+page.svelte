<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
</script>

<section data-rule-page>
	{@html data.content.html}
</section>

<style global>
	section[data-rule-page] > h1 {
		display: flex;
		justify-content: center;
	}

	section[data-rule-page] > h1 > a,
	h2 > a,
	h3 > a,
	h4 > a,
	h5 > a,
	h6 > a {
		content: '#';
		color: var(--accent-color);
		margin-right: 8px;
	}

	section[data-rule-page] td:nth-child(3) {
		width: 42px;
		text-align: right;
	}
</style>
