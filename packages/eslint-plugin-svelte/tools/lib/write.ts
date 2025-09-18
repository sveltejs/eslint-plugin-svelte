import fs from 'fs';
import { ESLint } from 'eslint';
import prettier from 'prettier';
import { fileURLToPath } from 'url';

/**
 * Write file and format it with ESLint
 */
export async function writeAndFormat(fileURL: URL, content: string): Promise<void> {
	fs.writeFileSync(fileURL, content, 'utf8');

	const filePath = fileURLToPath(fileURL);
	return prettier
		.resolveConfig(fileURL)
		.then((prettierrc) => {
			if (!prettierrc) {
				return content;
			}
			return prettier.format(content, { filepath: filePath, ...prettierrc });
		})
		.then((formatted) => {
			fs.writeFileSync(fileURL, formatted, 'utf8');
			const eslint = new ESLint({ fix: true });
			return eslint.lintText(formatted, { filePath });
		})
		.then(([result]) => {
			if (result.output) {
				fs.writeFileSync(fileURL, result.output, 'utf8');
			}
		});
}
