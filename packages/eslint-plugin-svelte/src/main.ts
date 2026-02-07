import './rule-types.js';
import type { RuleModule } from './types.js';
import { rules as ruleList } from './utils/rules.js';
import base from './configs/flat/base.js';
import recommended from './configs/flat/recommended.js';
import prettier from './configs/flat/prettier.js';
import all from './configs/flat/all.js';
import * as processor from './processor/index.js';
import * as metaModule from './meta.js';
import type { Linter, Rule } from 'eslint';

/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion -- ts(2742) Error */
export const configs = {
	base: base as Linter.Config[],
	recommended: recommended as Linter.Config[],
	prettier: prettier as Linter.Config[],
	all: all as Linter.Config[],
	// For backward compatibility
	'flat/base': base as Linter.Config[],
	'flat/recommended': recommended as Linter.Config[],
	'flat/prettier': prettier as Linter.Config[],
	'flat/all': all as Linter.Config[]
};
/* eslint-enable @typescript-eslint/no-unnecessary-type-assertion -- ts(2742) Error */

export const rules = ruleList.reduce(
	(obj, r) => {
		obj[r.meta.docs.ruleName] = r;
		return obj;
	},
	{} as { [key: string]: RuleModule }
) as unknown as Record<string, Rule.RuleModule>;

export const meta = { ...metaModule };
export const processors = {
	'.svelte': processor,
	svelte: processor
};
