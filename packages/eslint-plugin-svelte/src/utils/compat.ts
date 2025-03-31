import { getCwd as getCwdBase } from 'eslint-compat-utils';
import type { RuleContext } from '../types.js';

/**
 * Gets the value of `context.cwd`, but for older ESLint it returns the result of `context.getCwd()`.
 * Versions older than v6.6.0 return a value from the result of `process.cwd()`.
 */
export function getCwd(context: RuleContext): string {
	return getCwdBase(context as never);
}
