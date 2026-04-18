// Re-export types from types.d.ts
export type {
  ParseSuccess,
  ParseFailure,
  ParseResult,
  ParsePattern,
  PatternConfig,
  NestedRegexOptions,
  ParserOptions,
  StatementsResult
} from './types/nested-regex-groups/types.js';

// Re-export utilities
export { flatToNested } from './flat-to-nested.js';
export { mergeResults } from './merge-results.js';

// Re-export statement processing
export { splitStatements } from './split-statements.js';

// Re-export core parsing
export { nestedRegex } from './nested-regex.js';
export { tryPatterns } from './try-patterns.js';
export { createParser } from './create-parser.js';

// Re-export runtime pattern parsing
export { parsePattern } from './parse-pattern.js';
export { parsePatterns } from './parse-patterns.js';

// Re-export flat group parsing
export { parseGroupedCaptures } from './parse-grouped-captures.js';
export { parseGroupedCaptureStatements } from './parse-grouped-capture-statements.js';

// Re-export nested statement parsing
export { parsePatternStatements, parseParagraph } from './parse-pattern-statements.js';
