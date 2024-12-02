import type { AST } from 'svelte-eslint-parser';
import { createRule } from '../utils/index.js';
import type { SvelteStyleInterpolation, SvelteStyleRoot } from '../utils/css-utils/index.js';
import { parseStyleAttributeValue } from '../utils/css-utils/index.js';

export default createRule('no-dupe-style-properties', {
	meta: {
		docs: {
			description: 'disallow duplicate style properties',
			category: 'Possible Errors',
			recommended: true
		},
		schema: [],
		messages: {
			unexpected: "Duplicate property '{{name}}'."
		},
		type: 'problem'
	},
	create(context) {
		type StyleDecl = {
			prop: string;
			loc: AST.SourceLocation;
		};
		type StyleDeclSet = {
			decls: StyleDecl[];
		};

		return {
			SvelteStartTag(node: AST.SvelteStartTag) {
				const reported = new Set<StyleDecl>();
				const beforeDeclarations = new Map<string, StyleDecl>();
				for (const { decls } of iterateStyleDeclSetFromAttrs(node.attributes)) {
					for (const decl of decls) {
						const already = beforeDeclarations.get(decl.prop);
						if (already) {
							for (const report of [already, decl].filter((n) => !reported.has(n))) {
								context.report({
									node,
									loc: report.loc,
									messageId: 'unexpected',
									data: { name: report.prop }
								});
								reported.add(report);
							}
						}
					}
					for (const decl of decls) {
						beforeDeclarations.set(decl.prop, decl);
					}
				}
			}
		};

		/** Iterate the style decl set from attrs */
		function* iterateStyleDeclSetFromAttrs(
			attrs: AST.SvelteStartTag['attributes']
		): Iterable<StyleDeclSet> {
			for (const attr of attrs) {
				if (attr.type === 'SvelteStyleDirective') {
					yield {
						decls: [{ prop: attr.key.name.name, loc: attr.key.name.loc }]
					};
				} else if (attr.type === 'SvelteAttribute') {
					if (attr.key.name !== 'style') {
						continue;
					}
					const root = parseStyleAttributeValue(attr, context);
					if (!root) {
						continue;
					}
					yield* iterateStyleDeclSetFromStyleRoot(root);
				}
			}
		}

		/** Iterate the style decl set from style root */
		function* iterateStyleDeclSetFromStyleRoot<E extends SvelteStyleInterpolation>(
			root: SvelteStyleRoot<E>
		): Iterable<StyleDeclSet> {
			for (const child of root.nodes) {
				if (child.type === 'decl') {
					yield {
						decls: [
							{
								prop: child.prop.name,
								get loc() {
									return child.prop.loc;
								}
							}
						]
					};
				} else if (child.type === 'inline') {
					const decls: StyleDecl[] = [];
					for (const root of child.getAllInlineStyles().values()) {
						for (const set of iterateStyleDeclSetFromStyleRoot(root)) {
							decls.push(...set.decls);
						}
					}
					yield { decls };
				}
			}
		}
	}
});
