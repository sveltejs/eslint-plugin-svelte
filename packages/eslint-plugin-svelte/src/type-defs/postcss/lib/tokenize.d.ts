declare module 'postcss/lib/tokenize' {
	import type { Input } from 'postcss';
	export type Token = [string, string, number?, number?];
	export type Tokenizer = {
		back: (token: Token) => void;
		nextToken: (opts?: { ignoreUnclosed?: boolean }) => Token | undefined;
		endOfFile: () => boolean;
		position: () => number;
	};
	export default function tokenizer(input: Input, options?: { ignoreErrors?: boolean }): Tokenizer;
}
