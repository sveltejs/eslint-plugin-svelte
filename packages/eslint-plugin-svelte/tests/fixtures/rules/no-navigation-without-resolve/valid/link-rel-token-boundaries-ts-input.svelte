<script lang="ts">
	import { resolve } from '$app/paths';
	const suffix = 'suffix';
	const prefix = 'prefix';
	const empty = '';
	const rel = 'noopener external noreferrer';
	const relTokens = rel;
	let dynamic = Math.random() > 0.5 ? 'suffix' : '';
	let mutated = 'external';
	mutated = 'nofollow';
</script>

<a rel="external{empty}" href="/foo">empty suffix</a>
<a rel="{empty}external" href="/foo">empty prefix</a>
<a rel="exter{'nal'}" href="/foo">complete assembled token</a>
<a rel="{prefix} external {suffix}" href="/foo">delimited token</a>
<a rel="external {dynamic}" href="/foo">unknown separate token</a>
<a rel="{dynamic} external" href="/foo">unknown separate prefix</a>
<a rel={`external ${suffix}`} href="/foo">template with delimiter</a>
<a rel={`exter${'nal'}`} href="/foo">assembled template</a>
<a rel={`external\tnofollow`} href="/foo">cooked template whitespace</a>
<a rel={relTokens} href="/foo">variable token list</a>
<a {rel} href="/foo">shorthand token list</a>
<a rel="external {suffix}" data-sveltekit-reload="false" href="/foo">external plus reload false</a>
<a href={resolve('/foo')} data-sveltekit-reload="false">resolved reload</a>
<a rel={`external ${dynamic}`} href="/foo">unknown separate template token</a>
<a rel={`${dynamic} external`} href="/foo">unknown separate template prefix</a>
