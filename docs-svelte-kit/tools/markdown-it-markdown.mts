import path from 'path';
import spawn from 'cross-spawn';
import type Md from 'markdown-it';

type TreeItem = {
	children: TreeItem[];
};
type TreeStack = { item: TreeItem; level: number; upper: TreeStack | null };

class TOCRenderer {
	private readonly tree: TreeItem;

	private stack: TreeStack;

	public constructor() {
		const item: TreeItem = { children: [] };
		this.tree = item;
		this.stack = { item, level: 1, upper: null };
	}

	public addMenu(level: number, id: string, title: string) {
		if (this.stack.level < level) {
			const parent = this.stack.item;
			const item = parent.children[parent.children.length - 1];
			if (item) {
				this.stack = { item, level, upper: this.stack };
			}
		}
		while (level < this.stack.level && this.stack.upper) {
			this.stack = this.stack.upper;
		}
		const item = { level, id, title, children: [] };
		this.stack.item.children.push(item);
	}

	public toc() {
		return this.tree;
	}
}
/**
 * @param {import('markdown-it')} md
 */
export default (md: Md): void => {
	md.core.ruler.push('custom_markdown', (state) => {
		const tokens = state.tokens;
		tokens.unshift(new state.Token('custom_markdown_data', '', 0));
	});

	md.renderer.rules.custom_markdown_data = (tokens, _idx, _options, env, _self) => {
		const renderer = new TOCRenderer();
		for (let idx = 0; idx < tokens.length; idx++) {
			const token = tokens[idx];

			if (token.type !== 'heading_open') {
				continue;
			}
			const level = Number(token.tag.slice(1));
			if (level > 3) {
				continue;
			}
			// Aggregate the next token children text.
			const title = tokens[idx + 1]
				.children!.filter(
					(token) => token.type === 'text' || token.type === 'emoji' || token.type === 'code_inline'
				)
				.reduce((acc, t) => acc + t.content, '');

			const slug = token.attrGet('id')!;
			renderer.addMenu(level, slug, title);
		}

		const fileInfo: { timestamp?: number; lastUpdated?: string } = {};
		const timestamp = getGitLastUpdatedTimestamp(env.id);
		if (timestamp) {
			fileInfo.timestamp = timestamp;
			fileInfo.lastUpdated = new Date(timestamp).toLocaleString();
		}
		return `<script context="module">
  export const toc = ${JSON.stringify(renderer.toc())}
  export const fileInfo = ${JSON.stringify(fileInfo)}
</script>
  `;
	};
};

/** Get last updated timestamp */
function getGitLastUpdatedTimestamp(filePath: string) {
	let lastUpdated;
	try {
		lastUpdated =
			parseInt(
				spawn
					.sync('git', ['log', '-1', '--format=%at', path.basename(filePath)], {
						cwd: path.dirname(filePath)
					})
					.stdout.toString('utf-8'),
				10
			) * 1000;
	} catch {
		/* do not handle for now */
	}
	return lastUpdated;
}
