import fs from 'fs';
import { ESLint } from 'eslint';
import prettier from 'prettier';

/**
 * Write file and format it with ESLint
 */
export async function writeAndFormat(fileName: string, content: string): Promise<void> {
	fs.writeFileSync(fileName, content, 'utf8');

	const prettierrc = await prettier.resolveConfig(fileName);

	const formatted =
		prettierrc && !(fileName.endsWith('valid-style-parse.md') && content.includes('.class\n'))
			? await prettier.format(content, { filepath: fileName, ...prettierrc })
			: content;

	fs.writeFileSync(fileName, formatted, 'utf8');

	const eslint = new ESLint({ fix: true });
	const [result] = await eslint.lintText(formatted, { filePath: fileName });

	if (result?.output) {
		fs.writeFileSync(fileName, result.output, 'utf8');
	}
}
