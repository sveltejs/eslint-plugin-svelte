import * as eslint from 'eslint';
import * as experimental from 'eslint/use-at-your-own-risk';

type MaybeHasRuleTester = {
	FlatRuleTester?: typeof eslint.RuleTester;
};

export const RuleTester =
	(experimental as never as MaybeHasRuleTester).FlatRuleTester ?? eslint.RuleTester;
