import {
	getFilename as getFilenameBase,
	getPhysicalFilename as getPhysicalFilenameBase,
	getCwd as getCwdBase
} from 'eslint-compat-utils';
import type { RuleContext } from '../types.js';

/**
 * Gets the value of `context.filename`, but for older ESLint it returns the result of `context.getFilename()`.
 */
export function getFilename(context: RuleContext): string {
	return getFilenameBase(context as never);
}
/**
 * Gets the value of `context.physicalFilename`,
 * but for older ESLint it returns the result of `context.getPhysicalFilename()`.
 * Versions older than v7.28.0 return a value guessed from the result of `context.getFilename()`,
 * but it may be incorrect.
 */
export function getPhysicalFilename(context: RuleContext): string {
	return getPhysicalFilenameBase(context as never);
}

/**
 * Gets the value of `context.cwd`, but for older ESLint it returns the result of `context.getCwd()`.
 * Versions older than v6.6.0 return a value from the result of `process.cwd()`.
 */
export function getCwd(context: RuleContext): string {
	return getCwdBase(context as never);
}
