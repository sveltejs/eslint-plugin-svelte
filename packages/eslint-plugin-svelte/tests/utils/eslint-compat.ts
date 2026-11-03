import * as eslint from 'eslint';
import * as experimental from 'eslint/use-at-your-own-risk';

type MaybeHasRuleTester = {
	FlatRuleTester?: typeof eslint.RuleTester;
	default?: { FlatRuleTester?: typeof eslint.RuleTester };
};

// ESLint v8 is CommonJS and defines `FlatRuleTester` as a lazy getter, so it is
// not exposed as an ESM named export. Read it from the default export instead.
const mod = experimental as never as MaybeHasRuleTester;
export const RuleTester = mod.FlatRuleTester ?? mod.default?.FlatRuleTester ?? eslint.RuleTester;
