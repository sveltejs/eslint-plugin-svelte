import { isOpeningParenToken } from '@eslint-community/eslint-utils';
import type { AST } from 'svelte-eslint-parser';
import type { RuleContext } from '../../types.js';
import type { ASTNodeWithParent } from '../../types-for-node.js';
import { getSourceCode } from '../../utils/compat.js';

/** Extract comments */
export function extractLeadingComments(
	context: RuleContext,
	node: ASTNodeWithParent
): (AST.Token | AST.Comment)[] {
	const sourceCode = getSourceCode(context);
	const beforeToken = sourceCode.getTokenBefore(node, {
		includeComments: false,
		filter(token) {
			if (isOpeningParenToken(token)) {
				return false;
			}
			const astToken = token as AST.Token;
			if (astToken.type === 'HTMLText') {
				return false;
			}
			return astToken.type !== 'HTMLComment';
		}
	});
	if (beforeToken) {
		return sourceCode
			.getTokensBetween(beforeToken, node, { includeComments: true })
			.filter(isComment);
	}
	return sourceCode.getTokensBefore(node, { includeComments: true }).filter(isComment);
}

/** Checks whether given token is comment token */
function isComment(token: AST.Token | AST.Comment): boolean {
	return token.type === 'HTMLComment' || token.type === 'Block' || token.type === 'Line';
}
