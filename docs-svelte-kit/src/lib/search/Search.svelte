<script>
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { tick } from 'svelte';
	import { searchItems } from '../utils.js';

	export let open = false;

	let query = '';
	let selectedIndex = 0;
	let input;

	$: results = getResults(query);
	$: if (selectedIndex >= results.length) selectedIndex = Math.max(0, results.length - 1);
	$: if (open) focusSearch();

	async function focusSearch() {
		await tick();
		input?.focus();
	}

	function getResults(value) {
		const normalized = value.trim().toLowerCase();
		if (!normalized) return searchItems.slice(0, 8);

		const terms = normalized.split(/\s+/u);
		return searchItems
			.map((item) => {
				const title = item.title.toLowerCase();
				const section = item.section.toLowerCase();
				const description = item.description.toLowerCase();
				const haystack = `${title} ${section} ${description} ${item.keywords}`.toLowerCase();
				if (!terms.every((term) => haystack.includes(term))) return null;

				let score = terms.reduce((total, term) => {
					if (title === term) return total + 120;
					if (title.startsWith(term)) return total + 80;
					if (title.includes(term)) return total + 50;
					if (section.includes(term)) return total + 25;
					return total + 10;
				}, 0);
				if (item.section === 'Documentation') score += 2;
				return { ...item, score };
			})
			.filter(Boolean)
			.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
			.slice(0, 10);
	}

	function close() {
		open = false;
		query = '';
		selectedIndex = 0;
	}

	function handleWindowKeydown(event) {
		const target = /** @type {HTMLElement} */ (event.target);
		const isTyping =
			['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName) || target?.isContentEditable;

		if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
			event.preventDefault();
			if (open) {
				close();
			} else {
				open = true;
			}
			return;
		}
		if (!open && event.key === '/' && !isTyping) {
			event.preventDefault();
			open = true;
			return;
		}
		if (!open) return;

		if (event.key === 'Escape') {
			event.preventDefault();
			close();
		} else if (event.key === 'ArrowDown') {
			event.preventDefault();
			selectedIndex = Math.min(selectedIndex + 1, results.length - 1);
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			selectedIndex = Math.max(selectedIndex - 1, 0);
		} else if (event.key === 'Enter' && results[selectedIndex]) {
			event.preventDefault();
			selectResult(results[selectedIndex]);
		}
	}

	function handleInput() {
		selectedIndex = 0;
	}

	async function selectResult(item) {
		close();
		await goto(resolve(item.path));
	}

	function handleBackdropClick(event) {
		if (event.target === event.currentTarget) close();
	}
</script>

<svelte:window on:keydown={handleWindowKeydown} />

{#if open}
	<div class="search-backdrop" on:click={handleBackdropClick} role="presentation">
		<div class="search-dialog" role="dialog" aria-modal="true" aria-label="Search documentation">
			<div class="search-input-wrap">
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<circle cx="11" cy="11" r="7"></circle>
					<path d="m20 20-4-4"></path>
				</svg>
				<input
					bind:this={input}
					bind:value={query}
					on:input={handleInput}
					placeholder="Search guides and rules…"
					aria-label="Search documentation"
					aria-controls="search-results"
					autocomplete="off"
					spellcheck="false"
				/>
				<kbd>ESC</kbd>
			</div>

			<div class="search-results" id="search-results" role="listbox" aria-label="Search results">
				{#if results.length}
					<p class="results-label">{query ? `${results.length} results` : 'Quick links'}</p>
					{#each results as item, index (item.path)}
						<button
							type="button"
							class:selected={index === selectedIndex}
							role="option"
							aria-selected={index === selectedIndex}
							on:mouseenter={() => (selectedIndex = index)}
							on:click={() => selectResult(item)}
						>
							<span class="result-icon" aria-hidden="true">
								{#if item.section === 'Documentation'}
									<svg viewBox="0 0 24 24"
										><path d="M6 3h9l3 3v15H6z"></path><path d="M14 3v4h4M9 12h6M9 16h6"
										></path></svg
									>
								{:else}
									<svg viewBox="0 0 24 24"
										><path d="m8 9-3 3 3 3M16 9l3 3-3 3M14 5l-4 14"></path></svg
									>
								{/if}
							</span>
							<span class="result-content">
								<strong>{item.title}</strong>
								<span>{item.description}</span>
							</span>
							<span class="result-section">{item.section}</span>
							<svg class="arrow" viewBox="0 0 20 20" aria-hidden="true"
								><path d="m7 4 6 6-6 6"></path></svg
							>
						</button>
					{/each}
				{:else}
					<div class="empty-state">
						<svg viewBox="0 0 24 24" aria-hidden="true"
							><circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path></svg
						>
						<strong>No results for “{query}”</strong>
						<span>Try a rule name, category, or configuration term.</span>
					</div>
				{/if}
			</div>

			<footer>
				<span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
				<span><kbd>↵</kbd> open</span>
				<span><kbd>esc</kbd> close</span>
			</footer>
		</div>
	</div>
{/if}

<style>
	.search-backdrop {
		position: fixed;
		inset: 0;
		z-index: 1000;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding: min(14vh, 8rem) 1rem 1rem;
		background: rgb(16 18 27 / 0.54);
		backdrop-filter: blur(6px);
		animation: fade-in 120ms ease-out;
	}

	.search-dialog {
		width: min(42rem, 100%);
		max-height: min(42rem, calc(100vh - 2rem));
		overflow: hidden;
		border: 1px solid var(--border-strong);
		border-radius: 14px;
		background: var(--surface);
		box-shadow:
			0 24px 80px rgb(15 23 42 / 0.3),
			0 2px 8px rgb(15 23 42 / 0.12);
		animation: dialog-in 150ms ease-out;
	}

	.search-input-wrap {
		position: relative;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0 1rem;
	}

	.search-input-wrap::after {
		position: absolute;
		right: 0;
		bottom: 0;
		left: 0;
		height: 1px;
		background: var(--border);
		content: '';
		pointer-events: none;
	}

	.search-input-wrap svg {
		width: 1.25rem;
		color: var(--accent);
		fill: none;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 1.8;
	}

	input {
		min-width: 0;
		flex: 1;
		border: 0;
		outline: 0;
		padding: 1.1rem 0;
		background: transparent;
		color: var(--text);
		font-size: 1rem;
	}

	input::placeholder {
		color: var(--text-faint);
	}

	kbd {
		padding: 0.15rem 0.35rem;
		border: 1px solid var(--border-strong);
		border-radius: 5px;
		background: var(--surface-muted);
		box-shadow: 0 1px 0 var(--border-strong);
		color: var(--text-muted);
		font: 600 0.65rem/1.2 var(--font-sans);
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.search-results {
		max-height: min(31rem, calc(100vh - 13rem));
		overflow-x: hidden;
		overflow-y: auto;
		padding: 0.5rem;
	}

	.results-label {
		margin: 0;
		padding: 0.45rem 0.55rem 0.35rem;
		color: var(--text-faint);
		font-size: 0.7rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.search-results button {
		box-sizing: border-box;
		display: grid;
		grid-template-columns: 2.15rem minmax(0, 1fr) minmax(7rem, auto) 1.25rem;
		width: 100%;
		align-items: center;
		gap: 0.75rem;
		padding: 0.7rem 1.75rem 0.7rem 0.7rem;
		border-radius: 9px;
		color: var(--text);
		text-align: left;
	}

	.search-results button.selected {
		background: var(--accent-soft);
	}

	.result-icon {
		display: grid;
		width: 2.15rem;
		height: 2.15rem;
		flex: 0 0 auto;
		place-items: center;
		border: 1px solid var(--border);
		border-radius: 7px;
		background: var(--surface);
		color: var(--text-muted);
	}

	.result-icon svg,
	.empty-state svg {
		width: 1.1rem;
		fill: none;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 1.7;
	}

	.result-content {
		display: flex;
		min-width: 0;
		flex: 1;
		flex-direction: column;
		gap: 0.1rem;
	}

	.result-content strong {
		overflow: hidden;
		font-family: var(--font-mono);
		font-size: 0.83rem;
		font-weight: 500;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.result-content span {
		overflow: hidden;
		color: var(--text-muted);
		font-size: 0.76rem;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.result-section {
		min-width: 0;
		max-width: 8rem;
		overflow: hidden;
		color: var(--text-faint);
		font-size: 0.68rem;
		font-weight: 550;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.arrow {
		width: 0.9rem;
		justify-self: center;
		fill: none;
		stroke: var(--accent);
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 1.7;
		opacity: 0;
	}

	.selected .arrow {
		opacity: 1;
	}

	.empty-state {
		display: flex;
		min-height: 13rem;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		gap: 0.5rem;
		color: var(--text-muted);
		text-align: center;
	}

	.empty-state svg {
		width: 1.8rem;
		margin-bottom: 0.25rem;
		color: var(--text-faint);
	}

	.empty-state strong {
		color: var(--text);
		font-size: 0.9rem;
	}

	.empty-state span {
		font-size: 0.78rem;
	}

	footer {
		display: flex;
		gap: 1rem;
		padding: 0.65rem 1rem;
		border-top: 1px solid var(--border);
		background: var(--surface-muted);
		color: var(--text-faint);
		font-size: 0.68rem;
	}

	footer span {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	@keyframes fade-in {
		from {
			opacity: 0;
		}
	}

	@keyframes dialog-in {
		from {
			opacity: 0;
			transform: translateY(-8px) scale(0.985);
		}
	}

	@media (max-width: 560px) {
		.search-backdrop {
			padding: 0.5rem;
		}
		.search-dialog {
			max-height: calc(100vh - 1rem);
			border-radius: 11px;
		}
		.result-section {
			display: none;
		}
		.search-results button {
			grid-template-columns: 2.15rem minmax(0, 1fr) 1.25rem;
			padding-right: 0.85rem;
		}
		.arrow {
			grid-column: 3;
		}
		.search-results {
			max-height: calc(100vh - 8rem);
		}
		footer {
			display: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.search-backdrop,
		.search-dialog {
			animation: none;
		}
	}
</style>
