<script>
	import { onMount } from 'svelte';

	const storageKey = 'eslint-plugin-svelte-theme';
	let theme = 'light';

	onMount(() => {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		theme = document.documentElement.dataset.theme || (mediaQuery.matches ? 'dark' : 'light');

		function handleSystemThemeChange(event) {
			if (!localStorage.getItem(storageKey)) setTheme(event.matches ? 'dark' : 'light', false);
		}

		mediaQuery.addEventListener('change', handleSystemThemeChange);
		return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
	});

	function setTheme(nextTheme, persist = true) {
		theme = nextTheme;
		document.documentElement.dataset.theme = nextTheme;
		document.documentElement.style.colorScheme = nextTheme;
		if (persist) localStorage.setItem(storageKey, nextTheme);
	}

	function toggleTheme() {
		setTheme(theme === 'dark' ? 'light' : 'dark');
	}
</script>

<button
	type="button"
	on:click={toggleTheme}
	aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
	title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
>
	<svg class="sun" viewBox="0 0 24 24" aria-hidden="true">
		<circle cx="12" cy="12" r="3.5"></circle>
		<path
			d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"
		></path>
	</svg>
	<svg class="moon" viewBox="0 0 24 24" aria-hidden="true">
		<path d="M20.5 14.4A8.5 8.5 0 0 1 9.6 3.5 8.5 8.5 0 1 0 20.5 14.4Z"></path>
	</svg>
</button>

<style>
	button {
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

	button:hover {
		background: var(--surface-muted);
		color: var(--text);
	}

	svg {
		width: 1.1rem;
		fill: none;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 1.7;
	}

	.moon {
		display: none;
	}

	:global(:root[data-theme='dark']) .sun {
		display: none;
	}

	:global(:root[data-theme='dark']) .moon {
		display: block;
	}
</style>
