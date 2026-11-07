import assert from 'assert';
import { Linter } from 'eslint';
import * as svelteParser from 'svelte-eslint-parser';
import rule from '../../../src/rules/no-navigation-without-resolve.js';

describe('no-navigation-without-resolve documented sinks', () => {
	const valid = [
		'<form method="POST" action="/backend" rel="external"></form>',
		'<form rel="external"><button formaction="/backend">Send</button></form>',
		'<button form="backend" formaction="/upload">Send</button><form id="backend" rel="external"></form>',
		'<form method="dialog" action="/unused"><button formaction="/unused">Close</button></form>',
		'<form><button formmethod="dialog" formaction="/unused">Close</button></form>',
		'<button type="button" formaction="/unused">Click</button>',
		'<button type="reset" formaction="/unused">Reset</button>',
		'<input type="text" formaction="/unused" />',
		'<input formaction="/unused" />',
		'<form method="POST" action="?/login"><button formaction="?/register">Register</button></form>',
		'<form method="GET" action=""><input name="q" /></form>',
		'<area href="https://example.com/map" />',
		'<svg><a href="https://example.com"><text>Link</text></a></svg>',
		'<svg><a xlink:href="https://example.com"><text>Link</text></a></svg>',
		'<form action="https://example.com/upload"><button formaction="https://example.com/other">Send</button></form>',
		'<script>import { goto, pushState, replaceState, preloadData } from "$app/navigation"; goto("https://example.com/app"); pushState("//example.com/app", {}); replaceState("https://example.com/app", {}); preloadData("https://example.com/app");</script>',
		'<script>import { preloadCode } from "$app/navigation"; import { resolve } from "$app/paths"; preloadCode(resolve("/blog"), "/ignored");</script>'
	];
	const invalid = [
		'<form action="/login"></form>',
		'<form rel="external"><button form="internal" formaction="/login">Send</button></form><form id="internal"></form>',
		'<form method="dialog"><button formmethod="POST" formaction="/login">Send</button></form>',
		'<form><input type="submit" formaction="/login" /></form>',
		'<form><input type="image" formaction="/login" /></form>',
		'<area href="/about" />',
		'<svg><a href="/about"><text>Link</text></a></svg>',
		'<svg><a xlink:href="/about"><text>Link</text></a></svg>',
		'<a href="/about" data-sveltekit-reload>Link</a>',
		'<a href="/about" target="_blank">Link</a>',
		'<a href="/about" download>Link</a>'
	];
	it('uses API-specific diagnostics for absolute URLs and preloadCode pathnames', () => {
		const code = `<script>
			import { goto, preloadCode } from '$app/navigation';
			goto('https://example.com/app');
			preloadCode('https://example.com/app');
			preloadCode('');
			preloadCode('?query');
			preloadCode('#hash');
			preloadCode('blog');
		</script>`;
		for (const strict of [false, true]) {
			const messages = new Linter({ configType: 'flat' }).verify(
				code,
				{
					files: ['**/*.svelte'],
					languageOptions: { parser: svelteParser },
					plugins: { test: { rules: { navigation: rule as never } } },
					rules: { 'test/navigation': ['error', { strict }] }
				},
				'page.svelte'
			);
			assert.deepStrictEqual(
				messages.map((message) => message.messageId),
				[...(strict ? ['strictUnknown'] : []), ...Array(5).fill('preloadCodePathname')]
			);
		}
	});

	for (const [cases, expected] of [
		[valid, 0],
		[invalid, 1]
	] as const) {
		for (const code of cases) {
			it(code, () => {
				const messages = new Linter({ configType: 'flat' }).verify(
					code,
					{
						files: ['**/*.svelte'],
						languageOptions: { parser: svelteParser },
						plugins: { test: { rules: { navigation: rule as never } } },
						rules: { 'test/navigation': 'error' }
					},
					'page.svelte'
				);
				assert.strictEqual(messages.length, expected, JSON.stringify(messages));
				assert.ok(messages.every((message) => message.ruleId === 'test/navigation'));
			});
		}
	}
});
