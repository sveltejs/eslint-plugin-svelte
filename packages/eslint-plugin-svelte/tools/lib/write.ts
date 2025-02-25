import fs from 'fs';
import { ESLint } from 'eslint';
import prettier from 'prettier';

/**
 * Write file and format it with ESLint
 */
export function writeAndFormat(fileName: string, content: string): Promise<void> {
	fs.writeFileSync(fileName, content, 'utf8');
	return prettier
		.resolveConfig(fileName)
		.then((prettierrc) => {
			if (!prettierrc) {
				return content;
			}
			return prettier.format(content, { filepath: fileName, ...prettierrc });
		})
		.then((formatted) => {
			fs.writeFileSync(fileName, formatted, 'utf8');
			const eslint = new ESLint({ fix: true });
			return eslint.lintText(formatted, { filePath: fileName });
		})
		.then(([result]) => {
			if (result.output) {
				fs.writeFileSync(fileName, result.output, 'utf8');
			}
		});
}
