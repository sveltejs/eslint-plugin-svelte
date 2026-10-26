<script>
	import { resolve } from '$app/paths';
	const suffix = 'suffix';
	const prefix = 'prefix';
	const empty = '';
	const rel = 'noopener external noreferrer';
	let dynamic = Math.random() > 0.5 ? 'suffix' : '';
	let mutated = 'external';
	mutated = 'nofollow';
</script>

<a rel="external{suffix}" href="/foo">suffix</a>
<a rel="{prefix}external" href="/foo">prefix</a>
<a rel="external{dynamic}" href="/foo">unknown suffix</a>
<a rel="{dynamic}external" href="/foo">unknown prefix</a>
<a rel="external{'suffix'}" href="/foo">literal suffix</a>
<a rel={`external${suffix}`} href="/foo">template suffix</a>
<a rel="external-suffix" href="/foo">partial token</a>
<a rel="EXTERNAL" href="/foo">case sensitive</a>
<a rel href="/foo">empty attribute</a>
<a rel="" href="/foo">empty string</a>
<a rel={false} href="/foo">false rel</a>
<a rel={mutated} href="/foo">changed initializer</a>
<a data-sveltekit-reload="false" href="/foo">reload false string</a>
<a data-sveltekit-reload={false} href="/foo">reload false expression</a>
<a data-sveltekit-reload="true" href="/foo">reload true string</a>
<a data-sveltekit-reload={true} href="/foo">reload true expression</a>
<a data-sveltekit-reload href="/foo">reload boolean</a>
<a rel={`external${dynamic}`} href="/foo">unknown template suffix</a>
<a rel={`${dynamic}external`} href="/foo">unknown template prefix</a>
