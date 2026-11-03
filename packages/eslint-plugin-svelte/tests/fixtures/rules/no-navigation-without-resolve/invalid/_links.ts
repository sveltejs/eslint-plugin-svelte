import { base } from '$app/paths';

export function withBase<T extends string>(p: T): T {
	return `${base}${p}` as T;
}
export const HOME = withBase('/home');
export const ABOUT = '/about';
export const TYPED: '/typed' = '/typed';
export const LINKS = { a: '/la', b: withBase('/lb') } as const;
export const load = () => ({ next: withBase('/dashboard'), plain: '/plain' as const });
export function localize<T extends Record<string, string>>(r: T): T {
	return Object.fromEntries(Object.entries(r).map(([k, v]) => [k, base + v])) as T;
}
export const routes = localize({ home: '/', about: '/about' } as const);
type Prefixed<T> = { [K in Extract<keyof T, string>]: T[K] };
export function prefixed<T extends Record<string, string>>(r: T): Prefixed<T> {
	return localize(r);
}
export const routes2 = prefixed({ about: '/about' } as const);
export const ROUTES = withBase({ home: '/', about: '/about' } as const);
export type Route = (typeof ROUTES)[keyof typeof ROUTES];
export const PLAIN = { about: '/plain' } as const;
export type PlainRoute = (typeof PLAIN)[keyof typeof PLAIN];
