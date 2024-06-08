export const numValue = 42;
export const strValue = 'string';
export let anyValue: any;
export let nullableValue: null | { foo: number };
export const hasSubscribe1 = { subscribe: 42 };
export const hasSubscribe2 = {
	subscribe: (): void => {
		// noop
	}
};
export const hasSubscribe3 = {
	subscribe: (_fn: () => void): void => {
		// noop
	}
};
