export { default as Bar } from './Bar.svelte';
export { default as MyButton } from './my-button.svelte';
export { default } from './Default.svelte';
export { count as Count, increment } from './Counter.svelte';
export * from './Utils.svelte';
export * as Everything from './Everything.svelte';
export { default as Foo } from './Bar.js';

const Local = 1;
export { Local as Renamed };
