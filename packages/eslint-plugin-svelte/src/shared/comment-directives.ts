import type { AST } from 'svelte-eslint-parser';
import type { Linter } from 'eslint';
const COMPUTED = Symbol();
const ALL = Symbol();

type Define = {
	loc: AST.Position;
};
type Block = {
	loc: AST.Position;
	rule: (ruleId: string) => boolean;
	kind: 'enable' | 'disable';
	define: Define;
	targetRule: string | typeof ALL;
};
type Line = {
	line: number;
	rule: (ruleId: string) => boolean;
	define: Define;
};
export class CommentDirectives {
	private readonly reportUnusedDisableDirectives: boolean;

	private readonly ruleId: string;

	private readonly lineDisableDirectives = new Map<string | typeof COMPUTED, Map<number, Line[]>>();

	private readonly blockDirectives = new Map<string | typeof COMPUTED, Block[]>();

	public constructor(options: { reportUnusedDisableDirectives?: boolean; ruleId: string }) {
		this.ruleId = options.ruleId;
		this.reportUnusedDisableDirectives = Boolean(options?.reportUnusedDisableDirectives);
	}

	public filterMessages(messages: Linter.LintMessage[]): Linter.LintMessage[] {
		const { lineDisableDirectives, blockDirectives, reportUnusedDisableDirectives } = this;
		const usedDirectives = new Set<Line | Block>();
		if (reportUnusedDisableDirectives) {
			const allBlocks = [];
			for (const bs of blockDirectives.values()) {
				for (const b of bs) {
					allBlocks.push(b);
				}
			}

			const blockEnableDirectives = new Set<Block>();
			for (const block of allBlocks.sort((a, b) => comparePos(b.loc, a.loc))) {
				if (block.kind === 'enable') {
					if (block.targetRule === ALL) {
						blockEnableDirectives.clear();
					}
					blockEnableDirectives.add(block);
				} else if (block.kind === 'disable') {
					if (block.targetRule === ALL) {
						for (const b of blockEnableDirectives) {
							usedDirectives.add(b);
						}
						blockEnableDirectives.clear();
					} else {
						for (const b of [...blockEnableDirectives]) {
							if (block.targetRule === b.targetRule || b.targetRule === ALL) {
								usedDirectives.add(b);
								blockEnableDirectives.delete(b);
							}
						}
					}
				}
			}
		}

		let filteredMessages = messages.filter(isEnable);

		if (reportUnusedDisableDirectives) {
			const usedDirectiveKeys = new Set([...usedDirectives].map((d) => locToKey(d.define.loc)));
			filteredMessages = filteredMessages.filter((m) => {
				if (m.ruleId !== this.ruleId) {
					return true;
				}
				if (usedDirectiveKeys.has(messageToKey(m))) {
					return false;
				}
				return true;
			});
		}

		return filteredMessages;

		/** Checks wether given rule is enable */
		function isEnable(message: Linter.LintMessage) {
			if (!message.ruleId) {
				// Maybe fatal error
				return true;
			}

			for (const disableLines of getFromRule(lineDisableDirectives, message.ruleId)) {
				for (const disableLine of disableLines.get(message.line) ?? []) {
					if (!disableLine.rule(message.ruleId)) {
						continue;
					}
					usedDirectives.add(disableLine);
					return false;
				}
			}
			const blocks = getFromRule(blockDirectives, message.ruleId)
				.reduce((p, c) => p.concat(c), [])
				.sort((a, b) => comparePos(b.loc, a.loc));
			for (const block of blocks) {
				if (comparePos(message, block.loc) < 0) {
					continue;
				}
				if (!block.rule(message.ruleId)) {
					continue;
				}
				if (block.kind === 'enable') {
					return true;
				}
				// block.kind === "disable"
				usedDirectives.add(block);
				return false;
			}
			return true;
		}

		/** Compare locations */
		function comparePos(a: AST.Position, b: AST.Position) {
			return a.line - b.line || a.column - b.column;
		}
	}

	public disableLine(
		line: number,
		rule: string | ((ruleId: string) => boolean),
		define: Define
	): void {
		const key = typeof rule === 'string' ? rule : COMPUTED;

		let disableLines = this.lineDisableDirectives.get(key);
		if (!disableLines) {
			disableLines = new Map();
			this.lineDisableDirectives.set(key, disableLines);
		}
		let disableLine = disableLines.get(line);
		if (!disableLine) {
			disableLine = [];
			disableLines.set(line, disableLine);
		}

		const disable: Line = {
			line,
			rule: typeof rule === 'string' ? (id) => id === rule : rule,
			define
		};
		disableLine.push(disable);
	}

	public disableBlock(
		pos: AST.Position,
		rule: string | ((ruleId: string) => boolean),
		define: Define
	): void {
		this.block(pos, rule, define, 'disable');
	}

	public enableBlock(
		pos: AST.Position,
		rule: string | ((ruleId: string) => boolean),
		define: Define
	): void {
		this.block(pos, rule, define, 'enable');
	}

	private block(
		pos: AST.Position,
		rule: string | ((ruleId: string) => boolean),
		define: Define,
		kind: 'disable' | 'enable'
	): void {
		const key = typeof rule === 'string' ? rule : COMPUTED;
		let blocks = this.blockDirectives.get(key);
		if (!blocks) {
			blocks = [];
			this.blockDirectives.set(key, blocks);
		}

		const disable: Block = {
			loc: pos,
			rule: typeof rule === 'string' ? (id) => id === rule : rule,
			kind,
			targetRule: typeof rule === 'string' ? rule : ALL,
			define
		};
		blocks.push(disable);
	}
}

/** Get the list of directives from given rule  */
function getFromRule<E>(map: Map<string | typeof COMPUTED, E>, ruleId: string): E[] {
	return [map.get(ruleId), map.get(COMPUTED)].filter((a): a is E => Boolean(a));
}

/**
 * Gets the key of location
 */
function locToKey(location: AST.Position): string {
	return `line:${location.line},column${location.column}`;
}

/**
 * Gets the key of message location
 */
function messageToKey(message: Linter.LintMessage): string {
	return `line:${message.line},column${
		// -1 because +1 by ESLint's `report-translator`.
		message.column - 1
	}`;
}
