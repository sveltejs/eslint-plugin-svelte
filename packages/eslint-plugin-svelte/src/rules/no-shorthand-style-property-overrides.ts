import type { AST } from 'svelte-eslint-parser';
import { createRule } from '../utils/index.js';
import type { SvelteStyleInterpolation, SvelteStyleRoot } from '../utils/css-utils/index.js';
import {
	getVendorPrefix,
	stripVendorPrefix,
	parseStyleAttributeValue,
	SHORTHAND_PROPERTIES
} from '../utils/css-utils/index.js';

export default createRule('no-shorthand-style-property-overrides', {
	meta: {
		docs: {
			description: 'disallow shorthand style properties that override related longhand properties',
			category: 'Possible Errors',
			recommended: true
		},
		schema: [],
		messages: {
			unexpected: "Unexpected shorthand '{{shorthand}}' after '{{original}}'."
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
				const beforeDeclarations = new Set<string>();
				for (const { decls } of iterateStyleDeclSetFromAttrs(node.attributes)) {
					for (const decl of decls) {
						const normalized = stripVendorPrefix(decl.prop);
						const prefix = getVendorPrefix(decl.prop);

						const longhandProps = SHORTHAND_PROPERTIES.get(normalized);
						if (!longhandProps) {
							continue;
						}

						for (const longhandProp of longhandProps) {
							const longhandPropWithPrefix = prefix + longhandProp;
							if (!beforeDeclarations.has(longhandPropWithPrefix)) {
								continue;
							}

							context.report({
								node,
								loc: decl.loc,
								messageId: 'unexpected',
								data: {
									shorthand: decl.prop,
									original: longhandPropWithPrefix
								}
							});
						}
					}
					for (const decl of decls) {
						beforeDeclarations.add(decl.prop);
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
