<script>
	import { createEventDispatcher } from 'svelte';
	import { page } from '$app/stores';
	import { resolve } from '$app/paths';
	import { isActive, stripBaseUrl } from '../utils.js';
	import Search from '../search/Search.svelte';
	import ThemeToggle from '../theme/ThemeToggle.svelte';
	import logo from './logo.svg';

	export let sidebarOpen = false;

	const dispatch = createEventDispatcher();
	let searchOpen = false;
</script>

<header>
	<div class="header-inner">
		<button
			type="button"
			class="menu-button"
			class:open={sidebarOpen}
			on:click={() => dispatch('toggleSidebarOpen')}
			aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
			aria-expanded={sidebarOpen}
		>
			<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"></path></svg>
		</button>

		<a href={resolve('/')} class="brand" aria-label="eslint-plugin-svelte home">
			<img src={logo} alt="" />
			<span>eslint-plugin-svelte</span>
		</a>

		<button
			type="button"
			class="search-button"
			on:click={() => (searchOpen = true)}
			aria-label="Search documentation"
			aria-keyshortcuts="Meta+K Control+K"
		>
			<svg viewBox="0 0 24 24" aria-hidden="true"
				><circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path></svg
			>
			<span>Search documentation…</span>
			<kbd><span>⌘</span>K</kbd>
		</button>

		<nav aria-label="Main navigation">
			<a class:active={isActive('/user-guide/', $page)} href={resolve('/user-guide/')}>Guide</a>
			<a
				class:active={stripBaseUrl($page.url.pathname).startsWith('/rules/')}
				href={resolve('/rules/')}>Rules</a
			>
			<a
				href="https://eslint-online-playground.netlify.app/#eslint-plugin-svelte%20with%20typescript"
				target="_blank"
				rel="noopener noreferrer">Playground <span aria-hidden="true">↗</span></a
			>
		</nav>
		<ThemeToggle />

		<a
			href="https://github.com/sveltejs/eslint-plugin-svelte"
			target="_blank"
			class="github-link"
			rel="noopener noreferrer"
			aria-label="eslint-plugin-svelte on GitHub"
		>
			<svg viewBox="0 0 24 24" aria-hidden="true"
				><path
					d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.69c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.35 1.09 2.92.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.6 9.6 0 0 1 12 7.01a9.6 9.6 0 0 1 2.5.34c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85V21c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"
				></path></svg
			>
		</a>
	</div>
</header>

<Search bind:open={searchOpen} />

<style>
	header {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 100;
		width: 100%;
		height: var(--header-height);
		border-bottom: 1px solid var(--border);
		background: color-mix(in srgb, var(--surface) 92%, transparent);
		backdrop-filter: blur(14px) saturate(1.4);
	}

	.header-inner {
		display: flex;
		width: 100%;
		max-width: 96rem;
		height: 100%;
		align-items: center;
		gap: 1.5rem;
		margin: 0 auto;
		padding: 0 1.5rem;
	}

	.brand {
		display: flex;
		flex: 0 0 auto;
		align-items: center;
		gap: 0.65rem;
		color: var(--text);
		font-size: 0.92rem;
		font-weight: 600;
		letter-spacing: -0.01em;
		text-decoration: none;
	}

	.brand img {
		width: 1.85rem;
		height: 1.85rem;
	}

	.search-button {
		display: flex;
		width: min(22rem, 30vw);
		height: 2.25rem;
		align-items: center;
		gap: 0.55rem;
		margin-left: auto;
		padding: 0 0.55rem 0 0.7rem;
		border: 1px solid var(--border-strong);
		border-radius: 8px;
		background: var(--surface-muted);
		color: var(--text-faint);
		font-size: 0.76rem;
		transition:
			border-color 120ms ease,
			background 120ms ease,
			box-shadow 120ms ease;
	}

	.search-button:hover {
		border-color: color-mix(in srgb, var(--accent) 42%, var(--border));
		background: var(--surface);
		box-shadow: 0 2px 8px rgb(15 23 42 / 0.06);
	}

	.search-button svg {
		width: 1rem;
		flex: 0 0 auto;
		fill: none;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 1.8;
	}

	.search-button > span {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	kbd {
		display: inline-flex;
		align-items: center;
		gap: 0.1rem;
		margin-left: auto;
		padding: 0.12rem 0.3rem;
		border: 1px solid var(--border);
		border-radius: 4px;
		background: var(--surface);
		box-shadow: 0 1px 0 var(--border-strong);
		color: var(--text-muted);
		font: 600 0.64rem/1.2 var(--font-sans);
	}

	nav {
		display: flex;
		align-items: center;
		gap: 1.25rem;
	}

	nav a {
		color: var(--text-muted);
		font-size: 0.78rem;
		font-weight: 550;
		text-decoration: none;
		transition: color 120ms ease;
	}

	nav a:hover,
	nav a.active {
		color: var(--text);
	}

	nav a.active {
		text-decoration: underline;
		text-decoration-color: var(--accent);
		text-decoration-thickness: 2px;
		text-underline-offset: 0.45rem;
	}

	nav span {
		font-size: 0.65rem;
	}

	.github-link,
	.menu-button {
		display: grid;
		width: 2rem;
		height: 2rem;
		flex: 0 0 auto;
		place-items: center;
		border-radius: 7px;
		color: var(--text-muted);
		transition:
			color 120ms ease,
			background 120ms ease;
	}

	.github-link:hover,
	.menu-button:hover {
		background: var(--surface-muted);
		color: var(--text);
	}

	.github-link svg {
		width: 1.2rem;
		fill: currentColor;
	}

	.menu-button {
		display: none;
	}

	.menu-button svg {
		width: 1.25rem;
		fill: none;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-width: 1.8;
	}

	@media (max-width: 900px) {
		.header-inner {
			gap: 0.75rem;
			padding: 0 1rem;
		}
		.menu-button {
			display: grid;
		}
		nav {
			display: none;
		}
		.search-button {
			width: auto;
			margin-left: auto;
		}
		.search-button > span {
			display: none;
		}
		.github-link {
			display: none;
		}
	}

	@media (max-width: 500px) {
		.brand span {
			display: none;
		}
		.search-button kbd {
			display: none;
		}
		.search-button {
			padding: 0;
			width: 2.25rem;
			justify-content: center;
		}
	}
</style>
