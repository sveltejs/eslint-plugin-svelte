// IMPORTANT!
// This file has been automatically generated,
// in order to update its content execute "pnpm run update"
//
// The information here can be calculated by calculating the type,
// but is pre-defined to avoid the computational cost.
//

import type { TSESTree, AST_NODE_TYPES } from '@typescript-eslint/types';
import type { AST } from 'svelte-eslint-parser';

export type ASTNode =
	| AST.SvelteNode
	| Exclude<Omit<TSESTree.Node, 'parent'>, { type: AST.SvelteNode['type'] }>;
export type ASTNodeWithParent =
	| (Exclude<ASTNode, AST.SvelteProgram> & { parent: ASTNodeWithParent })
	| AST.SvelteProgram;

export type ASTNodeListener = {
	AccessorProperty?: (node: TSESTree.AccessorProperty & ASTNodeWithParent) => void;
	'AccessorProperty:exit'?: (node: TSESTree.AccessorProperty & ASTNodeWithParent) => void;
	ArrayExpression?: (node: TSESTree.ArrayExpression & ASTNodeWithParent) => void;
	'ArrayExpression:exit'?: (node: TSESTree.ArrayExpression & ASTNodeWithParent) => void;
	ArrayPattern?: (node: TSESTree.ArrayPattern & ASTNodeWithParent) => void;
	'ArrayPattern:exit'?: (node: TSESTree.ArrayPattern & ASTNodeWithParent) => void;
	ArrowFunctionExpression?: (node: TSESTree.ArrowFunctionExpression & ASTNodeWithParent) => void;
	'ArrowFunctionExpression:exit'?: (
		node: TSESTree.ArrowFunctionExpression & ASTNodeWithParent
	) => void;
	AssignmentExpression?: (node: TSESTree.AssignmentExpression & ASTNodeWithParent) => void;
	'AssignmentExpression:exit'?: (node: TSESTree.AssignmentExpression & ASTNodeWithParent) => void;
	AssignmentPattern?: (node: TSESTree.AssignmentPattern & ASTNodeWithParent) => void;
	'AssignmentPattern:exit'?: (node: TSESTree.AssignmentPattern & ASTNodeWithParent) => void;
	AwaitExpression?: (node: TSESTree.AwaitExpression & ASTNodeWithParent) => void;
	'AwaitExpression:exit'?: (node: TSESTree.AwaitExpression & ASTNodeWithParent) => void;
	BinaryExpression?: (node: TSESTree.BinaryExpression & ASTNodeWithParent) => void;
	'BinaryExpression:exit'?: (node: TSESTree.BinaryExpression & ASTNodeWithParent) => void;
	BlockStatement?: (node: TSESTree.BlockStatement & ASTNodeWithParent) => void;
	'BlockStatement:exit'?: (node: TSESTree.BlockStatement & ASTNodeWithParent) => void;
	BreakStatement?: (node: TSESTree.BreakStatement & ASTNodeWithParent) => void;
	'BreakStatement:exit'?: (node: TSESTree.BreakStatement & ASTNodeWithParent) => void;
	CallExpression?: (node: TSESTree.CallExpression & ASTNodeWithParent) => void;
	'CallExpression:exit'?: (node: TSESTree.CallExpression & ASTNodeWithParent) => void;
	CatchClause?: (node: TSESTree.CatchClause & ASTNodeWithParent) => void;
	'CatchClause:exit'?: (node: TSESTree.CatchClause & ASTNodeWithParent) => void;
	ChainExpression?: (node: TSESTree.ChainExpression & ASTNodeWithParent) => void;
	'ChainExpression:exit'?: (node: TSESTree.ChainExpression & ASTNodeWithParent) => void;
	ClassBody?: (node: TSESTree.ClassBody & ASTNodeWithParent) => void;
	'ClassBody:exit'?: (node: TSESTree.ClassBody & ASTNodeWithParent) => void;
	ClassDeclaration?: (node: TSESTree.ClassDeclaration & ASTNodeWithParent) => void;
	'ClassDeclaration:exit'?: (node: TSESTree.ClassDeclaration & ASTNodeWithParent) => void;
	ClassExpression?: (node: TSESTree.ClassExpression & ASTNodeWithParent) => void;
	'ClassExpression:exit'?: (node: TSESTree.ClassExpression & ASTNodeWithParent) => void;
	ConditionalExpression?: (node: TSESTree.ConditionalExpression & ASTNodeWithParent) => void;
	'ConditionalExpression:exit'?: (node: TSESTree.ConditionalExpression & ASTNodeWithParent) => void;
	ContinueStatement?: (node: TSESTree.ContinueStatement & ASTNodeWithParent) => void;
	'ContinueStatement:exit'?: (node: TSESTree.ContinueStatement & ASTNodeWithParent) => void;
	DebuggerStatement?: (node: TSESTree.DebuggerStatement & ASTNodeWithParent) => void;
	'DebuggerStatement:exit'?: (node: TSESTree.DebuggerStatement & ASTNodeWithParent) => void;
	Decorator?: (node: TSESTree.Decorator & ASTNodeWithParent) => void;
	'Decorator:exit'?: (node: TSESTree.Decorator & ASTNodeWithParent) => void;
	DoWhileStatement?: (node: TSESTree.DoWhileStatement & ASTNodeWithParent) => void;
	'DoWhileStatement:exit'?: (node: TSESTree.DoWhileStatement & ASTNodeWithParent) => void;
	EmptyStatement?: (node: TSESTree.EmptyStatement & ASTNodeWithParent) => void;
	'EmptyStatement:exit'?: (node: TSESTree.EmptyStatement & ASTNodeWithParent) => void;
	ExportAllDeclaration?: (node: TSESTree.ExportAllDeclaration & ASTNodeWithParent) => void;
	'ExportAllDeclaration:exit'?: (node: TSESTree.ExportAllDeclaration & ASTNodeWithParent) => void;
	ExportDefaultDeclaration?: (node: TSESTree.ExportDefaultDeclaration & ASTNodeWithParent) => void;
	'ExportDefaultDeclaration:exit'?: (
		node: TSESTree.ExportDefaultDeclaration & ASTNodeWithParent
	) => void;
	ExportNamedDeclaration?: (node: TSESTree.ExportNamedDeclaration & ASTNodeWithParent) => void;
	'ExportNamedDeclaration:exit'?: (
		node: TSESTree.ExportNamedDeclaration & ASTNodeWithParent
	) => void;
	ExportSpecifier?: (node: TSESTree.ExportSpecifier & ASTNodeWithParent) => void;
	'ExportSpecifier:exit'?: (node: TSESTree.ExportSpecifier & ASTNodeWithParent) => void;
	ExpressionStatement?: (node: TSESTree.ExpressionStatement & ASTNodeWithParent) => void;
	'ExpressionStatement:exit'?: (node: TSESTree.ExpressionStatement & ASTNodeWithParent) => void;
	ForInStatement?: (node: TSESTree.ForInStatement & ASTNodeWithParent) => void;
	'ForInStatement:exit'?: (node: TSESTree.ForInStatement & ASTNodeWithParent) => void;
	ForOfStatement?: (node: TSESTree.ForOfStatement & ASTNodeWithParent) => void;
	'ForOfStatement:exit'?: (node: TSESTree.ForOfStatement & ASTNodeWithParent) => void;
	ForStatement?: (node: TSESTree.ForStatement & ASTNodeWithParent) => void;
	'ForStatement:exit'?: (node: TSESTree.ForStatement & ASTNodeWithParent) => void;
	FunctionDeclaration?: (node: TSESTree.FunctionDeclaration & ASTNodeWithParent) => void;
	'FunctionDeclaration:exit'?: (node: TSESTree.FunctionDeclaration & ASTNodeWithParent) => void;
	FunctionExpression?: (node: TSESTree.FunctionExpression & ASTNodeWithParent) => void;
	'FunctionExpression:exit'?: (node: TSESTree.FunctionExpression & ASTNodeWithParent) => void;
	Identifier?: (node: TSESTree.Identifier & ASTNodeWithParent) => void;
	'Identifier:exit'?: (node: TSESTree.Identifier & ASTNodeWithParent) => void;
	IfStatement?: (node: TSESTree.IfStatement & ASTNodeWithParent) => void;
	'IfStatement:exit'?: (node: TSESTree.IfStatement & ASTNodeWithParent) => void;
	ImportAttribute?: (node: TSESTree.ImportAttribute & ASTNodeWithParent) => void;
	'ImportAttribute:exit'?: (node: TSESTree.ImportAttribute & ASTNodeWithParent) => void;
	ImportDeclaration?: (node: TSESTree.ImportDeclaration & ASTNodeWithParent) => void;
	'ImportDeclaration:exit'?: (node: TSESTree.ImportDeclaration & ASTNodeWithParent) => void;
	ImportDefaultSpecifier?: (node: TSESTree.ImportDefaultSpecifier & ASTNodeWithParent) => void;
	'ImportDefaultSpecifier:exit'?: (
		node: TSESTree.ImportDefaultSpecifier & ASTNodeWithParent
	) => void;
	ImportExpression?: (node: TSESTree.ImportExpression & ASTNodeWithParent) => void;
	'ImportExpression:exit'?: (node: TSESTree.ImportExpression & ASTNodeWithParent) => void;
	ImportNamespaceSpecifier?: (node: TSESTree.ImportNamespaceSpecifier & ASTNodeWithParent) => void;
	'ImportNamespaceSpecifier:exit'?: (
		node: TSESTree.ImportNamespaceSpecifier & ASTNodeWithParent
	) => void;
	ImportSpecifier?: (node: TSESTree.ImportSpecifier & ASTNodeWithParent) => void;
	'ImportSpecifier:exit'?: (node: TSESTree.ImportSpecifier & ASTNodeWithParent) => void;
	JSXAttribute?: (node: TSESTree.JSXAttribute & ASTNodeWithParent) => void;
	'JSXAttribute:exit'?: (node: TSESTree.JSXAttribute & ASTNodeWithParent) => void;
	JSXClosingElement?: (node: TSESTree.JSXClosingElement & ASTNodeWithParent) => void;
	'JSXClosingElement:exit'?: (node: TSESTree.JSXClosingElement & ASTNodeWithParent) => void;
	JSXClosingFragment?: (node: TSESTree.JSXClosingFragment & ASTNodeWithParent) => void;
	'JSXClosingFragment:exit'?: (node: TSESTree.JSXClosingFragment & ASTNodeWithParent) => void;
	JSXElement?: (node: TSESTree.JSXElement & ASTNodeWithParent) => void;
	'JSXElement:exit'?: (node: TSESTree.JSXElement & ASTNodeWithParent) => void;
	JSXEmptyExpression?: (node: TSESTree.JSXEmptyExpression & ASTNodeWithParent) => void;
	'JSXEmptyExpression:exit'?: (node: TSESTree.JSXEmptyExpression & ASTNodeWithParent) => void;
	JSXExpressionContainer?: (node: TSESTree.JSXExpressionContainer & ASTNodeWithParent) => void;
	'JSXExpressionContainer:exit'?: (
		node: TSESTree.JSXExpressionContainer & ASTNodeWithParent
	) => void;
	JSXFragment?: (node: TSESTree.JSXFragment & ASTNodeWithParent) => void;
	'JSXFragment:exit'?: (node: TSESTree.JSXFragment & ASTNodeWithParent) => void;
	JSXIdentifier?: (node: TSESTree.JSXIdentifier & ASTNodeWithParent) => void;
	'JSXIdentifier:exit'?: (node: TSESTree.JSXIdentifier & ASTNodeWithParent) => void;
	JSXMemberExpression?: (node: TSESTree.JSXMemberExpression & ASTNodeWithParent) => void;
	'JSXMemberExpression:exit'?: (node: TSESTree.JSXMemberExpression & ASTNodeWithParent) => void;
	JSXNamespacedName?: (node: TSESTree.JSXNamespacedName & ASTNodeWithParent) => void;
	'JSXNamespacedName:exit'?: (node: TSESTree.JSXNamespacedName & ASTNodeWithParent) => void;
	JSXOpeningElement?: (node: TSESTree.JSXOpeningElement & ASTNodeWithParent) => void;
	'JSXOpeningElement:exit'?: (node: TSESTree.JSXOpeningElement & ASTNodeWithParent) => void;
	JSXOpeningFragment?: (node: TSESTree.JSXOpeningFragment & ASTNodeWithParent) => void;
	'JSXOpeningFragment:exit'?: (node: TSESTree.JSXOpeningFragment & ASTNodeWithParent) => void;
	JSXSpreadAttribute?: (node: TSESTree.JSXSpreadAttribute & ASTNodeWithParent) => void;
	'JSXSpreadAttribute:exit'?: (node: TSESTree.JSXSpreadAttribute & ASTNodeWithParent) => void;
	JSXSpreadChild?: (node: TSESTree.JSXSpreadChild & ASTNodeWithParent) => void;
	'JSXSpreadChild:exit'?: (node: TSESTree.JSXSpreadChild & ASTNodeWithParent) => void;
	JSXText?: (node: TSESTree.JSXText & ASTNodeWithParent) => void;
	'JSXText:exit'?: (node: TSESTree.JSXText & ASTNodeWithParent) => void;
	LabeledStatement?: (node: TSESTree.LabeledStatement & ASTNodeWithParent) => void;
	'LabeledStatement:exit'?: (node: TSESTree.LabeledStatement & ASTNodeWithParent) => void;
	Literal?: (node: TSESTree.Literal & ASTNodeWithParent) => void;
	'Literal:exit'?: (node: TSESTree.Literal & ASTNodeWithParent) => void;
	LogicalExpression?: (node: TSESTree.LogicalExpression & ASTNodeWithParent) => void;
	'LogicalExpression:exit'?: (node: TSESTree.LogicalExpression & ASTNodeWithParent) => void;
	MemberExpression?: (node: TSESTree.MemberExpression & ASTNodeWithParent) => void;
	'MemberExpression:exit'?: (node: TSESTree.MemberExpression & ASTNodeWithParent) => void;
	MetaProperty?: (node: TSESTree.MetaProperty & ASTNodeWithParent) => void;
	'MetaProperty:exit'?: (node: TSESTree.MetaProperty & ASTNodeWithParent) => void;
	MethodDefinition?: (node: TSESTree.MethodDefinition & ASTNodeWithParent) => void;
	'MethodDefinition:exit'?: (node: TSESTree.MethodDefinition & ASTNodeWithParent) => void;
	NewExpression?: (node: TSESTree.NewExpression & ASTNodeWithParent) => void;
	'NewExpression:exit'?: (node: TSESTree.NewExpression & ASTNodeWithParent) => void;
	ObjectExpression?: (node: TSESTree.ObjectExpression & ASTNodeWithParent) => void;
	'ObjectExpression:exit'?: (node: TSESTree.ObjectExpression & ASTNodeWithParent) => void;
	ObjectPattern?: (node: TSESTree.ObjectPattern & ASTNodeWithParent) => void;
	'ObjectPattern:exit'?: (node: TSESTree.ObjectPattern & ASTNodeWithParent) => void;
	PrivateIdentifier?: (node: TSESTree.PrivateIdentifier & ASTNodeWithParent) => void;
	'PrivateIdentifier:exit'?: (node: TSESTree.PrivateIdentifier & ASTNodeWithParent) => void;
	Property?: (node: TSESTree.Property & ASTNodeWithParent) => void;
	'Property:exit'?: (node: TSESTree.Property & ASTNodeWithParent) => void;
	PropertyDefinition?: (node: TSESTree.PropertyDefinition & ASTNodeWithParent) => void;
	'PropertyDefinition:exit'?: (node: TSESTree.PropertyDefinition & ASTNodeWithParent) => void;
	RestElement?: (node: TSESTree.RestElement & ASTNodeWithParent) => void;
	'RestElement:exit'?: (node: TSESTree.RestElement & ASTNodeWithParent) => void;
	ReturnStatement?: (node: TSESTree.ReturnStatement & ASTNodeWithParent) => void;
	'ReturnStatement:exit'?: (node: TSESTree.ReturnStatement & ASTNodeWithParent) => void;
	SequenceExpression?: (node: TSESTree.SequenceExpression & ASTNodeWithParent) => void;
	'SequenceExpression:exit'?: (node: TSESTree.SequenceExpression & ASTNodeWithParent) => void;
	SpreadElement?: (node: TSESTree.SpreadElement & ASTNodeWithParent) => void;
	'SpreadElement:exit'?: (node: TSESTree.SpreadElement & ASTNodeWithParent) => void;
	StaticBlock?: (node: TSESTree.StaticBlock & ASTNodeWithParent) => void;
	'StaticBlock:exit'?: (node: TSESTree.StaticBlock & ASTNodeWithParent) => void;
	Super?: (node: TSESTree.Super & ASTNodeWithParent) => void;
	'Super:exit'?: (node: TSESTree.Super & ASTNodeWithParent) => void;
	SwitchCase?: (node: TSESTree.SwitchCase & ASTNodeWithParent) => void;
	'SwitchCase:exit'?: (node: TSESTree.SwitchCase & ASTNodeWithParent) => void;
	SwitchStatement?: (node: TSESTree.SwitchStatement & ASTNodeWithParent) => void;
	'SwitchStatement:exit'?: (node: TSESTree.SwitchStatement & ASTNodeWithParent) => void;
	TaggedTemplateExpression?: (node: TSESTree.TaggedTemplateExpression & ASTNodeWithParent) => void;
	'TaggedTemplateExpression:exit'?: (
		node: TSESTree.TaggedTemplateExpression & ASTNodeWithParent
	) => void;
	TemplateElement?: (node: TSESTree.TemplateElement & ASTNodeWithParent) => void;
	'TemplateElement:exit'?: (node: TSESTree.TemplateElement & ASTNodeWithParent) => void;
	TemplateLiteral?: (node: TSESTree.TemplateLiteral & ASTNodeWithParent) => void;
	'TemplateLiteral:exit'?: (node: TSESTree.TemplateLiteral & ASTNodeWithParent) => void;
	ThisExpression?: (node: TSESTree.ThisExpression & ASTNodeWithParent) => void;
	'ThisExpression:exit'?: (node: TSESTree.ThisExpression & ASTNodeWithParent) => void;
	ThrowStatement?: (node: TSESTree.ThrowStatement & ASTNodeWithParent) => void;
	'ThrowStatement:exit'?: (node: TSESTree.ThrowStatement & ASTNodeWithParent) => void;
	TryStatement?: (node: TSESTree.TryStatement & ASTNodeWithParent) => void;
	'TryStatement:exit'?: (node: TSESTree.TryStatement & ASTNodeWithParent) => void;
	UnaryExpression?: (node: TSESTree.UnaryExpression & ASTNodeWithParent) => void;
	'UnaryExpression:exit'?: (node: TSESTree.UnaryExpression & ASTNodeWithParent) => void;
	UpdateExpression?: (node: TSESTree.UpdateExpression & ASTNodeWithParent) => void;
	'UpdateExpression:exit'?: (node: TSESTree.UpdateExpression & ASTNodeWithParent) => void;
	VariableDeclaration?: (node: TSESTree.VariableDeclaration & ASTNodeWithParent) => void;
	'VariableDeclaration:exit'?: (node: TSESTree.VariableDeclaration & ASTNodeWithParent) => void;
	VariableDeclarator?: (node: TSESTree.VariableDeclarator & ASTNodeWithParent) => void;
	'VariableDeclarator:exit'?: (node: TSESTree.VariableDeclarator & ASTNodeWithParent) => void;
	WhileStatement?: (node: TSESTree.WhileStatement & ASTNodeWithParent) => void;
	'WhileStatement:exit'?: (node: TSESTree.WhileStatement & ASTNodeWithParent) => void;
	WithStatement?: (node: TSESTree.WithStatement & ASTNodeWithParent) => void;
	'WithStatement:exit'?: (node: TSESTree.WithStatement & ASTNodeWithParent) => void;
	YieldExpression?: (node: TSESTree.YieldExpression & ASTNodeWithParent) => void;
	'YieldExpression:exit'?: (node: TSESTree.YieldExpression & ASTNodeWithParent) => void;
	TSAbstractAccessorProperty?: (
		node: TSESTree.TSAbstractAccessorProperty & ASTNodeWithParent
	) => void;
	'TSAbstractAccessorProperty:exit'?: (
		node: TSESTree.TSAbstractAccessorProperty & ASTNodeWithParent
	) => void;
	TSAbstractKeyword?: (node: TSESTree.TSAbstractKeyword & ASTNodeWithParent) => void;
	'TSAbstractKeyword:exit'?: (node: TSESTree.TSAbstractKeyword & ASTNodeWithParent) => void;
	TSAbstractMethodDefinition?: (
		node: TSESTree.TSAbstractMethodDefinition & ASTNodeWithParent
	) => void;
	'TSAbstractMethodDefinition:exit'?: (
		node: TSESTree.TSAbstractMethodDefinition & ASTNodeWithParent
	) => void;
	TSAbstractPropertyDefinition?: (
		node: TSESTree.TSAbstractPropertyDefinition & ASTNodeWithParent
	) => void;
	'TSAbstractPropertyDefinition:exit'?: (
		node: TSESTree.TSAbstractPropertyDefinition & ASTNodeWithParent
	) => void;
	TSAnyKeyword?: (node: TSESTree.TSAnyKeyword & ASTNodeWithParent) => void;
	'TSAnyKeyword:exit'?: (node: TSESTree.TSAnyKeyword & ASTNodeWithParent) => void;
	TSArrayType?: (node: TSESTree.TSArrayType & ASTNodeWithParent) => void;
	'TSArrayType:exit'?: (node: TSESTree.TSArrayType & ASTNodeWithParent) => void;
	TSAsExpression?: (node: TSESTree.TSAsExpression & ASTNodeWithParent) => void;
	'TSAsExpression:exit'?: (node: TSESTree.TSAsExpression & ASTNodeWithParent) => void;
	TSAsyncKeyword?: (node: TSESTree.TSAsyncKeyword & ASTNodeWithParent) => void;
	'TSAsyncKeyword:exit'?: (node: TSESTree.TSAsyncKeyword & ASTNodeWithParent) => void;
	TSBigIntKeyword?: (node: TSESTree.TSBigIntKeyword & ASTNodeWithParent) => void;
	'TSBigIntKeyword:exit'?: (node: TSESTree.TSBigIntKeyword & ASTNodeWithParent) => void;
	TSBooleanKeyword?: (node: TSESTree.TSBooleanKeyword & ASTNodeWithParent) => void;
	'TSBooleanKeyword:exit'?: (node: TSESTree.TSBooleanKeyword & ASTNodeWithParent) => void;
	TSCallSignatureDeclaration?: (
		node: TSESTree.TSCallSignatureDeclaration & ASTNodeWithParent
	) => void;
	'TSCallSignatureDeclaration:exit'?: (
		node: TSESTree.TSCallSignatureDeclaration & ASTNodeWithParent
	) => void;
	TSClassImplements?: (node: TSESTree.TSClassImplements & ASTNodeWithParent) => void;
	'TSClassImplements:exit'?: (node: TSESTree.TSClassImplements & ASTNodeWithParent) => void;
	TSConditionalType?: (node: TSESTree.TSConditionalType & ASTNodeWithParent) => void;
	'TSConditionalType:exit'?: (node: TSESTree.TSConditionalType & ASTNodeWithParent) => void;
	TSConstructorType?: (node: TSESTree.TSConstructorType & ASTNodeWithParent) => void;
	'TSConstructorType:exit'?: (node: TSESTree.TSConstructorType & ASTNodeWithParent) => void;
	TSConstructSignatureDeclaration?: (
		node: TSESTree.TSConstructSignatureDeclaration & ASTNodeWithParent
	) => void;
	'TSConstructSignatureDeclaration:exit'?: (
		node: TSESTree.TSConstructSignatureDeclaration & ASTNodeWithParent
	) => void;
	TSDeclareFunction?: (node: TSESTree.TSDeclareFunction & ASTNodeWithParent) => void;
	'TSDeclareFunction:exit'?: (node: TSESTree.TSDeclareFunction & ASTNodeWithParent) => void;
	TSDeclareKeyword?: (node: TSESTree.TSDeclareKeyword & ASTNodeWithParent) => void;
	'TSDeclareKeyword:exit'?: (node: TSESTree.TSDeclareKeyword & ASTNodeWithParent) => void;
	TSEmptyBodyFunctionExpression?: (
		node: TSESTree.TSEmptyBodyFunctionExpression & ASTNodeWithParent
	) => void;
	'TSEmptyBodyFunctionExpression:exit'?: (
		node: TSESTree.TSEmptyBodyFunctionExpression & ASTNodeWithParent
	) => void;
	TSEnumBody?: (node: TSESTree.TSEnumBody & ASTNodeWithParent) => void;
	'TSEnumBody:exit'?: (node: TSESTree.TSEnumBody & ASTNodeWithParent) => void;
	TSEnumDeclaration?: (node: TSESTree.TSEnumDeclaration & ASTNodeWithParent) => void;
	'TSEnumDeclaration:exit'?: (node: TSESTree.TSEnumDeclaration & ASTNodeWithParent) => void;
	TSEnumMember?: (node: TSESTree.TSEnumMember & ASTNodeWithParent) => void;
	'TSEnumMember:exit'?: (node: TSESTree.TSEnumMember & ASTNodeWithParent) => void;
	TSExportAssignment?: (node: TSESTree.TSExportAssignment & ASTNodeWithParent) => void;
	'TSExportAssignment:exit'?: (node: TSESTree.TSExportAssignment & ASTNodeWithParent) => void;
	TSExportKeyword?: (node: TSESTree.TSExportKeyword & ASTNodeWithParent) => void;
	'TSExportKeyword:exit'?: (node: TSESTree.TSExportKeyword & ASTNodeWithParent) => void;
	TSExternalModuleReference?: (
		node: TSESTree.TSExternalModuleReference & ASTNodeWithParent
	) => void;
	'TSExternalModuleReference:exit'?: (
		node: TSESTree.TSExternalModuleReference & ASTNodeWithParent
	) => void;
	TSFunctionType?: (node: TSESTree.TSFunctionType & ASTNodeWithParent) => void;
	'TSFunctionType:exit'?: (node: TSESTree.TSFunctionType & ASTNodeWithParent) => void;
	TSImportEqualsDeclaration?: (
		node: TSESTree.TSImportEqualsDeclaration & ASTNodeWithParent
	) => void;
	'TSImportEqualsDeclaration:exit'?: (
		node: TSESTree.TSImportEqualsDeclaration & ASTNodeWithParent
	) => void;
	TSImportType?: (node: TSESTree.TSImportType & ASTNodeWithParent) => void;
	'TSImportType:exit'?: (node: TSESTree.TSImportType & ASTNodeWithParent) => void;
	TSIndexedAccessType?: (node: TSESTree.TSIndexedAccessType & ASTNodeWithParent) => void;
	'TSIndexedAccessType:exit'?: (node: TSESTree.TSIndexedAccessType & ASTNodeWithParent) => void;
	TSIndexSignature?: (node: TSESTree.TSIndexSignature & ASTNodeWithParent) => void;
	'TSIndexSignature:exit'?: (node: TSESTree.TSIndexSignature & ASTNodeWithParent) => void;
	TSInferType?: (node: TSESTree.TSInferType & ASTNodeWithParent) => void;
	'TSInferType:exit'?: (node: TSESTree.TSInferType & ASTNodeWithParent) => void;
	TSInstantiationExpression?: (
		node: TSESTree.TSInstantiationExpression & ASTNodeWithParent
	) => void;
	'TSInstantiationExpression:exit'?: (
		node: TSESTree.TSInstantiationExpression & ASTNodeWithParent
	) => void;
	TSInterfaceBody?: (node: TSESTree.TSInterfaceBody & ASTNodeWithParent) => void;
	'TSInterfaceBody:exit'?: (node: TSESTree.TSInterfaceBody & ASTNodeWithParent) => void;
	TSInterfaceDeclaration?: (node: TSESTree.TSInterfaceDeclaration & ASTNodeWithParent) => void;
	'TSInterfaceDeclaration:exit'?: (
		node: TSESTree.TSInterfaceDeclaration & ASTNodeWithParent
	) => void;
	TSInterfaceHeritage?: (node: TSESTree.TSInterfaceHeritage & ASTNodeWithParent) => void;
	'TSInterfaceHeritage:exit'?: (node: TSESTree.TSInterfaceHeritage & ASTNodeWithParent) => void;
	TSIntersectionType?: (node: TSESTree.TSIntersectionType & ASTNodeWithParent) => void;
	'TSIntersectionType:exit'?: (node: TSESTree.TSIntersectionType & ASTNodeWithParent) => void;
	TSIntrinsicKeyword?: (
		node: TSESTree.Node & { type: AST_NODE_TYPES.TSIntrinsicKeyword } & ASTNodeWithParent
	) => void;
	'TSIntrinsicKeyword:exit'?: (
		node: TSESTree.Node & { type: AST_NODE_TYPES.TSIntrinsicKeyword } & ASTNodeWithParent
	) => void;
	TSLiteralType?: (node: TSESTree.TSLiteralType & ASTNodeWithParent) => void;
	'TSLiteralType:exit'?: (node: TSESTree.TSLiteralType & ASTNodeWithParent) => void;
	TSMappedType?: (node: TSESTree.TSMappedType & ASTNodeWithParent) => void;
	'TSMappedType:exit'?: (node: TSESTree.TSMappedType & ASTNodeWithParent) => void;
	TSMethodSignature?: (node: TSESTree.TSMethodSignature & ASTNodeWithParent) => void;
	'TSMethodSignature:exit'?: (node: TSESTree.TSMethodSignature & ASTNodeWithParent) => void;
	TSModuleBlock?: (node: TSESTree.TSModuleBlock & ASTNodeWithParent) => void;
	'TSModuleBlock:exit'?: (node: TSESTree.TSModuleBlock & ASTNodeWithParent) => void;
	TSModuleDeclaration?: (node: TSESTree.TSModuleDeclaration & ASTNodeWithParent) => void;
	'TSModuleDeclaration:exit'?: (node: TSESTree.TSModuleDeclaration & ASTNodeWithParent) => void;
	TSNamedTupleMember?: (node: TSESTree.TSNamedTupleMember & ASTNodeWithParent) => void;
	'TSNamedTupleMember:exit'?: (node: TSESTree.TSNamedTupleMember & ASTNodeWithParent) => void;
	TSNamespaceExportDeclaration?: (
		node: TSESTree.TSNamespaceExportDeclaration & ASTNodeWithParent
	) => void;
	'TSNamespaceExportDeclaration:exit'?: (
		node: TSESTree.TSNamespaceExportDeclaration & ASTNodeWithParent
	) => void;
	TSNeverKeyword?: (node: TSESTree.TSNeverKeyword & ASTNodeWithParent) => void;
	'TSNeverKeyword:exit'?: (node: TSESTree.TSNeverKeyword & ASTNodeWithParent) => void;
	TSNonNullExpression?: (node: TSESTree.TSNonNullExpression & ASTNodeWithParent) => void;
	'TSNonNullExpression:exit'?: (node: TSESTree.TSNonNullExpression & ASTNodeWithParent) => void;
	TSNullKeyword?: (node: TSESTree.TSNullKeyword & ASTNodeWithParent) => void;
	'TSNullKeyword:exit'?: (node: TSESTree.TSNullKeyword & ASTNodeWithParent) => void;
	TSNumberKeyword?: (node: TSESTree.TSNumberKeyword & ASTNodeWithParent) => void;
	'TSNumberKeyword:exit'?: (node: TSESTree.TSNumberKeyword & ASTNodeWithParent) => void;
	TSObjectKeyword?: (node: TSESTree.TSObjectKeyword & ASTNodeWithParent) => void;
	'TSObjectKeyword:exit'?: (node: TSESTree.TSObjectKeyword & ASTNodeWithParent) => void;
	TSOptionalType?: (node: TSESTree.TSOptionalType & ASTNodeWithParent) => void;
	'TSOptionalType:exit'?: (node: TSESTree.TSOptionalType & ASTNodeWithParent) => void;
	TSParameterProperty?: (node: TSESTree.TSParameterProperty & ASTNodeWithParent) => void;
	'TSParameterProperty:exit'?: (node: TSESTree.TSParameterProperty & ASTNodeWithParent) => void;
	TSPrivateKeyword?: (node: TSESTree.TSPrivateKeyword & ASTNodeWithParent) => void;
	'TSPrivateKeyword:exit'?: (node: TSESTree.TSPrivateKeyword & ASTNodeWithParent) => void;
	TSPropertySignature?: (node: TSESTree.TSPropertySignature & ASTNodeWithParent) => void;
	'TSPropertySignature:exit'?: (node: TSESTree.TSPropertySignature & ASTNodeWithParent) => void;
	TSProtectedKeyword?: (node: TSESTree.TSProtectedKeyword & ASTNodeWithParent) => void;
	'TSProtectedKeyword:exit'?: (node: TSESTree.TSProtectedKeyword & ASTNodeWithParent) => void;
	TSPublicKeyword?: (node: TSESTree.TSPublicKeyword & ASTNodeWithParent) => void;
	'TSPublicKeyword:exit'?: (node: TSESTree.TSPublicKeyword & ASTNodeWithParent) => void;
	TSQualifiedName?: (node: TSESTree.TSQualifiedName & ASTNodeWithParent) => void;
	'TSQualifiedName:exit'?: (node: TSESTree.TSQualifiedName & ASTNodeWithParent) => void;
	TSReadonlyKeyword?: (node: TSESTree.TSReadonlyKeyword & ASTNodeWithParent) => void;
	'TSReadonlyKeyword:exit'?: (node: TSESTree.TSReadonlyKeyword & ASTNodeWithParent) => void;
	TSRestType?: (node: TSESTree.TSRestType & ASTNodeWithParent) => void;
	'TSRestType:exit'?: (node: TSESTree.TSRestType & ASTNodeWithParent) => void;
	TSSatisfiesExpression?: (node: TSESTree.TSSatisfiesExpression & ASTNodeWithParent) => void;
	'TSSatisfiesExpression:exit'?: (node: TSESTree.TSSatisfiesExpression & ASTNodeWithParent) => void;
	TSStaticKeyword?: (node: TSESTree.TSStaticKeyword & ASTNodeWithParent) => void;
	'TSStaticKeyword:exit'?: (node: TSESTree.TSStaticKeyword & ASTNodeWithParent) => void;
	TSStringKeyword?: (node: TSESTree.TSStringKeyword & ASTNodeWithParent) => void;
	'TSStringKeyword:exit'?: (node: TSESTree.TSStringKeyword & ASTNodeWithParent) => void;
	TSSymbolKeyword?: (node: TSESTree.TSSymbolKeyword & ASTNodeWithParent) => void;
	'TSSymbolKeyword:exit'?: (node: TSESTree.TSSymbolKeyword & ASTNodeWithParent) => void;
	TSTemplateLiteralType?: (node: TSESTree.TSTemplateLiteralType & ASTNodeWithParent) => void;
	'TSTemplateLiteralType:exit'?: (node: TSESTree.TSTemplateLiteralType & ASTNodeWithParent) => void;
	TSThisType?: (node: TSESTree.TSThisType & ASTNodeWithParent) => void;
	'TSThisType:exit'?: (node: TSESTree.TSThisType & ASTNodeWithParent) => void;
	TSTupleType?: (node: TSESTree.TSTupleType & ASTNodeWithParent) => void;
	'TSTupleType:exit'?: (node: TSESTree.TSTupleType & ASTNodeWithParent) => void;
	TSTypeAliasDeclaration?: (node: TSESTree.TSTypeAliasDeclaration & ASTNodeWithParent) => void;
	'TSTypeAliasDeclaration:exit'?: (
		node: TSESTree.TSTypeAliasDeclaration & ASTNodeWithParent
	) => void;
	TSTypeAnnotation?: (node: TSESTree.TSTypeAnnotation & ASTNodeWithParent) => void;
	'TSTypeAnnotation:exit'?: (node: TSESTree.TSTypeAnnotation & ASTNodeWithParent) => void;
	TSTypeAssertion?: (node: TSESTree.TSTypeAssertion & ASTNodeWithParent) => void;
	'TSTypeAssertion:exit'?: (node: TSESTree.TSTypeAssertion & ASTNodeWithParent) => void;
	TSTypeLiteral?: (node: TSESTree.TSTypeLiteral & ASTNodeWithParent) => void;
	'TSTypeLiteral:exit'?: (node: TSESTree.TSTypeLiteral & ASTNodeWithParent) => void;
	TSTypeOperator?: (node: TSESTree.TSTypeOperator & ASTNodeWithParent) => void;
	'TSTypeOperator:exit'?: (node: TSESTree.TSTypeOperator & ASTNodeWithParent) => void;
	TSTypeParameter?: (node: TSESTree.TSTypeParameter & ASTNodeWithParent) => void;
	'TSTypeParameter:exit'?: (node: TSESTree.TSTypeParameter & ASTNodeWithParent) => void;
	TSTypeParameterDeclaration?: (
		node: TSESTree.TSTypeParameterDeclaration & ASTNodeWithParent
	) => void;
	'TSTypeParameterDeclaration:exit'?: (
		node: TSESTree.TSTypeParameterDeclaration & ASTNodeWithParent
	) => void;
	TSTypeParameterInstantiation?: (
		node: TSESTree.TSTypeParameterInstantiation & ASTNodeWithParent
	) => void;
	'TSTypeParameterInstantiation:exit'?: (
		node: TSESTree.TSTypeParameterInstantiation & ASTNodeWithParent
	) => void;
	TSTypePredicate?: (node: TSESTree.TSTypePredicate & ASTNodeWithParent) => void;
	'TSTypePredicate:exit'?: (node: TSESTree.TSTypePredicate & ASTNodeWithParent) => void;
	TSTypeQuery?: (node: TSESTree.TSTypeQuery & ASTNodeWithParent) => void;
	'TSTypeQuery:exit'?: (node: TSESTree.TSTypeQuery & ASTNodeWithParent) => void;
	TSTypeReference?: (node: TSESTree.TSTypeReference & ASTNodeWithParent) => void;
	'TSTypeReference:exit'?: (node: TSESTree.TSTypeReference & ASTNodeWithParent) => void;
	TSUndefinedKeyword?: (node: TSESTree.TSUndefinedKeyword & ASTNodeWithParent) => void;
	'TSUndefinedKeyword:exit'?: (node: TSESTree.TSUndefinedKeyword & ASTNodeWithParent) => void;
	TSUnionType?: (node: TSESTree.TSUnionType & ASTNodeWithParent) => void;
	'TSUnionType:exit'?: (node: TSESTree.TSUnionType & ASTNodeWithParent) => void;
	TSUnknownKeyword?: (node: TSESTree.TSUnknownKeyword & ASTNodeWithParent) => void;
	'TSUnknownKeyword:exit'?: (node: TSESTree.TSUnknownKeyword & ASTNodeWithParent) => void;
	TSVoidKeyword?: (node: TSESTree.TSVoidKeyword & ASTNodeWithParent) => void;
	'TSVoidKeyword:exit'?: (node: TSESTree.TSVoidKeyword & ASTNodeWithParent) => void;
	Program?: (node: AST.SvelteProgram & ASTNodeWithParent) => void;
	'Program:exit'?: (node: AST.SvelteProgram & ASTNodeWithParent) => void;
	SvelteScriptElement?: (node: AST.SvelteScriptElement & ASTNodeWithParent) => void;
	'SvelteScriptElement:exit'?: (node: AST.SvelteScriptElement & ASTNodeWithParent) => void;
	SvelteStyleElement?: (node: AST.SvelteStyleElement & ASTNodeWithParent) => void;
	'SvelteStyleElement:exit'?: (node: AST.SvelteStyleElement & ASTNodeWithParent) => void;
	SvelteElement?: (node: AST.SvelteElement & ASTNodeWithParent) => void;
	'SvelteElement:exit'?: (node: AST.SvelteElement & ASTNodeWithParent) => void;
	SvelteStartTag?: (node: AST.SvelteStartTag & ASTNodeWithParent) => void;
	'SvelteStartTag:exit'?: (node: AST.SvelteStartTag & ASTNodeWithParent) => void;
	SvelteEndTag?: (node: AST.SvelteEndTag & ASTNodeWithParent) => void;
	'SvelteEndTag:exit'?: (node: AST.SvelteEndTag & ASTNodeWithParent) => void;
	SvelteName?: (node: AST.SvelteName & ASTNodeWithParent) => void;
	'SvelteName:exit'?: (node: AST.SvelteName & ASTNodeWithParent) => void;
	SvelteMemberExpressionName?: (node: AST.SvelteMemberExpressionName & ASTNodeWithParent) => void;
	'SvelteMemberExpressionName:exit'?: (
		node: AST.SvelteMemberExpressionName & ASTNodeWithParent
	) => void;
	SvelteLiteral?: (node: AST.SvelteLiteral & ASTNodeWithParent) => void;
	'SvelteLiteral:exit'?: (node: AST.SvelteLiteral & ASTNodeWithParent) => void;
	SvelteMustacheTag?: (node: AST.SvelteMustacheTag & ASTNodeWithParent) => void;
	'SvelteMustacheTag:exit'?: (node: AST.SvelteMustacheTag & ASTNodeWithParent) => void;
	SvelteDebugTag?: (node: AST.SvelteDebugTag & ASTNodeWithParent) => void;
	'SvelteDebugTag:exit'?: (node: AST.SvelteDebugTag & ASTNodeWithParent) => void;
	SvelteConstTag?: (node: AST.SvelteConstTag & ASTNodeWithParent) => void;
	'SvelteConstTag:exit'?: (node: AST.SvelteConstTag & ASTNodeWithParent) => void;
	SvelteRenderTag?: (node: AST.SvelteRenderTag & ASTNodeWithParent) => void;
	'SvelteRenderTag:exit'?: (node: AST.SvelteRenderTag & ASTNodeWithParent) => void;
	SvelteIfBlock?: (node: AST.SvelteIfBlock & ASTNodeWithParent) => void;
	'SvelteIfBlock:exit'?: (node: AST.SvelteIfBlock & ASTNodeWithParent) => void;
	SvelteElseBlock?: (node: AST.SvelteElseBlock & ASTNodeWithParent) => void;
	'SvelteElseBlock:exit'?: (node: AST.SvelteElseBlock & ASTNodeWithParent) => void;
	SvelteEachBlock?: (node: AST.SvelteEachBlock & ASTNodeWithParent) => void;
	'SvelteEachBlock:exit'?: (node: AST.SvelteEachBlock & ASTNodeWithParent) => void;
	SvelteAwaitBlock?: (node: AST.SvelteAwaitBlock & ASTNodeWithParent) => void;
	'SvelteAwaitBlock:exit'?: (node: AST.SvelteAwaitBlock & ASTNodeWithParent) => void;
	SvelteAwaitPendingBlock?: (node: AST.SvelteAwaitPendingBlock & ASTNodeWithParent) => void;
	'SvelteAwaitPendingBlock:exit'?: (node: AST.SvelteAwaitPendingBlock & ASTNodeWithParent) => void;
	SvelteAwaitThenBlock?: (node: AST.SvelteAwaitThenBlock & ASTNodeWithParent) => void;
	'SvelteAwaitThenBlock:exit'?: (node: AST.SvelteAwaitThenBlock & ASTNodeWithParent) => void;
	SvelteAwaitCatchBlock?: (node: AST.SvelteAwaitCatchBlock & ASTNodeWithParent) => void;
	'SvelteAwaitCatchBlock:exit'?: (node: AST.SvelteAwaitCatchBlock & ASTNodeWithParent) => void;
	SvelteKeyBlock?: (node: AST.SvelteKeyBlock & ASTNodeWithParent) => void;
	'SvelteKeyBlock:exit'?: (node: AST.SvelteKeyBlock & ASTNodeWithParent) => void;
	SvelteSnippetBlock?: (node: AST.SvelteSnippetBlock & ASTNodeWithParent) => void;
	'SvelteSnippetBlock:exit'?: (node: AST.SvelteSnippetBlock & ASTNodeWithParent) => void;
	SvelteAttribute?: (node: AST.SvelteAttribute & ASTNodeWithParent) => void;
	'SvelteAttribute:exit'?: (node: AST.SvelteAttribute & ASTNodeWithParent) => void;
	SvelteShorthandAttribute?: (node: AST.SvelteShorthandAttribute & ASTNodeWithParent) => void;
	'SvelteShorthandAttribute:exit'?: (
		node: AST.SvelteShorthandAttribute & ASTNodeWithParent
	) => void;
	SvelteSpreadAttribute?: (node: AST.SvelteSpreadAttribute & ASTNodeWithParent) => void;
	'SvelteSpreadAttribute:exit'?: (node: AST.SvelteSpreadAttribute & ASTNodeWithParent) => void;
	SvelteDirective?: (node: AST.SvelteDirective & ASTNodeWithParent) => void;
	'SvelteDirective:exit'?: (node: AST.SvelteDirective & ASTNodeWithParent) => void;
	SvelteStyleDirective?: (node: AST.SvelteStyleDirective & ASTNodeWithParent) => void;
	'SvelteStyleDirective:exit'?: (node: AST.SvelteStyleDirective & ASTNodeWithParent) => void;
	SvelteSpecialDirective?: (node: AST.SvelteSpecialDirective & ASTNodeWithParent) => void;
	'SvelteSpecialDirective:exit'?: (node: AST.SvelteSpecialDirective & ASTNodeWithParent) => void;
	SvelteGenericsDirective?: (node: AST.SvelteGenericsDirective & ASTNodeWithParent) => void;
	'SvelteGenericsDirective:exit'?: (node: AST.SvelteGenericsDirective & ASTNodeWithParent) => void;
	SvelteDirectiveKey?: (node: AST.SvelteDirectiveKey & ASTNodeWithParent) => void;
	'SvelteDirectiveKey:exit'?: (node: AST.SvelteDirectiveKey & ASTNodeWithParent) => void;
	SvelteSpecialDirectiveKey?: (node: AST.SvelteSpecialDirectiveKey & ASTNodeWithParent) => void;
	'SvelteSpecialDirectiveKey:exit'?: (
		node: AST.SvelteSpecialDirectiveKey & ASTNodeWithParent
	) => void;
	SvelteText?: (node: AST.SvelteText & ASTNodeWithParent) => void;
	'SvelteText:exit'?: (node: AST.SvelteText & ASTNodeWithParent) => void;
	SvelteHTMLComment?: (node: AST.SvelteHTMLComment & ASTNodeWithParent) => void;
	'SvelteHTMLComment:exit'?: (node: AST.SvelteHTMLComment & ASTNodeWithParent) => void;
	SvelteReactiveStatement?: (node: AST.SvelteReactiveStatement & ASTNodeWithParent) => void;
	'SvelteReactiveStatement:exit'?: (node: AST.SvelteReactiveStatement & ASTNodeWithParent) => void;
};

export type ESNodeListener = {
	AccessorProperty?: (node: TSESTree.AccessorProperty & ASTNodeWithParent) => void;
	'AccessorProperty:exit'?: (node: TSESTree.AccessorProperty & ASTNodeWithParent) => void;
	ArrayExpression?: (node: TSESTree.ArrayExpression & ASTNodeWithParent) => void;
	'ArrayExpression:exit'?: (node: TSESTree.ArrayExpression & ASTNodeWithParent) => void;
	ArrayPattern?: (node: TSESTree.ArrayPattern & ASTNodeWithParent) => void;
	'ArrayPattern:exit'?: (node: TSESTree.ArrayPattern & ASTNodeWithParent) => void;
	ArrowFunctionExpression?: (node: TSESTree.ArrowFunctionExpression & ASTNodeWithParent) => void;
	'ArrowFunctionExpression:exit'?: (
		node: TSESTree.ArrowFunctionExpression & ASTNodeWithParent
	) => void;
	AssignmentExpression?: (node: TSESTree.AssignmentExpression & ASTNodeWithParent) => void;
	'AssignmentExpression:exit'?: (node: TSESTree.AssignmentExpression & ASTNodeWithParent) => void;
	AssignmentPattern?: (node: TSESTree.AssignmentPattern & ASTNodeWithParent) => void;
	'AssignmentPattern:exit'?: (node: TSESTree.AssignmentPattern & ASTNodeWithParent) => void;
	AwaitExpression?: (node: TSESTree.AwaitExpression & ASTNodeWithParent) => void;
	'AwaitExpression:exit'?: (node: TSESTree.AwaitExpression & ASTNodeWithParent) => void;
	BinaryExpression?: (node: TSESTree.BinaryExpression & ASTNodeWithParent) => void;
	'BinaryExpression:exit'?: (node: TSESTree.BinaryExpression & ASTNodeWithParent) => void;
	BlockStatement?: (node: TSESTree.BlockStatement & ASTNodeWithParent) => void;
	'BlockStatement:exit'?: (node: TSESTree.BlockStatement & ASTNodeWithParent) => void;
	BreakStatement?: (node: TSESTree.BreakStatement & ASTNodeWithParent) => void;
	'BreakStatement:exit'?: (node: TSESTree.BreakStatement & ASTNodeWithParent) => void;
	CallExpression?: (node: TSESTree.CallExpression & ASTNodeWithParent) => void;
	'CallExpression:exit'?: (node: TSESTree.CallExpression & ASTNodeWithParent) => void;
	CatchClause?: (node: TSESTree.CatchClause & ASTNodeWithParent) => void;
	'CatchClause:exit'?: (node: TSESTree.CatchClause & ASTNodeWithParent) => void;
	ChainExpression?: (node: TSESTree.ChainExpression & ASTNodeWithParent) => void;
	'ChainExpression:exit'?: (node: TSESTree.ChainExpression & ASTNodeWithParent) => void;
	ClassBody?: (node: TSESTree.ClassBody & ASTNodeWithParent) => void;
	'ClassBody:exit'?: (node: TSESTree.ClassBody & ASTNodeWithParent) => void;
	ClassDeclaration?: (node: TSESTree.ClassDeclaration & ASTNodeWithParent) => void;
	'ClassDeclaration:exit'?: (node: TSESTree.ClassDeclaration & ASTNodeWithParent) => void;
	ClassExpression?: (node: TSESTree.ClassExpression & ASTNodeWithParent) => void;
	'ClassExpression:exit'?: (node: TSESTree.ClassExpression & ASTNodeWithParent) => void;
	ConditionalExpression?: (node: TSESTree.ConditionalExpression & ASTNodeWithParent) => void;
	'ConditionalExpression:exit'?: (node: TSESTree.ConditionalExpression & ASTNodeWithParent) => void;
	ContinueStatement?: (node: TSESTree.ContinueStatement & ASTNodeWithParent) => void;
	'ContinueStatement:exit'?: (node: TSESTree.ContinueStatement & ASTNodeWithParent) => void;
	DebuggerStatement?: (node: TSESTree.DebuggerStatement & ASTNodeWithParent) => void;
	'DebuggerStatement:exit'?: (node: TSESTree.DebuggerStatement & ASTNodeWithParent) => void;
	DoWhileStatement?: (node: TSESTree.DoWhileStatement & ASTNodeWithParent) => void;
	'DoWhileStatement:exit'?: (node: TSESTree.DoWhileStatement & ASTNodeWithParent) => void;
	EmptyStatement?: (node: TSESTree.EmptyStatement & ASTNodeWithParent) => void;
	'EmptyStatement:exit'?: (node: TSESTree.EmptyStatement & ASTNodeWithParent) => void;
	ExportAllDeclaration?: (node: TSESTree.ExportAllDeclaration & ASTNodeWithParent) => void;
	'ExportAllDeclaration:exit'?: (node: TSESTree.ExportAllDeclaration & ASTNodeWithParent) => void;
	ExportDefaultDeclaration?: (node: TSESTree.ExportDefaultDeclaration & ASTNodeWithParent) => void;
	'ExportDefaultDeclaration:exit'?: (
		node: TSESTree.ExportDefaultDeclaration & ASTNodeWithParent
	) => void;
	ExportNamedDeclaration?: (node: TSESTree.ExportNamedDeclaration & ASTNodeWithParent) => void;
	'ExportNamedDeclaration:exit'?: (
		node: TSESTree.ExportNamedDeclaration & ASTNodeWithParent
	) => void;
	ExportSpecifier?: (node: TSESTree.ExportSpecifier & ASTNodeWithParent) => void;
	'ExportSpecifier:exit'?: (node: TSESTree.ExportSpecifier & ASTNodeWithParent) => void;
	ExpressionStatement?: (node: TSESTree.ExpressionStatement & ASTNodeWithParent) => void;
	'ExpressionStatement:exit'?: (node: TSESTree.ExpressionStatement & ASTNodeWithParent) => void;
	ForInStatement?: (node: TSESTree.ForInStatement & ASTNodeWithParent) => void;
	'ForInStatement:exit'?: (node: TSESTree.ForInStatement & ASTNodeWithParent) => void;
	ForOfStatement?: (node: TSESTree.ForOfStatement & ASTNodeWithParent) => void;
	'ForOfStatement:exit'?: (node: TSESTree.ForOfStatement & ASTNodeWithParent) => void;
	ForStatement?: (node: TSESTree.ForStatement & ASTNodeWithParent) => void;
	'ForStatement:exit'?: (node: TSESTree.ForStatement & ASTNodeWithParent) => void;
	FunctionDeclaration?: (node: TSESTree.FunctionDeclaration & ASTNodeWithParent) => void;
	'FunctionDeclaration:exit'?: (node: TSESTree.FunctionDeclaration & ASTNodeWithParent) => void;
	FunctionExpression?: (node: TSESTree.FunctionExpression & ASTNodeWithParent) => void;
	'FunctionExpression:exit'?: (node: TSESTree.FunctionExpression & ASTNodeWithParent) => void;
	Identifier?: (node: TSESTree.Identifier & ASTNodeWithParent) => void;
	'Identifier:exit'?: (node: TSESTree.Identifier & ASTNodeWithParent) => void;
	IfStatement?: (node: TSESTree.IfStatement & ASTNodeWithParent) => void;
	'IfStatement:exit'?: (node: TSESTree.IfStatement & ASTNodeWithParent) => void;
	ImportDeclaration?: (node: TSESTree.ImportDeclaration & ASTNodeWithParent) => void;
	'ImportDeclaration:exit'?: (node: TSESTree.ImportDeclaration & ASTNodeWithParent) => void;
	ImportDefaultSpecifier?: (node: TSESTree.ImportDefaultSpecifier & ASTNodeWithParent) => void;
	'ImportDefaultSpecifier:exit'?: (
		node: TSESTree.ImportDefaultSpecifier & ASTNodeWithParent
	) => void;
	ImportExpression?: (node: TSESTree.ImportExpression & ASTNodeWithParent) => void;
	'ImportExpression:exit'?: (node: TSESTree.ImportExpression & ASTNodeWithParent) => void;
	ImportNamespaceSpecifier?: (node: TSESTree.ImportNamespaceSpecifier & ASTNodeWithParent) => void;
	'ImportNamespaceSpecifier:exit'?: (
		node: TSESTree.ImportNamespaceSpecifier & ASTNodeWithParent
	) => void;
	ImportSpecifier?: (node: TSESTree.ImportSpecifier & ASTNodeWithParent) => void;
	'ImportSpecifier:exit'?: (node: TSESTree.ImportSpecifier & ASTNodeWithParent) => void;
	LabeledStatement?: (node: TSESTree.LabeledStatement & ASTNodeWithParent) => void;
	'LabeledStatement:exit'?: (node: TSESTree.LabeledStatement & ASTNodeWithParent) => void;
	Literal?: (node: TSESTree.Literal & ASTNodeWithParent) => void;
	'Literal:exit'?: (node: TSESTree.Literal & ASTNodeWithParent) => void;
	LogicalExpression?: (node: TSESTree.LogicalExpression & ASTNodeWithParent) => void;
	'LogicalExpression:exit'?: (node: TSESTree.LogicalExpression & ASTNodeWithParent) => void;
	MemberExpression?: (node: TSESTree.MemberExpression & ASTNodeWithParent) => void;
	'MemberExpression:exit'?: (node: TSESTree.MemberExpression & ASTNodeWithParent) => void;
	MetaProperty?: (node: TSESTree.MetaProperty & ASTNodeWithParent) => void;
	'MetaProperty:exit'?: (node: TSESTree.MetaProperty & ASTNodeWithParent) => void;
	MethodDefinition?: (node: TSESTree.MethodDefinition & ASTNodeWithParent) => void;
	'MethodDefinition:exit'?: (node: TSESTree.MethodDefinition & ASTNodeWithParent) => void;
	NewExpression?: (node: TSESTree.NewExpression & ASTNodeWithParent) => void;
	'NewExpression:exit'?: (node: TSESTree.NewExpression & ASTNodeWithParent) => void;
	ObjectExpression?: (node: TSESTree.ObjectExpression & ASTNodeWithParent) => void;
	'ObjectExpression:exit'?: (node: TSESTree.ObjectExpression & ASTNodeWithParent) => void;
	ObjectPattern?: (node: TSESTree.ObjectPattern & ASTNodeWithParent) => void;
	'ObjectPattern:exit'?: (node: TSESTree.ObjectPattern & ASTNodeWithParent) => void;
	PrivateIdentifier?: (node: TSESTree.PrivateIdentifier & ASTNodeWithParent) => void;
	'PrivateIdentifier:exit'?: (node: TSESTree.PrivateIdentifier & ASTNodeWithParent) => void;
	Property?: (node: TSESTree.Property & ASTNodeWithParent) => void;
	'Property:exit'?: (node: TSESTree.Property & ASTNodeWithParent) => void;
	PropertyDefinition?: (node: TSESTree.PropertyDefinition & ASTNodeWithParent) => void;
	'PropertyDefinition:exit'?: (node: TSESTree.PropertyDefinition & ASTNodeWithParent) => void;
	RestElement?: (node: TSESTree.RestElement & ASTNodeWithParent) => void;
	'RestElement:exit'?: (node: TSESTree.RestElement & ASTNodeWithParent) => void;
	ReturnStatement?: (node: TSESTree.ReturnStatement & ASTNodeWithParent) => void;
	'ReturnStatement:exit'?: (node: TSESTree.ReturnStatement & ASTNodeWithParent) => void;
	SequenceExpression?: (node: TSESTree.SequenceExpression & ASTNodeWithParent) => void;
	'SequenceExpression:exit'?: (node: TSESTree.SequenceExpression & ASTNodeWithParent) => void;
	SpreadElement?: (node: TSESTree.SpreadElement & ASTNodeWithParent) => void;
	'SpreadElement:exit'?: (node: TSESTree.SpreadElement & ASTNodeWithParent) => void;
	Super?: (node: TSESTree.Super & ASTNodeWithParent) => void;
	'Super:exit'?: (node: TSESTree.Super & ASTNodeWithParent) => void;
	SwitchCase?: (node: TSESTree.SwitchCase & ASTNodeWithParent) => void;
	'SwitchCase:exit'?: (node: TSESTree.SwitchCase & ASTNodeWithParent) => void;
	SwitchStatement?: (node: TSESTree.SwitchStatement & ASTNodeWithParent) => void;
	'SwitchStatement:exit'?: (node: TSESTree.SwitchStatement & ASTNodeWithParent) => void;
	TaggedTemplateExpression?: (node: TSESTree.TaggedTemplateExpression & ASTNodeWithParent) => void;
	'TaggedTemplateExpression:exit'?: (
		node: TSESTree.TaggedTemplateExpression & ASTNodeWithParent
	) => void;
	TemplateElement?: (node: TSESTree.TemplateElement & ASTNodeWithParent) => void;
	'TemplateElement:exit'?: (node: TSESTree.TemplateElement & ASTNodeWithParent) => void;
	TemplateLiteral?: (node: TSESTree.TemplateLiteral & ASTNodeWithParent) => void;
	'TemplateLiteral:exit'?: (node: TSESTree.TemplateLiteral & ASTNodeWithParent) => void;
	ThisExpression?: (node: TSESTree.ThisExpression & ASTNodeWithParent) => void;
	'ThisExpression:exit'?: (node: TSESTree.ThisExpression & ASTNodeWithParent) => void;
	ThrowStatement?: (node: TSESTree.ThrowStatement & ASTNodeWithParent) => void;
	'ThrowStatement:exit'?: (node: TSESTree.ThrowStatement & ASTNodeWithParent) => void;
	TryStatement?: (node: TSESTree.TryStatement & ASTNodeWithParent) => void;
	'TryStatement:exit'?: (node: TSESTree.TryStatement & ASTNodeWithParent) => void;
	UnaryExpression?: (node: TSESTree.UnaryExpression & ASTNodeWithParent) => void;
	'UnaryExpression:exit'?: (node: TSESTree.UnaryExpression & ASTNodeWithParent) => void;
	UpdateExpression?: (node: TSESTree.UpdateExpression & ASTNodeWithParent) => void;
	'UpdateExpression:exit'?: (node: TSESTree.UpdateExpression & ASTNodeWithParent) => void;
	VariableDeclaration?: (node: TSESTree.VariableDeclaration & ASTNodeWithParent) => void;
	'VariableDeclaration:exit'?: (node: TSESTree.VariableDeclaration & ASTNodeWithParent) => void;
	VariableDeclarator?: (node: TSESTree.VariableDeclarator & ASTNodeWithParent) => void;
	'VariableDeclarator:exit'?: (node: TSESTree.VariableDeclarator & ASTNodeWithParent) => void;
	WhileStatement?: (node: TSESTree.WhileStatement & ASTNodeWithParent) => void;
	'WhileStatement:exit'?: (node: TSESTree.WhileStatement & ASTNodeWithParent) => void;
	WithStatement?: (node: TSESTree.WithStatement & ASTNodeWithParent) => void;
	'WithStatement:exit'?: (node: TSESTree.WithStatement & ASTNodeWithParent) => void;
	YieldExpression?: (node: TSESTree.YieldExpression & ASTNodeWithParent) => void;
	'YieldExpression:exit'?: (node: TSESTree.YieldExpression & ASTNodeWithParent) => void;
	Program?: (node: AST.SvelteProgram & ASTNodeWithParent) => void;
	'Program:exit'?: (node: AST.SvelteProgram & ASTNodeWithParent) => void;
	SvelteReactiveStatement?: (node: AST.SvelteReactiveStatement & ASTNodeWithParent) => void;
	'SvelteReactiveStatement:exit'?: (node: AST.SvelteReactiveStatement & ASTNodeWithParent) => void;
};

export type TSNodeListener = {
	Decorator?: (node: TSESTree.Decorator & ASTNodeWithParent) => void;
	'Decorator:exit'?: (node: TSESTree.Decorator & ASTNodeWithParent) => void;
	ImportAttribute?: (node: TSESTree.ImportAttribute & ASTNodeWithParent) => void;
	'ImportAttribute:exit'?: (node: TSESTree.ImportAttribute & ASTNodeWithParent) => void;
	StaticBlock?: (node: TSESTree.StaticBlock & ASTNodeWithParent) => void;
	'StaticBlock:exit'?: (node: TSESTree.StaticBlock & ASTNodeWithParent) => void;
	TSAbstractAccessorProperty?: (
		node: TSESTree.TSAbstractAccessorProperty & ASTNodeWithParent
	) => void;
	'TSAbstractAccessorProperty:exit'?: (
		node: TSESTree.TSAbstractAccessorProperty & ASTNodeWithParent
	) => void;
	TSAbstractKeyword?: (node: TSESTree.TSAbstractKeyword & ASTNodeWithParent) => void;
	'TSAbstractKeyword:exit'?: (node: TSESTree.TSAbstractKeyword & ASTNodeWithParent) => void;
	TSAbstractMethodDefinition?: (
		node: TSESTree.TSAbstractMethodDefinition & ASTNodeWithParent
	) => void;
	'TSAbstractMethodDefinition:exit'?: (
		node: TSESTree.TSAbstractMethodDefinition & ASTNodeWithParent
	) => void;
	TSAbstractPropertyDefinition?: (
		node: TSESTree.TSAbstractPropertyDefinition & ASTNodeWithParent
	) => void;
	'TSAbstractPropertyDefinition:exit'?: (
		node: TSESTree.TSAbstractPropertyDefinition & ASTNodeWithParent
	) => void;
	TSAnyKeyword?: (node: TSESTree.TSAnyKeyword & ASTNodeWithParent) => void;
	'TSAnyKeyword:exit'?: (node: TSESTree.TSAnyKeyword & ASTNodeWithParent) => void;
	TSArrayType?: (node: TSESTree.TSArrayType & ASTNodeWithParent) => void;
	'TSArrayType:exit'?: (node: TSESTree.TSArrayType & ASTNodeWithParent) => void;
	TSAsExpression?: (node: TSESTree.TSAsExpression & ASTNodeWithParent) => void;
	'TSAsExpression:exit'?: (node: TSESTree.TSAsExpression & ASTNodeWithParent) => void;
	TSAsyncKeyword?: (node: TSESTree.TSAsyncKeyword & ASTNodeWithParent) => void;
	'TSAsyncKeyword:exit'?: (node: TSESTree.TSAsyncKeyword & ASTNodeWithParent) => void;
	TSBigIntKeyword?: (node: TSESTree.TSBigIntKeyword & ASTNodeWithParent) => void;
	'TSBigIntKeyword:exit'?: (node: TSESTree.TSBigIntKeyword & ASTNodeWithParent) => void;
	TSBooleanKeyword?: (node: TSESTree.TSBooleanKeyword & ASTNodeWithParent) => void;
	'TSBooleanKeyword:exit'?: (node: TSESTree.TSBooleanKeyword & ASTNodeWithParent) => void;
	TSCallSignatureDeclaration?: (
		node: TSESTree.TSCallSignatureDeclaration & ASTNodeWithParent
	) => void;
	'TSCallSignatureDeclaration:exit'?: (
		node: TSESTree.TSCallSignatureDeclaration & ASTNodeWithParent
	) => void;
	TSClassImplements?: (node: TSESTree.TSClassImplements & ASTNodeWithParent) => void;
	'TSClassImplements:exit'?: (node: TSESTree.TSClassImplements & ASTNodeWithParent) => void;
	TSConditionalType?: (node: TSESTree.TSConditionalType & ASTNodeWithParent) => void;
	'TSConditionalType:exit'?: (node: TSESTree.TSConditionalType & ASTNodeWithParent) => void;
	TSConstructorType?: (node: TSESTree.TSConstructorType & ASTNodeWithParent) => void;
	'TSConstructorType:exit'?: (node: TSESTree.TSConstructorType & ASTNodeWithParent) => void;
	TSConstructSignatureDeclaration?: (
		node: TSESTree.TSConstructSignatureDeclaration & ASTNodeWithParent
	) => void;
	'TSConstructSignatureDeclaration:exit'?: (
		node: TSESTree.TSConstructSignatureDeclaration & ASTNodeWithParent
	) => void;
	TSDeclareFunction?: (node: TSESTree.TSDeclareFunction & ASTNodeWithParent) => void;
	'TSDeclareFunction:exit'?: (node: TSESTree.TSDeclareFunction & ASTNodeWithParent) => void;
	TSDeclareKeyword?: (node: TSESTree.TSDeclareKeyword & ASTNodeWithParent) => void;
	'TSDeclareKeyword:exit'?: (node: TSESTree.TSDeclareKeyword & ASTNodeWithParent) => void;
	TSEmptyBodyFunctionExpression?: (
		node: TSESTree.TSEmptyBodyFunctionExpression & ASTNodeWithParent
	) => void;
	'TSEmptyBodyFunctionExpression:exit'?: (
		node: TSESTree.TSEmptyBodyFunctionExpression & ASTNodeWithParent
	) => void;
	TSEnumBody?: (node: TSESTree.TSEnumBody & ASTNodeWithParent) => void;
	'TSEnumBody:exit'?: (node: TSESTree.TSEnumBody & ASTNodeWithParent) => void;
	TSEnumDeclaration?: (node: TSESTree.TSEnumDeclaration & ASTNodeWithParent) => void;
	'TSEnumDeclaration:exit'?: (node: TSESTree.TSEnumDeclaration & ASTNodeWithParent) => void;
	TSEnumMember?: (node: TSESTree.TSEnumMember & ASTNodeWithParent) => void;
	'TSEnumMember:exit'?: (node: TSESTree.TSEnumMember & ASTNodeWithParent) => void;
	TSExportAssignment?: (node: TSESTree.TSExportAssignment & ASTNodeWithParent) => void;
	'TSExportAssignment:exit'?: (node: TSESTree.TSExportAssignment & ASTNodeWithParent) => void;
	TSExportKeyword?: (node: TSESTree.TSExportKeyword & ASTNodeWithParent) => void;
	'TSExportKeyword:exit'?: (node: TSESTree.TSExportKeyword & ASTNodeWithParent) => void;
	TSExternalModuleReference?: (
		node: TSESTree.TSExternalModuleReference & ASTNodeWithParent
	) => void;
	'TSExternalModuleReference:exit'?: (
		node: TSESTree.TSExternalModuleReference & ASTNodeWithParent
	) => void;
	TSFunctionType?: (node: TSESTree.TSFunctionType & ASTNodeWithParent) => void;
	'TSFunctionType:exit'?: (node: TSESTree.TSFunctionType & ASTNodeWithParent) => void;
	TSImportEqualsDeclaration?: (
		node: TSESTree.TSImportEqualsDeclaration & ASTNodeWithParent
	) => void;
	'TSImportEqualsDeclaration:exit'?: (
		node: TSESTree.TSImportEqualsDeclaration & ASTNodeWithParent
	) => void;
	TSImportType?: (node: TSESTree.TSImportType & ASTNodeWithParent) => void;
	'TSImportType:exit'?: (node: TSESTree.TSImportType & ASTNodeWithParent) => void;
	TSIndexedAccessType?: (node: TSESTree.TSIndexedAccessType & ASTNodeWithParent) => void;
	'TSIndexedAccessType:exit'?: (node: TSESTree.TSIndexedAccessType & ASTNodeWithParent) => void;
	TSIndexSignature?: (node: TSESTree.TSIndexSignature & ASTNodeWithParent) => void;
	'TSIndexSignature:exit'?: (node: TSESTree.TSIndexSignature & ASTNodeWithParent) => void;
	TSInferType?: (node: TSESTree.TSInferType & ASTNodeWithParent) => void;
	'TSInferType:exit'?: (node: TSESTree.TSInferType & ASTNodeWithParent) => void;
	TSInstantiationExpression?: (
		node: TSESTree.TSInstantiationExpression & ASTNodeWithParent
	) => void;
	'TSInstantiationExpression:exit'?: (
		node: TSESTree.TSInstantiationExpression & ASTNodeWithParent
	) => void;
	TSInterfaceBody?: (node: TSESTree.TSInterfaceBody & ASTNodeWithParent) => void;
	'TSInterfaceBody:exit'?: (node: TSESTree.TSInterfaceBody & ASTNodeWithParent) => void;
	TSInterfaceDeclaration?: (node: TSESTree.TSInterfaceDeclaration & ASTNodeWithParent) => void;
	'TSInterfaceDeclaration:exit'?: (
		node: TSESTree.TSInterfaceDeclaration & ASTNodeWithParent
	) => void;
	TSInterfaceHeritage?: (node: TSESTree.TSInterfaceHeritage & ASTNodeWithParent) => void;
	'TSInterfaceHeritage:exit'?: (node: TSESTree.TSInterfaceHeritage & ASTNodeWithParent) => void;
	TSIntersectionType?: (node: TSESTree.TSIntersectionType & ASTNodeWithParent) => void;
	'TSIntersectionType:exit'?: (node: TSESTree.TSIntersectionType & ASTNodeWithParent) => void;
	TSIntrinsicKeyword?: (
		node: TSESTree.Node & { type: AST_NODE_TYPES.TSIntrinsicKeyword } & ASTNodeWithParent
	) => void;
	'TSIntrinsicKeyword:exit'?: (
		node: TSESTree.Node & { type: AST_NODE_TYPES.TSIntrinsicKeyword } & ASTNodeWithParent
	) => void;
	TSLiteralType?: (node: TSESTree.TSLiteralType & ASTNodeWithParent) => void;
	'TSLiteralType:exit'?: (node: TSESTree.TSLiteralType & ASTNodeWithParent) => void;
	TSMappedType?: (node: TSESTree.TSMappedType & ASTNodeWithParent) => void;
	'TSMappedType:exit'?: (node: TSESTree.TSMappedType & ASTNodeWithParent) => void;
	TSMethodSignature?: (node: TSESTree.TSMethodSignature & ASTNodeWithParent) => void;
	'TSMethodSignature:exit'?: (node: TSESTree.TSMethodSignature & ASTNodeWithParent) => void;
	TSModuleBlock?: (node: TSESTree.TSModuleBlock & ASTNodeWithParent) => void;
	'TSModuleBlock:exit'?: (node: TSESTree.TSModuleBlock & ASTNodeWithParent) => void;
	TSModuleDeclaration?: (node: TSESTree.TSModuleDeclaration & ASTNodeWithParent) => void;
	'TSModuleDeclaration:exit'?: (node: TSESTree.TSModuleDeclaration & ASTNodeWithParent) => void;
	TSNamedTupleMember?: (node: TSESTree.TSNamedTupleMember & ASTNodeWithParent) => void;
	'TSNamedTupleMember:exit'?: (node: TSESTree.TSNamedTupleMember & ASTNodeWithParent) => void;
	TSNamespaceExportDeclaration?: (
		node: TSESTree.TSNamespaceExportDeclaration & ASTNodeWithParent
	) => void;
	'TSNamespaceExportDeclaration:exit'?: (
		node: TSESTree.TSNamespaceExportDeclaration & ASTNodeWithParent
	) => void;
	TSNeverKeyword?: (node: TSESTree.TSNeverKeyword & ASTNodeWithParent) => void;
	'TSNeverKeyword:exit'?: (node: TSESTree.TSNeverKeyword & ASTNodeWithParent) => void;
	TSNonNullExpression?: (node: TSESTree.TSNonNullExpression & ASTNodeWithParent) => void;
	'TSNonNullExpression:exit'?: (node: TSESTree.TSNonNullExpression & ASTNodeWithParent) => void;
	TSNullKeyword?: (node: TSESTree.TSNullKeyword & ASTNodeWithParent) => void;
	'TSNullKeyword:exit'?: (node: TSESTree.TSNullKeyword & ASTNodeWithParent) => void;
	TSNumberKeyword?: (node: TSESTree.TSNumberKeyword & ASTNodeWithParent) => void;
	'TSNumberKeyword:exit'?: (node: TSESTree.TSNumberKeyword & ASTNodeWithParent) => void;
	TSObjectKeyword?: (node: TSESTree.TSObjectKeyword & ASTNodeWithParent) => void;
	'TSObjectKeyword:exit'?: (node: TSESTree.TSObjectKeyword & ASTNodeWithParent) => void;
	TSOptionalType?: (node: TSESTree.TSOptionalType & ASTNodeWithParent) => void;
	'TSOptionalType:exit'?: (node: TSESTree.TSOptionalType & ASTNodeWithParent) => void;
	TSParameterProperty?: (node: TSESTree.TSParameterProperty & ASTNodeWithParent) => void;
	'TSParameterProperty:exit'?: (node: TSESTree.TSParameterProperty & ASTNodeWithParent) => void;
	TSPrivateKeyword?: (node: TSESTree.TSPrivateKeyword & ASTNodeWithParent) => void;
	'TSPrivateKeyword:exit'?: (node: TSESTree.TSPrivateKeyword & ASTNodeWithParent) => void;
	TSPropertySignature?: (node: TSESTree.TSPropertySignature & ASTNodeWithParent) => void;
	'TSPropertySignature:exit'?: (node: TSESTree.TSPropertySignature & ASTNodeWithParent) => void;
	TSProtectedKeyword?: (node: TSESTree.TSProtectedKeyword & ASTNodeWithParent) => void;
	'TSProtectedKeyword:exit'?: (node: TSESTree.TSProtectedKeyword & ASTNodeWithParent) => void;
	TSPublicKeyword?: (node: TSESTree.TSPublicKeyword & ASTNodeWithParent) => void;
	'TSPublicKeyword:exit'?: (node: TSESTree.TSPublicKeyword & ASTNodeWithParent) => void;
	TSQualifiedName?: (node: TSESTree.TSQualifiedName & ASTNodeWithParent) => void;
	'TSQualifiedName:exit'?: (node: TSESTree.TSQualifiedName & ASTNodeWithParent) => void;
	TSReadonlyKeyword?: (node: TSESTree.TSReadonlyKeyword & ASTNodeWithParent) => void;
	'TSReadonlyKeyword:exit'?: (node: TSESTree.TSReadonlyKeyword & ASTNodeWithParent) => void;
	TSRestType?: (node: TSESTree.TSRestType & ASTNodeWithParent) => void;
	'TSRestType:exit'?: (node: TSESTree.TSRestType & ASTNodeWithParent) => void;
	TSSatisfiesExpression?: (node: TSESTree.TSSatisfiesExpression & ASTNodeWithParent) => void;
	'TSSatisfiesExpression:exit'?: (node: TSESTree.TSSatisfiesExpression & ASTNodeWithParent) => void;
	TSStaticKeyword?: (node: TSESTree.TSStaticKeyword & ASTNodeWithParent) => void;
	'TSStaticKeyword:exit'?: (node: TSESTree.TSStaticKeyword & ASTNodeWithParent) => void;
	TSStringKeyword?: (node: TSESTree.TSStringKeyword & ASTNodeWithParent) => void;
	'TSStringKeyword:exit'?: (node: TSESTree.TSStringKeyword & ASTNodeWithParent) => void;
	TSSymbolKeyword?: (node: TSESTree.TSSymbolKeyword & ASTNodeWithParent) => void;
	'TSSymbolKeyword:exit'?: (node: TSESTree.TSSymbolKeyword & ASTNodeWithParent) => void;
	TSTemplateLiteralType?: (node: TSESTree.TSTemplateLiteralType & ASTNodeWithParent) => void;
	'TSTemplateLiteralType:exit'?: (node: TSESTree.TSTemplateLiteralType & ASTNodeWithParent) => void;
	TSThisType?: (node: TSESTree.TSThisType & ASTNodeWithParent) => void;
	'TSThisType:exit'?: (node: TSESTree.TSThisType & ASTNodeWithParent) => void;
	TSTupleType?: (node: TSESTree.TSTupleType & ASTNodeWithParent) => void;
	'TSTupleType:exit'?: (node: TSESTree.TSTupleType & ASTNodeWithParent) => void;
	TSTypeAliasDeclaration?: (node: TSESTree.TSTypeAliasDeclaration & ASTNodeWithParent) => void;
	'TSTypeAliasDeclaration:exit'?: (
		node: TSESTree.TSTypeAliasDeclaration & ASTNodeWithParent
	) => void;
	TSTypeAnnotation?: (node: TSESTree.TSTypeAnnotation & ASTNodeWithParent) => void;
	'TSTypeAnnotation:exit'?: (node: TSESTree.TSTypeAnnotation & ASTNodeWithParent) => void;
	TSTypeAssertion?: (node: TSESTree.TSTypeAssertion & ASTNodeWithParent) => void;
	'TSTypeAssertion:exit'?: (node: TSESTree.TSTypeAssertion & ASTNodeWithParent) => void;
	TSTypeLiteral?: (node: TSESTree.TSTypeLiteral & ASTNodeWithParent) => void;
	'TSTypeLiteral:exit'?: (node: TSESTree.TSTypeLiteral & ASTNodeWithParent) => void;
	TSTypeOperator?: (node: TSESTree.TSTypeOperator & ASTNodeWithParent) => void;
	'TSTypeOperator:exit'?: (node: TSESTree.TSTypeOperator & ASTNodeWithParent) => void;
	TSTypeParameter?: (node: TSESTree.TSTypeParameter & ASTNodeWithParent) => void;
	'TSTypeParameter:exit'?: (node: TSESTree.TSTypeParameter & ASTNodeWithParent) => void;
	TSTypeParameterDeclaration?: (
		node: TSESTree.TSTypeParameterDeclaration & ASTNodeWithParent
	) => void;
	'TSTypeParameterDeclaration:exit'?: (
		node: TSESTree.TSTypeParameterDeclaration & ASTNodeWithParent
	) => void;
	TSTypeParameterInstantiation?: (
		node: TSESTree.TSTypeParameterInstantiation & ASTNodeWithParent
	) => void;
	'TSTypeParameterInstantiation:exit'?: (
		node: TSESTree.TSTypeParameterInstantiation & ASTNodeWithParent
	) => void;
	TSTypePredicate?: (node: TSESTree.TSTypePredicate & ASTNodeWithParent) => void;
	'TSTypePredicate:exit'?: (node: TSESTree.TSTypePredicate & ASTNodeWithParent) => void;
	TSTypeQuery?: (node: TSESTree.TSTypeQuery & ASTNodeWithParent) => void;
	'TSTypeQuery:exit'?: (node: TSESTree.TSTypeQuery & ASTNodeWithParent) => void;
	TSTypeReference?: (node: TSESTree.TSTypeReference & ASTNodeWithParent) => void;
	'TSTypeReference:exit'?: (node: TSESTree.TSTypeReference & ASTNodeWithParent) => void;
	TSUndefinedKeyword?: (node: TSESTree.TSUndefinedKeyword & ASTNodeWithParent) => void;
	'TSUndefinedKeyword:exit'?: (node: TSESTree.TSUndefinedKeyword & ASTNodeWithParent) => void;
	TSUnionType?: (node: TSESTree.TSUnionType & ASTNodeWithParent) => void;
	'TSUnionType:exit'?: (node: TSESTree.TSUnionType & ASTNodeWithParent) => void;
	TSUnknownKeyword?: (node: TSESTree.TSUnknownKeyword & ASTNodeWithParent) => void;
	'TSUnknownKeyword:exit'?: (node: TSESTree.TSUnknownKeyword & ASTNodeWithParent) => void;
	TSVoidKeyword?: (node: TSESTree.TSVoidKeyword & ASTNodeWithParent) => void;
	'TSVoidKeyword:exit'?: (node: TSESTree.TSVoidKeyword & ASTNodeWithParent) => void;
};

export type SvelteNodeListener = {
	SvelteScriptElement?: (node: AST.SvelteScriptElement & ASTNodeWithParent) => void;
	'SvelteScriptElement:exit'?: (node: AST.SvelteScriptElement & ASTNodeWithParent) => void;
	SvelteStyleElement?: (node: AST.SvelteStyleElement & ASTNodeWithParent) => void;
	'SvelteStyleElement:exit'?: (node: AST.SvelteStyleElement & ASTNodeWithParent) => void;
	SvelteElement?: (node: AST.SvelteElement & ASTNodeWithParent) => void;
	'SvelteElement:exit'?: (node: AST.SvelteElement & ASTNodeWithParent) => void;
	SvelteStartTag?: (node: AST.SvelteStartTag & ASTNodeWithParent) => void;
	'SvelteStartTag:exit'?: (node: AST.SvelteStartTag & ASTNodeWithParent) => void;
	SvelteEndTag?: (node: AST.SvelteEndTag & ASTNodeWithParent) => void;
	'SvelteEndTag:exit'?: (node: AST.SvelteEndTag & ASTNodeWithParent) => void;
	SvelteName?: (node: AST.SvelteName & ASTNodeWithParent) => void;
	'SvelteName:exit'?: (node: AST.SvelteName & ASTNodeWithParent) => void;
	SvelteMemberExpressionName?: (node: AST.SvelteMemberExpressionName & ASTNodeWithParent) => void;
	'SvelteMemberExpressionName:exit'?: (
		node: AST.SvelteMemberExpressionName & ASTNodeWithParent
	) => void;
	SvelteLiteral?: (node: AST.SvelteLiteral & ASTNodeWithParent) => void;
	'SvelteLiteral:exit'?: (node: AST.SvelteLiteral & ASTNodeWithParent) => void;
	SvelteMustacheTag?: (node: AST.SvelteMustacheTag & ASTNodeWithParent) => void;
	'SvelteMustacheTag:exit'?: (node: AST.SvelteMustacheTag & ASTNodeWithParent) => void;
	SvelteDebugTag?: (node: AST.SvelteDebugTag & ASTNodeWithParent) => void;
	'SvelteDebugTag:exit'?: (node: AST.SvelteDebugTag & ASTNodeWithParent) => void;
	SvelteConstTag?: (node: AST.SvelteConstTag & ASTNodeWithParent) => void;
	'SvelteConstTag:exit'?: (node: AST.SvelteConstTag & ASTNodeWithParent) => void;
	SvelteRenderTag?: (node: AST.SvelteRenderTag & ASTNodeWithParent) => void;
	'SvelteRenderTag:exit'?: (node: AST.SvelteRenderTag & ASTNodeWithParent) => void;
	SvelteIfBlock?: (node: AST.SvelteIfBlock & ASTNodeWithParent) => void;
	'SvelteIfBlock:exit'?: (node: AST.SvelteIfBlock & ASTNodeWithParent) => void;
	SvelteElseBlock?: (node: AST.SvelteElseBlock & ASTNodeWithParent) => void;
	'SvelteElseBlock:exit'?: (node: AST.SvelteElseBlock & ASTNodeWithParent) => void;
	SvelteEachBlock?: (node: AST.SvelteEachBlock & ASTNodeWithParent) => void;
	'SvelteEachBlock:exit'?: (node: AST.SvelteEachBlock & ASTNodeWithParent) => void;
	SvelteAwaitBlock?: (node: AST.SvelteAwaitBlock & ASTNodeWithParent) => void;
	'SvelteAwaitBlock:exit'?: (node: AST.SvelteAwaitBlock & ASTNodeWithParent) => void;
	SvelteAwaitPendingBlock?: (node: AST.SvelteAwaitPendingBlock & ASTNodeWithParent) => void;
	'SvelteAwaitPendingBlock:exit'?: (node: AST.SvelteAwaitPendingBlock & ASTNodeWithParent) => void;
	SvelteAwaitThenBlock?: (node: AST.SvelteAwaitThenBlock & ASTNodeWithParent) => void;
	'SvelteAwaitThenBlock:exit'?: (node: AST.SvelteAwaitThenBlock & ASTNodeWithParent) => void;
	SvelteAwaitCatchBlock?: (node: AST.SvelteAwaitCatchBlock & ASTNodeWithParent) => void;
	'SvelteAwaitCatchBlock:exit'?: (node: AST.SvelteAwaitCatchBlock & ASTNodeWithParent) => void;
	SvelteKeyBlock?: (node: AST.SvelteKeyBlock & ASTNodeWithParent) => void;
	'SvelteKeyBlock:exit'?: (node: AST.SvelteKeyBlock & ASTNodeWithParent) => void;
	SvelteSnippetBlock?: (node: AST.SvelteSnippetBlock & ASTNodeWithParent) => void;
	'SvelteSnippetBlock:exit'?: (node: AST.SvelteSnippetBlock & ASTNodeWithParent) => void;
	SvelteAttribute?: (node: AST.SvelteAttribute & ASTNodeWithParent) => void;
	'SvelteAttribute:exit'?: (node: AST.SvelteAttribute & ASTNodeWithParent) => void;
	SvelteShorthandAttribute?: (node: AST.SvelteShorthandAttribute & ASTNodeWithParent) => void;
	'SvelteShorthandAttribute:exit'?: (
		node: AST.SvelteShorthandAttribute & ASTNodeWithParent
	) => void;
	SvelteSpreadAttribute?: (node: AST.SvelteSpreadAttribute & ASTNodeWithParent) => void;
	'SvelteSpreadAttribute:exit'?: (node: AST.SvelteSpreadAttribute & ASTNodeWithParent) => void;
	SvelteDirective?: (node: AST.SvelteDirective & ASTNodeWithParent) => void;
	'SvelteDirective:exit'?: (node: AST.SvelteDirective & ASTNodeWithParent) => void;
	SvelteStyleDirective?: (node: AST.SvelteStyleDirective & ASTNodeWithParent) => void;
	'SvelteStyleDirective:exit'?: (node: AST.SvelteStyleDirective & ASTNodeWithParent) => void;
	SvelteSpecialDirective?: (node: AST.SvelteSpecialDirective & ASTNodeWithParent) => void;
	'SvelteSpecialDirective:exit'?: (node: AST.SvelteSpecialDirective & ASTNodeWithParent) => void;
	SvelteGenericsDirective?: (node: AST.SvelteGenericsDirective & ASTNodeWithParent) => void;
	'SvelteGenericsDirective:exit'?: (node: AST.SvelteGenericsDirective & ASTNodeWithParent) => void;
	SvelteDirectiveKey?: (node: AST.SvelteDirectiveKey & ASTNodeWithParent) => void;
	'SvelteDirectiveKey:exit'?: (node: AST.SvelteDirectiveKey & ASTNodeWithParent) => void;
	SvelteSpecialDirectiveKey?: (node: AST.SvelteSpecialDirectiveKey & ASTNodeWithParent) => void;
	'SvelteSpecialDirectiveKey:exit'?: (
		node: AST.SvelteSpecialDirectiveKey & ASTNodeWithParent
	) => void;
	SvelteText?: (node: AST.SvelteText & ASTNodeWithParent) => void;
	'SvelteText:exit'?: (node: AST.SvelteText & ASTNodeWithParent) => void;
	SvelteHTMLComment?: (node: AST.SvelteHTMLComment & ASTNodeWithParent) => void;
	'SvelteHTMLComment:exit'?: (node: AST.SvelteHTMLComment & ASTNodeWithParent) => void;
};
