<script>
	import { onMount } from 'svelte';
	import ESLintEditor from '../eslint/ESLintEditor.svelte';
	import { preprocess, postprocess, createLinterConfig } from '../eslint/scripts/linter.js';
	import { loadTsParser } from '../eslint/scripts/ts-parser.js';
	import { loadModulesForBrowser } from '../../../../packages/eslint-plugin-svelte/src/utils/load-module.ts';
	import { Linter } from 'eslint';
	import globals from 'globals';

	const modulesForBrowser = loadModulesForBrowser();

	let tsParser = null;

	let code = '';
	export let config = {};
	export let rules = {};
	export let fix = false;
	export let language = 'svelte';
	let time = '';
	$: options = {
		filename: language === 'svelte' ? 'example.svelte' : 'example.js',
		preprocess,
		postprocess
	};
	$: hasLangTs = /lang\s*=\s*(?:"ts"|ts|'ts'|"typescript"|typescript|'typescript')/u.test(code);
	$: linter = modulesForBrowser.then(
		hasLangTs && !tsParser
			? async () => {
					tsParser = await loadTsParser();
					return new Linter();
				}
			: () => new Linter()
	);
	let showDiff = fix;

	function onLintedResult(evt) {
		time = `${evt.detail.time}ms`;
	}

	let slotRoot;
	onMount(() => {
		code = slotRoot.textContent.trim();
	});
	$: blockHeight = `${Math.max(120, 20 * (1 + code.split('\n').length) + 100)}px`;
</script>

<div class="eslint-code-block-default-content" bind:this={slotRoot}>
	<slot />
</div>

<div class="eslint-code-block-root" style:height={blockHeight}>
	<ESLintEditor
		{linter}
		bind:code
		config={[
			...createLinterConfig(),
			{
				files: ['**'],
				languageOptions: {
					parserOptions: {
						parser: {
							ts: tsParser,
							typescript: tsParser
						}
					},
					globals: {
						...globals.browser,
						...globals.es2021
					}
				},
				rules,
				...config
			}
		]}
		{language}
		{options}
		on:result={onLintedResult}
		showDiff={showDiff && fix}
	/>
	<div class="eslint-code-block-tools">
		{#if fix}
			<label>
				<input bind:checked={showDiff} type="checkbox" />
				Show Diff
			</label>
		{/if}
		<span style:margin-left="16px">{time}</span>
	</div>
</div>

<style>
	.eslint-code-block-default-content {
		display: none;
	}
	.eslint-code-block-root {
		height: 300px;
	}
	.eslint-code-block-tools {
		text-align: end;
	}
</style>
