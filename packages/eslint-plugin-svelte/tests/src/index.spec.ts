import assert from 'assert';
import { shouldRun } from '../../src/utils/index.js';

const actualSvelte3: Parameters<typeof shouldRun>[0] = {
	svelteVersion: '3/4',
	svelteFileType: '.svelte',
	runes: false,
	svelteKitVersion: null,
	svelteKitFileType: null
};

const actualSvelte5: Parameters<typeof shouldRun>[0] = {
	svelteVersion: '5',
	svelteFileType: '.svelte',
	runes: true,
	svelteKitVersion: null,
	svelteKitFileType: null
};

const actualSvelte5Script: Parameters<typeof shouldRun>[0] = {
	svelteVersion: '5',
	svelteFileType: '.svelte.[js|ts]',
	runes: true,
	svelteKitVersion: null,
	svelteKitFileType: null
};

const actualSvelteKit: Parameters<typeof shouldRun>[0] = {
	svelteVersion: '5',
	svelteFileType: '.svelte',
	runes: true,
	svelteKitVersion: '2',
	svelteKitFileType: '+page.svelte'
};

const actualSvelteKitNotRoute: Parameters<typeof shouldRun>[0] = {
	svelteVersion: '5',
	svelteFileType: '.svelte',
	runes: true,
	svelteKitVersion: '2',
	svelteKitFileType: null
};

describe('shouldRun', () => {
	it('no condition1', () => {
		assert.strictEqual(shouldRun(actualSvelte3, []), true);
	});
	it('no condition2', () => {
		assert.strictEqual(shouldRun(actualSvelte3, [{}]), true);
	});
	it('no condition3', () => {
		assert.strictEqual(
			shouldRun(actualSvelte3, [
				{
					svelteVersions: undefined
				}
			]),
			true
		);
	});
	it('no condition4', () => {
		assert.strictEqual(
			shouldRun(actualSvelte3, [
				{
					svelteVersions: []
				}
			]),
			true
		);
	});

	it('simple true', () => {
		assert.strictEqual(
			shouldRun(actualSvelte3, [
				{
					svelteVersions: ['3/4']
				}
			]),
			true
		);
	});

	it('simple false', () => {
		assert.strictEqual(
			shouldRun(actualSvelte3, [
				{
					svelteVersions: ['5']
				}
			]),
			false
		);
	});

	it('or true', () => {
		assert.strictEqual(
			shouldRun(actualSvelte3, [
				{
					svelteVersions: ['3/4']
				},
				{
					svelteVersions: ['5']
				}
			]),
			true
		);
	});

	it('or false', () => {
		assert.strictEqual(
			shouldRun(actualSvelteKit, [
				{
					svelteKitFileTypes: ['+page.js']
				},
				{
					svelteKitFileTypes: ['+page.server.js']
				}
			]),
			false
		);
	});

	it('and true', () => {
		assert.strictEqual(
			shouldRun(actualSvelte5, [
				{
					svelteVersions: ['5'],
					runes: [true]
				}
			]),
			true
		);
	});

	it('and false', () => {
		assert.strictEqual(
			shouldRun(actualSvelte5, [
				{
					svelteVersions: ['5'],
					runes: [false]
				}
			]),
			false
		);
	});

	it('real - svelte3', () => {
		assert.strictEqual(
			shouldRun(actualSvelte3, [
				{
					svelteVersions: ['3/4']
				}
			]),
			true
		);
	});

	it('real - Svelte5 with runes', () => {
		assert.strictEqual(
			shouldRun(actualSvelte5, [
				{
					svelteVersions: ['5'],
					svelteFileTypes: ['.svelte'],
					runes: [true]
				}
			]),
			true
		);
	});

	it('real - Svelte5 without runes', () => {
		assert.strictEqual(
			shouldRun(actualSvelte5, [
				{
					svelteVersions: ['5'],
					svelteFileTypes: ['.svelte'],
					runes: [false]
				}
			]),
			false
		);
	});

	it('real - Svelte5 script', () => {
		assert.strictEqual(
			shouldRun(actualSvelte5Script, [
				{
					svelteVersions: ['5'],
					svelteFileTypes: ['.svelte.[js|ts]'],
					runes: [true]
				}
			]),
			true
		);
	});

	it('real - SvelteKit1', () => {
		assert.strictEqual(
			shouldRun(actualSvelteKit, [
				{
					svelteKitVersions: ['2'],
					svelteKitFileTypes: ['+page.svelte']
				}
			]),
			true
		);
	});

	it('real - SvelteKit2', () => {
		assert.strictEqual(
			shouldRun(actualSvelteKit, [
				{
					svelteKitVersions: [null]
				}
			]),
			false
		);
	});

	it('real - SvelteKit3', () => {
		assert.strictEqual(
			shouldRun(actualSvelteKit, [
				{
					svelteKitVersions: ['2'],
					svelteKitFileTypes: [null]
				}
			]),
			false
		);
	});

	it('real - SvelteKit not route1', () => {
		assert.strictEqual(
			shouldRun(actualSvelteKitNotRoute, [
				{
					svelteKitVersions: ['2'],
					svelteKitFileTypes: [null]
				}
			]),
			true
		);
	});

	it('real - SvelteKit not route2', () => {
		assert.strictEqual(
			shouldRun(actualSvelteKitNotRoute, [
				{
					svelteKitVersions: ['2'],
					svelteKitFileTypes: ['+page.svelte']
				}
			]),
			false
		);
	});
});
