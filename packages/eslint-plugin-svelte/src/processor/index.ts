import type { Linter } from 'eslint';
import type { Shared } from '../shared/index.js';
import { beginShared, terminateShared } from '../shared/index.js';
export * as meta from '../meta.js';

/** preprocess */
export function preprocess(code: string, filename: string): string[] {
	if (filename) {
		beginShared(filename);
	}

	return [code];
}

/** postprocess */
export function postprocess(
	[messages]: Linter.LintMessage[][],
	filename: string
): Linter.LintMessage[] {
	const shared = terminateShared(filename);
	if (shared) {
		return filter(messages, shared);
	}

	return messages;
}

export const supportsAutofix = true;

/** Filter  */
function filter(messages: Linter.LintMessage[], shared: Shared): Linter.LintMessage[] {
	if (shared.commentDirectives.length === 0) {
		return messages;
	}
	let filteredMessages = messages;
	for (const cd of shared.commentDirectives) {
		filteredMessages = cd.filterMessages(filteredMessages);
	}
	return filteredMessages;
}
