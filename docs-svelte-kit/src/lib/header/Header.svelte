<script>
	import { createEventDispatcher } from 'svelte';
	import { isActive } from '../utils.js';
	import { page } from '$app/stores';
	import logo from './logo.svg';
	import { base as baseUrl } from '$app/paths';

	const dispatch = createEventDispatcher();

	function handleToggleSidebar() {
		dispatch('toggleSidebarOpen');
	}
</script>

<header>
	<div class="corner">
		<div
			class="sidebar-button"
			role="button"
			tabindex="0"
			on:click={handleToggleSidebar}
			on:keydown={(e) => (e.code === 'Enter' || e.code === 'Space') && handleToggleSidebar()}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
				role="img"
				viewBox="0 0 448 512"
				class="icon"
			>
				<path
					fill="currentColor"
					d="M436 124H12c-6.627 0-12-5.373-12-12V80c0-6.627 5.373-12 12-12h424c6.627 0 12 5.373 12 12v32c0 6.627-5.373 12-12 12zm0 160H12c-6.627 0-12-5.373-12-12v-32c0-6.627 5.373-12 12-12h424c6.627 0 12 5.373 12 12v32c0 6.627-5.373 12-12 12zm0 160H12c-6.627 0-12-5.373-12-12v-32c0-6.627 5.373-12 12-12h424c6.627 0 12 5.373 12 12v32c0 6.627-5.373 12-12 12z"
				/>
			</svg>
		</div>
		<a href="{baseUrl}/" class="home-link">
			<img src={logo} alt="Logo" />
		</a>
	</div>

	<nav>
		<svg viewBox="0 0 2 3" aria-hidden="true">
			<path d="M0,0 L1,2 C1.5,3 1.5,3 2,3 L2,0 Z" />
		</svg>
		<ul>
			<li class:active={isActive('/', $page)}>
				<a href="{baseUrl}/">Home</a>
			</li>
			<li class:active={isActive('/user-guide/', $page)}>
				<a href="{baseUrl}/user-guide/">User Guide</a>
			</li>
			<li class:active={isActive('/rules/', $page)}>
				<a href="{baseUrl}/rules/">Rules</a>
			</li>
			<li>
				<a
					href="https://eslint-online-playground.netlify.app/#eslint-plugin-svelte%20with%20typescript"
					target="_blank"
					rel="noopener noreferrer"
				>
					Playground
				</a>
			</li>
		</ul>
		<div class="nav-title">
			<a href="{baseUrl}/"> <img src={logo} alt="Logo" />eslint-plugin-svelte</a>
		</div>
		<svg viewBox="0 0 2 3" aria-hidden="true">
			<path d="M0,0 L0,3 C0.5,3 0.5,3 1,2 L2,0 Z" />
		</svg>
	</nav>

	<div class="corner">
		<a
			href="https://github.com/sveltejs/eslint-plugin-svelte"
			target="_blank"
			class="github-link"
			rel="noopener noreferrer"
			aria-label="GitHub"
		>
			<svg
				version="1.1"
				width="16"
				height="16"
				viewBox="0 0 16 16"
				class="octicon octicon-mark-github"
				aria-hidden="true"
				><path
					style:fill="#2c3e50"
					fill-rule="evenodd"
					d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"
				/>
			</svg>
		</a>
	</div>
</header>

<style>
	header {
		display: flex;
		justify-content: space-between;
		padding: 0.5em 2em;
		position: fixed;
		top: 0;
		width: calc(100% - 4em);
		z-index: 100;
		background-color: white;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.corner {
		width: 3em;
		height: 3em;
	}

	.corner a,
	.sidebar-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	.corner img {
		width: 2em;
		height: 2em;
		object-fit: contain;
	}
	.corner svg {
		width: 2rem;
		height: 2rem;
		object-fit: contain;
	}
	.corner path {
		fill: var(--heading-color);
	}

	nav {
		display: flex;
		justify-content: center;
		min-width: 1px;
	}

	nav svg {
		width: 2em;
		height: 3em;
		display: block;
	}

	nav path {
		fill: var(--background-without-opacity);
	}

	ul {
		position: relative;
		padding: 0;
		margin: 0;
		height: 3em;
		display: flex;
		justify-content: center;
		align-items: center;
		list-style: none;
		background: var(--background-without-opacity);
		background-size: contain;
	}

	li {
		position: relative;
		height: 100%;
	}

	li.active > a {
		color: var(--accent-color);
	}

	nav a {
		display: flex;
		height: 100%;
		align-items: center;
		padding: 0 1em;
		color: var(--heading-color);
		font-weight: 700;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		text-decoration: none;
		transition: color 0.2s linear;
	}

	a:hover {
		color: var(--accent-color);
	}

	.home-link {
		background: var(--background-without-opacity);
		border-bottom-right-radius: 20%;
	}

	.github-link {
		background: var(--background-without-opacity);
		border-bottom-left-radius: 20%;
	}

	.sidebar-button {
		background: var(--background-without-opacity);
	}
	.sidebar-button,
	.nav-title {
		display: none;
	}
	@media (max-width: 719px) {
		.sidebar-button {
			display: flex;
		}
		.corner .home-link {
			display: none;
		}
		.nav-title {
			display: flex;
			justify-content: center;
			background: var(--background-without-opacity);
			width: calc(100vw - 96px);
		}
		.nav-title a {
			height: 3rem;
			object-fit: contain;
			font-size: 0.5rem;
		}
		.nav-title img {
			width: 2rem;
			height: 2rem;
			object-fit: contain;
		}
		nav ul,
		nav svg {
			display: none;
		}
		.github-link {
			border-bottom-left-radius: 0;
		}
	}
</style>
