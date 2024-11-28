declare module 'postcss-safe-parser/lib/safe-parser.js' {
	import type { Tokenizer } from 'postcss/lib/tokenize';
	import type { Root, Input } from 'postcss';

	declare class Parser {
		protected input: Input;

		public root: Root;

		protected tokenizer: Tokenizer;

		public constructor(input: Input);

		public parse(): void;

		protected createTokenizer(): void;
	}
	export default Parser;
}
