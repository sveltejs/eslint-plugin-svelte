import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const dirname = path.dirname(fileURLToPath(import.meta.url));

/** Generate SvelteKit routes files */
export default function generateRoutes(): void {
	const srcRoot = path.join(dirname, '../../docs');
	const distRoot = path.join(dirname, '../src/routes');

	for (const markdownPath of iterateMarkdown(srcRoot)) {
		const markdownRelativePath = path.relative(srcRoot, markdownPath);
		const distPath = path.join(
			distRoot,
			markdownRelativePath.replace(/(?:README)?\.md$/u, '/+page.md')
		);

		mkdirs(path.dirname(distPath));
		fs.writeFileSync(
			distPath,
			`<script>
  import MD from "${path.relative(path.dirname(distPath), markdownPath)}"
</script>

<MD />
`,
			'utf-8'
		);
	}
}

/** Iterate markdown files */
function* iterateMarkdown(rootDir: string): IterableIterator<string> {
	for (const filename of fs.readdirSync(rootDir)) {
		const abs = path.join(rootDir, filename);
		if (path.extname(filename) === '.md') {
			yield abs;
		} else if (fs.statSync(abs).isDirectory()) {
			yield* iterateMarkdown(abs);
		}
	}
}

/** Make directories */
function mkdirs(dir: string): void {
	if (!fs.existsSync(dir)) {
		mkdirs(path.dirname(dir));
		fs.mkdirSync(dir);
	}
}
