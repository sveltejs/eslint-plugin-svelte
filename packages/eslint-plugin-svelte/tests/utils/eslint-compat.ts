import { getLegacyESLint, getESLint } from 'eslint-compat-utils/eslint';
import { getLinter } from 'eslint-compat-utils/linter';
import { getRuleTester, getRuleIdPrefix } from 'eslint-compat-utils/rule-tester';

export const LegacyESLint = getLegacyESLint();
export const ESLint = getESLint();
export const RuleTester = getRuleTester();
export const TEST_RULE_ID_PREFIX = getRuleIdPrefix();
export const Linter = getLinter();
