import type { RuleModule } from "../types"
import buttonHasType from "../rules/button-has-type"
import commentDirective from "../rules/comment-directive"
import firstAttributeLinebreak from "../rules/first-attribute-linebreak"
import htmlQuotes from "../rules/html-quotes"
import indent from "../rules/indent"
import maxAttributesPerLine from "../rules/max-attributes-per-line"
import noAtDebugTags from "../rules/no-at-debug-tags"
import noAtHtmlTags from "../rules/no-at-html-tags"
import noDupeElseIfBlocks from "../rules/no-dupe-else-if-blocks"
import noDynamicSlotName from "../rules/no-dynamic-slot-name"
import noInnerDeclarations from "../rules/no-inner-declarations"
import noNotFunctionHandler from "../rules/no-not-function-handler"
import noObjectInTextMustaches from "../rules/no-object-in-text-mustaches"
import noTargetBlank from "../rules/no-target-blank"
import noUselessMustaches from "../rules/no-useless-mustaches"
import preferClassDirective from "../rules/prefer-class-directive"
import shorthandAttribute from "../rules/shorthand-attribute"
import spacedHtmlComment from "../rules/spaced-html-comment"
import system from "../rules/system"
import validCompile from "../rules/valid-compile"

export const rules = [
  buttonHasType,
  commentDirective,
  firstAttributeLinebreak,
  htmlQuotes,
  indent,
  maxAttributesPerLine,
  noAtDebugTags,
  noAtHtmlTags,
  noDupeElseIfBlocks,
  noDynamicSlotName,
  noInnerDeclarations,
  noNotFunctionHandler,
  noObjectInTextMustaches,
  noTargetBlank,
  noUselessMustaches,
  preferClassDirective,
  shorthandAttribute,
  spacedHtmlComment,
  system,
  validCompile,
] as RuleModule[]
