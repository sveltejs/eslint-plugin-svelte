import type { ASTNode, SourceCode } from '../../types.js';
import { isNotWhitespace } from './ast.js';
import type { AnyToken, IndentOptions, MaybeNode } from './commons.js';
import { isBeginningOfLine } from './commons.js';
import { getFirstAndLastTokens } from './commons.js';
const enum OffsetDataType {
	normal,
	align,
	start
}
type OffsetData =
	| {
			type: OffsetDataType.normal;
			base: number;
			offset: number;
			expectedIndent?: number;
	  }
	| {
			type: OffsetDataType.align;
			base: number;
			alignIndent: number;
			expectedIndent?: number;
	  }
	| {
			type: OffsetDataType.start;
			offset: number;
			expectedIndent?: number;
	  };

export class OffsetContext {
	private readonly sourceCode: SourceCode;

	private readonly options: IndentOptions;

	private readonly offsets = new Map<number, OffsetData>();

	private readonly ignoreRanges = new Map<number, number>();

	public constructor(arg: { sourceCode: SourceCode; options: IndentOptions }) {
		this.sourceCode = arg.sourceCode;
		this.options = arg.options;
	}

	/**
	 * Set offset to the given index.
	 */
	public setOffsetIndex(index: number, offset: number, base: number): void {
		if (index === base) {
			return;
		}
		this.offsets.set(index, {
			type: OffsetDataType.normal,
			base,
			offset
		});
	}

	/**
	 * Set align indent to the given index.
	 */
	private setAlignIndent(index: number, alignIndent: number, base: number): void {
		if (index === base) {
			return;
		}
		this.offsets.set(index, {
			type: OffsetDataType.align,
			base,
			alignIndent
		});
	}

	/**
	 * Set offset to the given tokens.
	 */
	public setOffsetToken(
		token: AnyToken | null | undefined | (AnyToken | null | undefined)[],
		offset: number,
		baseToken: AnyToken
	): void {
		if (!token) {
			return;
		}
		if (Array.isArray(token)) {
			for (const t of token) {
				this.setOffsetToken(t, offset, baseToken);
			}
			return;
		}
		this.setOffsetIndex(token.range[0], offset, baseToken.range[0]);
	}

	/**
	 * Copy offset to the given index from srcIndex.
	 */
	public copyOffset(index: number, srcIndex: number): void {
		const offsetData = this.offsets.get(srcIndex);
		if (!offsetData) {
			return;
		}
		if (offsetData.type === OffsetDataType.start) {
			this.setStartOffsetIndex(index, offsetData.offset);
		} else if (offsetData.type === OffsetDataType.align) {
			this.setAlignIndent(index, offsetData.alignIndent, offsetData.base);
		} else {
			this.setOffsetIndex(index, offsetData.offset, offsetData.base);
		}
	}

	/**
	 * Set start offset to the given index.
	 */
	public setStartOffsetIndex(index: number, offset: number): void {
		this.offsets.set(index, {
			type: OffsetDataType.start,
			offset
		});
	}

	/**
	 * Set start offset to the given token.
	 */
	public setStartOffsetToken(
		token: AnyToken | null | undefined | (AnyToken | null | undefined)[],
		offset: number
	): void {
		if (!token) {
			return;
		}
		if (Array.isArray(token)) {
			for (const t of token) {
				this.setStartOffsetToken(t, offset);
			}
			return;
		}
		this.setStartOffsetIndex(token.range[0], offset);
	}

	public setOffsetElementList(
		nodes: (ASTNode | AnyToken | MaybeNode | null | undefined)[],
		baseNodeOrToken: ASTNode | AnyToken | MaybeNode,
		lastNodeOrToken: ASTNode | AnyToken | MaybeNode | null,
		offset: number,
		align?: boolean
	): void {
		let setIndent: (token: AnyToken, baseToken: AnyToken) => void = (token, baseToken) =>
			this.setOffsetToken(token, offset, baseToken);
		if (align) {
			for (const n of nodes) {
				if (n) {
					if (!isBeginningOfLine(this.sourceCode, n)) {
						const startLoc = n.loc.start;
						const alignIndent =
							startLoc.column - /^\s*/u.exec(this.sourceCode.lines[startLoc.line - 1])![0].length;
						setIndent = (token, baseToken) =>
							this.setAlignIndent(token.range[0], alignIndent, baseToken.range[0]);
					}
					break;
				}
			}
		}
		this._setOffsetElementList(nodes, baseNodeOrToken, lastNodeOrToken, setIndent);
	}

	private _setOffsetElementList(
		nodes: (ASTNode | AnyToken | MaybeNode | null | undefined)[],
		baseNodeOrToken: ASTNode | AnyToken | MaybeNode,
		lastNodeOrToken: ASTNode | AnyToken | MaybeNode | null,
		setIndent: (token: AnyToken, baseToken: AnyToken) => void
	): void {
		const baseToken = this.sourceCode.getFirstToken(baseNodeOrToken);

		let prevToken = this.sourceCode.getLastToken(baseNodeOrToken);
		for (const node of nodes) {
			if (node == null) {
				continue;
			}
			const elementTokens = getFirstAndLastTokens(this.sourceCode, node, prevToken.range[1]);

			let t: AnyToken | null = prevToken;
			while (
				(t = this.sourceCode.getTokenAfter(t, {
					includeComments: true,
					filter: isNotWhitespace
				})) != null &&
				t.range[1] <= elementTokens.firstToken.range[0]
			) {
				setIndent(t, baseToken);
			}
			setIndent(elementTokens.firstToken, baseToken);

			prevToken = elementTokens.lastToken;
		}

		if (lastNodeOrToken) {
			const lastToken = this.sourceCode.getFirstToken(lastNodeOrToken);
			let t: AnyToken | null = prevToken;
			while (
				(t = this.sourceCode.getTokenAfter(t, {
					includeComments: true,
					filter: isNotWhitespace
				})) != null &&
				t.range[1] <= lastToken.range[0]
			) {
				setIndent(t, baseToken);
			}
			this.setOffsetToken(lastToken, 0, baseToken);
		}
	}

	/**
	 * Ignore range of the given node.
	 */
	public ignore(node: ASTNode): void {
		const range = node.range;
		const n = this.ignoreRanges.get(range[0]) ?? 0;
		this.ignoreRanges.set(range[0], Math.max(n, range[1]));
	}

	public getOffsetCalculator(): OffsetCalculator {
		// eslint-disable-next-line @typescript-eslint/no-use-before-define -- ignore
		return new OffsetCalculator({
			offsets: this.offsets,
			options: this.options,
			ignoreRanges: [...this.ignoreRanges]
		});
	}
}

export class OffsetCalculator {
	private readonly options: IndentOptions;

	private readonly offsets: Map<number, OffsetData>;

	private readonly ignoreRanges: [number, number][];

	public constructor(arg: {
		offsets: Map<number, OffsetData>;
		options: IndentOptions;
		ignoreRanges: [number, number][];
	}) {
		this.offsets = arg.offsets;
		this.options = arg.options;
		this.ignoreRanges = arg.ignoreRanges;
	}

	/**
	 * Calculate correct indentation of the given index.
	 */
	private getExpectedIndentFromIndex(index: number): number | null {
		const offsetInfo = this.offsets.get(index);
		if (offsetInfo == null) {
			return null;
		}
		if (offsetInfo.expectedIndent != null) {
			return offsetInfo.expectedIndent;
		}
		if (offsetInfo.type === OffsetDataType.start) {
			return offsetInfo.offset * this.options.indentSize;
		}
		const baseIndent = this.getExpectedIndentFromIndex(offsetInfo.base);
		if (baseIndent == null) {
			return null;
		}
		if (offsetInfo.type === OffsetDataType.align) {
			return baseIndent + offsetInfo.alignIndent;
		}
		return baseIndent + offsetInfo.offset * this.options.indentSize;
	}

	/**
	 * Calculate correct indentation of the given token.
	 */
	public getExpectedIndentFromToken(token: AnyToken): number | null {
		return this.getExpectedIndentFromIndex(token.range[0]);
	}

	/**
	 * Calculate correct indentation of the line of the given tokens.
	 */
	public getExpectedIndentFromTokens(tokens: AnyToken[]): null | number {
		for (const token of tokens) {
			const index = token.range[0];
			if (this.ignoreRanges.some(([f, t]) => f <= index && index < t)) {
				return null;
			}
			const expectedIndent = this.getExpectedIndentFromIndex(index);
			if (expectedIndent != null) {
				return expectedIndent;
			}
		}
		return null;
	}

	/** Save expected indent to give tokens */
	public saveExpectedIndent(tokens: AnyToken[], expectedIndent: number): void {
		for (const token of tokens) {
			const offsetInfo = this.offsets.get(token.range[0]);
			if (offsetInfo == null) {
				continue;
			}
			offsetInfo.expectedIndent = offsetInfo.expectedIndent ?? expectedIndent;
		}
	}
}
