import type { Tokenizer, Token } from 'postcss/lib/tokenize';
import tokenize from 'postcss/lib/tokenize';

type Tokenize = typeof tokenize;

/** Tokenize */
function templateTokenize(...args: Parameters<Tokenize>): Tokenizer {
	const tokenizer = tokenize(...args);

	/** nextToken */
	function nextToken(
		...args: Parameters<Tokenizer['nextToken']>
	): ReturnType<Tokenizer['nextToken']> {
		const returned = [];
		let token: Token | undefined, lastPos;
		let depth = 0;

		while ((token = tokenizer.nextToken(...args))) {
			if (token[0] !== 'word') {
				if (token[0] === '{') {
					++depth;
				} else if (token[0] === '}') {
					--depth;
				}
			}
			if (depth || returned.length) {
				lastPos = token[3] || token[2] || lastPos;
				returned.push(token);
			}
			if (!depth) {
				break;
			}
		}
		if (returned.length) {
			token = ['word', returned.map((token) => token[1]).join(''), returned[0][2], lastPos];
		}
		return token;
	}

	return Object.assign({}, tokenizer, {
		nextToken
	});
}

export default templateTokenize;
