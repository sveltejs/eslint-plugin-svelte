import type { RuleModule } from "../types"
import buttonHasType from "../rules/button-has-type"
import commentDirective from "../rules/comment-directive"
import firstAttributeLinebreak from "../rules/first-attribute-linebreak"
import htmlClosingBracketSpacing from "../rules/html-closing-bracket-spacing"
import htmlQuotes from "../rules/html-quotes"
import htmlSelfClosing from "../rules/html-self-closing"
import indent from "../rules/indent"
import maxAttributesPerLine from "../rules/max-attributes-per-line"
import mustacheSpacing from "../rules/mustache-spacing"
import noAtDebugTags from "../rules/no-at-debug-tags"
import noAtHtmlTags from "../rules/no-at-html-tags"
import noDupeElseIfBlocks from "../rules/no-dupe-else-if-blocks"
import noDupeStyleProperties from "../rules/no-dupe-style-properties"
import noDynamicSlotName from "../rules/no-dynamic-slot-name"
import noInnerDeclarations from "../rules/no-inner-declarations"
import noNotFunctionHandler from "../rules/no-not-function-handler"
import noObjectInTextMustaches from "../rules/no-object-in-text-mustaches"
import noShorthandStylePropertyOverrides from "../rules/no-shorthand-style-property-overrides"
import noSpacesAroundEqualSignsInAttribute from "../rules/no-spaces-around-equal-signs-in-attribute"
import noTargetBlank from "../rules/no-target-blank"
import noUnknownStyleDirectiveProperty from "../rules/no-unknown-style-directive-property"
import noUnusedSvelteIgnore from "../rules/no-unused-svelte-ignore"
import noUselessMustaches from "../rules/no-useless-mustaches"
import preferClassDirective from "../rules/prefer-class-directive"
import preferStyleDirective from "../rules/prefer-style-directive"
import requireOptimizedStyleAttribute from "../rules/require-optimized-style-attribute"
import shorthandAttribute from "../rules/shorthand-attribute"
import shorthandDirective from "../rules/shorthand-directive"
import spacedHtmlComment from "../rules/spaced-html-comment"
import system from "../rules/system"
import validCompile from "../rules/valid-compile"

export const rules = [
  buttonHasType,
  commentDirective,
  firstAttributeLinebreak,
  htmlClosingBracketSpacing,
  htmlQuotes,
  htmlSelfClosing,
  indent,
  maxAttributesPerLine,
  mustacheSpacing,
  noAtDebugTags,
  noAtHtmlTags,
  noDupeElseIfBlocks,
  noDupeStyleProperties,
  noDynamicSlotName,
  noInnerDeclarations,
  noNotFunctionHandler,
  noObjectInTextMustaches,
  noShorthandStylePropertyOverrides,
  noSpacesAroundEqualSignsInAttribute,
  noTargetBlank,
  noUnknownStyleDirectiveProperty,
  noUnusedSvelteIgnore,
  noUselessMustaches,
  preferClassDirective,
  preferStyleDirective,
  requireOptimizedStyleAttribute,
  shorthandAttribute,
  shorthandDirective,
  spacedHtmlComment,
  system,
  validCompile,
] as RuleModule[]
