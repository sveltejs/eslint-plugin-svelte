import { base } from '$app/paths';

export function withBase<T extends string>(p: T): T {
	return `${base}${p}` as T;
}
export const HOME = withBase('/home');
export const ABOUT = '/about';
export const TYPED: '/typed' = '/typed';
export const LINKS = { a: '/la', b: withBase('/lb') } as const;
export const load = () => ({ next: withBase('/dashboard'), plain: '/plain' as const });
