import type { RuleModule } from "../types"
import noAtDebugTags from "../rules/no-at-debug-tags"
import noAtHtmlTags from "../rules/no-at-html-tags"
import spacedHtmlComment from "../rules/spaced-html-comment"

export const rules = [
  noAtDebugTags,
  noAtHtmlTags,
  spacedHtmlComment,
] as RuleModule[]
