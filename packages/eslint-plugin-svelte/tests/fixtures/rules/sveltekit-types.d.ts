// Type stubs for SvelteKit's $app modules

declare module '$app/types' {
	export type Pathname = "/" | "/test" | "/test/123" | "/test/123/456";
	export type ResolvedPathname = `${"" | `/${string}`}${Pathname}`;
}
