import type { RuleModule } from "../types"
import noAtDebugTags from "../rules/no-at-debug-tags"
import noAtHtmlTags from "../rules/no-at-html-tags"
import noDupeElseIfBlocks from "../rules/no-dupe-else-if-blocks"
import preferClassDirective from "../rules/prefer-class-directive"
import spacedHtmlComment from "../rules/spaced-html-comment"

export const rules = [
  noAtDebugTags,
  noAtHtmlTags,
  noDupeElseIfBlocks,
  preferClassDirective,
  spacedHtmlComment,
] as RuleModule[]
