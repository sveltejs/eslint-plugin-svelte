import SafeParser from 'postcss-safe-parser/lib/safe-parser';
import templateTokenize from './template-tokenize';
class TemplateSafeParser extends SafeParser {
	protected createTokenizer(): void {
		this.tokenizer = templateTokenize(this.input, { ignoreErrors: true });
	}
}
export default TemplateSafeParser;
