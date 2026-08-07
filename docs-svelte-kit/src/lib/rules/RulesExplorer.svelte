<script>
	import { resolve } from '$app/paths';
	import { ruleCatalog, ruleCategories } from '../utils.js';

	let query = '';
	let selectedCategory = 'All categories';
	let recommendedOnly = false;

	$: normalizedQuery = query.trim().toLowerCase();
	$: filteredRules = ruleCatalog.filter((rule) => {
		if (selectedCategory !== 'All categories' && rule.category !== selectedCategory) return false;
		if (recommendedOnly && !rule.recommended) return false;
		if (!normalizedQuery) return true;
		const searchableText = `${rule.title} ${rule.description} ${rule.category}`.toLowerCase();
		return normalizedQuery.split(/\s+/u).every((term) => searchableText.includes(term));
	});
	$: groups = ruleCategories
		.map((category) => ({
			category,
			rules: filteredRules.filter((rule) => rule.category === category)
		}))
		.filter((group) => group.rules.length);
</script>

<svelte:head>
	<title>Available Rules | eslint-plugin-svelte</title>
	<meta
		name="description"
		content="Browse and filter every lint rule available in eslint-plugin-svelte."
	/>
</svelte:head>

<div class="catalog-intro">
	<p class="eyebrow">Rule reference</p>
	<h1>Available Rules</h1>
	<p>
		Explore {ruleCatalog.length} rules for catching errors, enforcing best practices, and keeping Svelte
		code consistent.
	</p>
</div>

<div class="catalog-controls" aria-label="Filter rules">
	<label class="rule-search">
		<span class="visually-hidden">Search rules</span>
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<circle cx="11" cy="11" r="7"></circle>
			<path d="m20 20-4-4"></path>
		</svg>
		<input bind:value={query} type="search" placeholder="Search by rule name or description…" />
	</label>

	<label class="category-select">
		<span class="visually-hidden">Filter by category</span>
		<select bind:value={selectedCategory}>
			<option>All categories</option>
			{#each ruleCategories as category (category)}
				<option>{category}</option>
			{/each}
		</select>
		<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m6 8 4 4 4-4"></path></svg>
	</label>

	<button
		type="button"
		class:active={recommendedOnly}
		aria-pressed={recommendedOnly}
		on:click={() => (recommendedOnly = !recommendedOnly)}
	>
		<svg viewBox="0 0 20 20" aria-hidden="true"
			><path
				d="m10 2.5 2.2 4.45 4.9.72-3.55 3.46.84 4.87L10 13.7 5.61 16l.84-4.87L2.9 7.67l4.9-.72Z"
			></path></svg
		>
		Recommended
	</button>
</div>

<div class="catalog-summary" aria-live="polite">
	<span>{filteredRules.length} {filteredRules.length === 1 ? 'rule' : 'rules'}</span>
	{#if query || selectedCategory !== 'All categories' || recommendedOnly}
		<button
			type="button"
			on:click={() => {
				query = '';
				selectedCategory = 'All categories';
				recommendedOnly = false;
			}}>Clear filters</button
		>
	{/if}
</div>

{#if groups.length}
	<div class="rule-groups">
		{#each groups as group (group.category)}
			<section class="rule-group">
				<header>
					<h2>{group.category}</h2>
					<span>{group.rules.length}</span>
				</header>
				<div class="rule-list">
					{#each group.rules as rule (rule.path)}
						<a href={resolve(rule.path)}>
							<span class="rule-content">
								<code>{rule.title}</code>
								<span class="description">{rule.description}</span>
							</span>
							<span class="badges">
								{#if rule.recommended}<span class="badge recommended">Recommended</span>{/if}
								{#if rule.base}<span class="badge">Base</span>{/if}
								{#if rule.fixable}<span class="badge fixable">Fixable</span>{/if}
								{#if rule.hasSuggestions}<span class="badge suggestion">Suggestions</span>{/if}
							</span>
							<svg class="row-chevron" viewBox="0 0 20 20" aria-hidden="true"
								><path d="m8 5 5 5-5 5"></path></svg
							>
						</a>
					{/each}
				</div>
			</section>
		{/each}
	</div>
{:else}
	<div class="empty-rules">
		<strong>No matching rules</strong>
		<p>Try a different rule name, description, or category.</p>
		<button
			type="button"
			on:click={() => {
				query = '';
				selectedCategory = 'All categories';
				recommendedOnly = false;
			}}>Clear filters</button
		>
	</div>
{/if}

<style>
	.catalog-intro {
		max-width: 43rem;
	}

	.eyebrow {
		margin: 0 0 0.6rem;
		color: var(--accent);
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.09em;
		text-transform: uppercase;
	}

	.catalog-intro h1 {
		margin-bottom: 0.9rem;
	}

	.catalog-intro > p:last-child {
		margin: 0;
		font-size: 1rem;
	}

	.catalog-controls {
		display: grid;
		grid-template-columns: minmax(16rem, 1fr) 13rem auto;
		gap: 0.65rem;
		margin-top: 2rem;
		padding: 0.75rem;
		border: 1px solid var(--border);
		border-radius: 11px;
		background: var(--surface-muted);
	}

	.rule-search,
	.category-select,
	.catalog-controls > button {
		display: flex;
		height: 2.55rem;
		align-items: center;
		gap: 0.55rem;
		padding: 0 0.75rem;
		border: 1px solid var(--border-strong);
		border-radius: 7px;
		background: var(--surface);
		color: var(--text-muted);
	}

	.rule-search:focus-within,
	.category-select:focus-within {
		border-color: var(--accent);
		box-shadow: 0 0 0 2px var(--accent-soft);
	}

	.rule-search svg,
	.category-select svg,
	.catalog-controls > button svg,
	.row-chevron {
		width: 1rem;
		flex: 0 0 auto;
		fill: none;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 1.7;
	}

	.rule-search input,
	.category-select select {
		width: 100%;
		min-width: 0;
		border: 0;
		outline: 0;
		background: transparent;
		color: var(--text);
		font-size: 0.78rem;
	}

	.rule-search input::placeholder {
		color: var(--text-faint);
	}

	.category-select {
		position: relative;
		padding-right: 0.55rem;
	}

	.category-select select {
		appearance: none;
		cursor: pointer;
	}

	.catalog-controls > button {
		justify-content: center;
		font-size: 0.72rem;
		font-weight: 600;
	}

	.catalog-controls > button:hover,
	.catalog-controls > button.active {
		border-color: color-mix(in srgb, var(--accent) 40%, var(--border));
		background: var(--accent-soft);
		color: var(--accent-strong);
	}

	.catalog-controls > button svg {
		fill: none;
	}

	.catalog-controls > button.active svg {
		fill: currentColor;
	}

	.catalog-summary {
		display: flex;
		min-height: 2.9rem;
		align-items: center;
		justify-content: space-between;
		padding: 0 0.15rem;
		color: var(--text-faint);
		font-size: 0.7rem;
		font-weight: 600;
	}

	.catalog-summary button,
	.empty-rules button {
		color: var(--accent-strong);
		font-size: 0.7rem;
		font-weight: 600;
	}

	.rule-groups {
		display: flex;
		flex-direction: column;
		gap: 2.25rem;
	}

	.rule-group > header {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin-bottom: 0.7rem;
	}

	.rule-group h2 {
		margin: 0;
		padding: 0;
		border: 0;
		font-size: 1rem;
		letter-spacing: -0.015em;
	}

	.rule-group > header > span {
		display: grid;
		min-width: 1.3rem;
		height: 1.3rem;
		place-items: center;
		padding: 0 0.28rem;
		border: 1px solid var(--border);
		border-radius: 999px;
		color: var(--text-faint);
		font-size: 0.62rem;
	}

	.rule-list {
		overflow: hidden;
		border: 1px solid var(--border);
		border-radius: 10px;
		background: var(--surface);
	}

	.rule-list > a {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto 1rem;
		align-items: center;
		gap: 1rem;
		padding: 0.85rem 1rem;
		border-bottom: 1px solid var(--border);
		color: inherit;
		text-decoration: none;
		transition: background 120ms ease;
	}

	.rule-list > a:last-child {
		border-bottom: 0;
	}

	.rule-list > a:hover {
		background: var(--surface-muted);
	}

	.rule-content {
		display: flex;
		min-width: 0;
		flex: 1;
		flex-direction: column;
		gap: 0.28rem;
	}

	.rule-content code {
		padding: 0;
		border: 0;
		background: transparent;
		color: var(--text);
		font: 500 0.76rem/1.45 var(--font-mono);
	}

	.badges {
		display: flex;
		max-width: 12rem;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: 0.3rem;
	}

	.badge {
		padding: 0.08rem 0.32rem;
		border: 1px solid var(--border);
		border-radius: 4px;
		color: var(--text-faint);
		font-size: 0.56rem;
		font-weight: 600;
		letter-spacing: 0.025em;
		line-height: 1.4;
		text-transform: uppercase;
	}

	.badge.recommended {
		border-color: color-mix(in srgb, var(--accent) 30%, var(--border));
		background: var(--accent-soft);
		color: var(--accent-strong);
	}

	.badge.fixable {
		border-color: var(--fixable-border);
		background: var(--fixable-soft);
		color: var(--fixable-text);
	}

	.badge.suggestion {
		border-color: var(--suggestion-border);
		background: var(--suggestion-soft);
		color: var(--suggestion-text);
	}

	.description {
		color: var(--text-muted);
		font-size: 0.72rem;
		line-height: 1.55;
	}

	.row-chevron {
		color: var(--text-faint);
		transition:
			color 120ms ease,
			transform 120ms ease;
	}

	.rule-list > a:hover .row-chevron {
		color: var(--accent);
		transform: translateX(2px);
	}

	.empty-rules {
		display: flex;
		min-height: 16rem;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		gap: 0.4rem;
		border: 1px dashed var(--border-strong);
		border-radius: 10px;
		background: var(--surface-muted);
		text-align: center;
	}

	.empty-rules strong {
		font-size: 0.9rem;
	}

	.empty-rules p {
		margin: 0 0 0.5rem;
		font-size: 0.76rem;
	}

	@media (max-width: 760px) {
		.catalog-controls {
			grid-template-columns: 1fr 1fr;
		}

		.rule-search {
			grid-column: 1 / -1;
		}
	}

	@media (max-width: 520px) {
		.catalog-controls {
			grid-template-columns: 1fr;
		}

		.rule-search {
			grid-column: auto;
		}

		.rule-list > a {
			grid-template-columns: minmax(0, 1fr) auto 0.8rem;
			gap: 0.6rem;
			padding: 0.8rem;
		}

		.badges {
			max-width: 6.5rem;
			align-items: flex-end;
			flex-direction: column;
		}
	}
</style>
