# Implementation Plan: Modular Exports

## Overview

This implementation follows a 5-phase migration strategy to split the monolithic `index.ts` into 13 focused modules with subpath exports. The approach ensures backward compatibility while enabling selective imports for buildless environments.

**Key principles:**
- Extract modules in dependency order (utilities first, high-level last)
- Update imports to use relative paths with `.js` extensions
- Maintain all existing functionality and test coverage
- Add subpath exports incrementally

## Tasks

- [ ] 1. Phase 1: Extract core utility modules (zero dependencies)
  - [ ] 1.1 Create flat-to-nested.ts module
    - Extract `flatToNested` function from index.ts
    - Add type imports from types/nested-regex-groups/types.js
    - Add JSDoc comments
    - _Requirements: 1.1, 1.5, 7.1_
  
  - [ ] 1.2 Create merge-results.ts module
    - Extract `mergeResults` function from index.ts
    - Add type imports for ParseResult
    - Add JSDoc comments
    - _Requirements: 1.1, 1.5, 7.1_
  
  - [ ] 1.3 Create split-statements.ts module
    - Extract `splitStatements` function from index.ts
    - Ensure zero dependencies (standalone module)
    - Add JSDoc comments with examples
    - _Requirements: 1.1, 1.4, 8.1_

- [ ] 2. Phase 1: Extract core parsing modules
  - [ ] 2.1 Create nested-regex.ts module
    - Extract `nestedRegex` and `applyGroupMap` functions from index.ts
    - Import `flatToNested` from ./flat-to-nested.js
    - Keep `applyGroupMap` as internal helper (not exported)
    - Add type imports
    - _Requirements: 1.3, 7.1, 7.2_
  
  - [ ] 2.2 Create try-patterns.ts module
    - Extract `tryPatterns` function from index.ts
    - Import `nestedRegex` from ./nested-regex.js
    - Add type imports
    - _Requirements: 1.3, 7.2, 7.5_
  
  - [ ] 2.3 Create create-parser.ts module
    - Extract `createParser` function from index.ts
    - Import `tryPatterns` from ./try-patterns.js
    - Add type imports
    - _Requirements: 1.3, 7.2_

- [ ] 3. Phase 1: Extract runtime pattern parsing modules
  - [ ] 3.1 Create parse-pattern.ts module
    - Extract `parsePattern` function from index.ts
    - Import `nestedRegex` from ./nested-regex.js
    - Add type imports
    - _Requirements: 1.3, 7.3_
  
  - [ ] 3.2 Create parse-patterns.ts module
    - Extract `parsePatterns` and `convertToPatternsWithGroupMap` from index.ts
    - Export `convertToPatternsWithGroupMap` for reuse by parse-pattern-statements
    - Import `createParser` from ./create-parser.js
    - Add type imports
    - _Requirements: 1.3, 7.4_

- [ ] 4. Phase 1: Extract flat group parsing modules
  - [ ] 4.1 Create parse-grouped-captures.ts module
    - Extract `parseGroupedCaptures` function from index.ts
    - Ensure zero library dependencies (uses standard regex)
    - Add type imports
    - _Requirements: 1.1, 8.2_
  
  - [ ] 4.2 Create parse-grouped-capture-statements.ts module
    - Extract `parseGroupedCaptureStatements` function from index.ts
    - Import `splitStatements` from ./split-statements.js
    - Import `parseGroupedCaptures` from ./parse-grouped-captures.js
    - Add type imports
    - _Requirements: 1.3, 8.3_

- [ ] 5. Phase 1: Extract nested statement parsing module
  - [ ] 5.1 Create parse-pattern-statements.ts module
    - Extract `parsePatternStatements` and `parseParagraph` alias from index.ts
    - Import `splitStatements` from ./split-statements.js
    - Import `tryPatterns` from ./try-patterns.js
    - Import `convertToPatternsWithGroupMap` from ./parse-patterns.js
    - Remove `convertToPatternsWithGroupMap` from this file (use import)
    - Export both `parsePatternStatements` and `parseParagraph`
    - Add type imports
    - _Requirements: 1.3, 8.4, 8.5_

- [ ] 6. Checkpoint - Verify module extraction
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Phase 2: Update barrel export (index.ts)
  - [ ] 7.1 Replace function implementations with re-exports
    - Keep type re-exports at the top
    - Replace all function implementations with export statements from modules
    - Maintain exact same export names and order
    - Use relative imports with .js extensions
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [ ]* 7.2 Verify barrel export completeness
    - Check that all functions are re-exported
    - Verify no internal helpers are exported (applyGroupMap, convertToPatternsWithGroupMap)
    - _Requirements: 3.1, 3.5_

- [ ] 8. Phase 3: Update template.ts imports
  - [ ] 8.1 Update template.ts to import from specific modules
    - Change import from './index.js' to './nested-regex.js' for nestedRegex
    - Change import from './index.js' to './create-parser.js' for createParser
    - Keep type imports from './index.js' or import directly from types
    - Verify all internal helper functions remain unchanged
    - _Requirements: 9.2, 9.4, 9.5_

- [ ] 9. Phase 4: Update package.json configuration
  - [ ] 9.1 Add subpath exports for all 13 modules
    - Add exports for flat-to-nested, merge-results, split-statements
    - Add exports for nested-regex, try-patterns, create-parser
    - Add exports for parse-pattern, parse-patterns
    - Add exports for parse-grouped-captures, parse-grouped-capture-statements
    - Add exports for parse-pattern-statements
    - Each export should include both "types" and "import" fields
    - Follow naming pattern: nested-regex-groups/{module-name}
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [ ] 9.2 Update files array with all new module files
    - Add all .js files for the 13 new modules
    - Add all .d.ts files for the 13 new modules
    - Keep existing files (index, template, types)
    - _Requirements: 2.1, 6.1, 6.2_

- [ ] 10. Phase 5: Build and verify TypeScript compilation
  - [ ] 10.1 Run TypeScript compiler
    - Execute `npm run build` to generate .d.ts files
    - Verify all 13 modules have corresponding .d.ts files
    - Check for compilation errors
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 11. Checkpoint - Verify build output
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Phase 5: Run test suite and verification
  - [ ]* 12.1 Run existing test suite
    - Execute `npm test` to run all existing tests
    - Verify no regressions in index.test.ts
    - Verify no regressions in template.test.ts
    - _Requirements: 3.2, 3.3, 3.4_
  
  - [ ]* 12.2 Test subpath imports manually
    - Create a test file that imports from each subpath
    - Verify split-statements works standalone
    - Verify nested-regex works with flat-to-nested dependency
    - Verify parse-pattern-statements works with full dependency chain
    - _Requirements: 2.2, 4.1, 4.2, 4.3_
  
  - [ ]* 12.3 Verify backward compatibility
    - Test that existing imports from 'nested-regex-groups' still work
    - Test that existing imports from 'nested-regex-groups/template' still work
    - Verify function signatures are identical
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 13. Documentation updates
  - [ ] 13.1 Update README with subpath import documentation
    - Document all 13 available subpath imports
    - Provide examples of selective imports for common use cases
    - Explain benefits in buildless environments
    - Show before/after import examples
    - _Requirements: 10.1, 10.2, 10.4_
  
  - [ ] 13.2 Add migration guide to README
    - Show old import style (still supported)
    - Show new selective import style
    - Explain which functions are grouped together and why
    - Provide buildless environment example
    - _Requirements: 10.3, 10.5_

- [ ] 14. Final checkpoint - Complete verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional testing and verification tasks
- Each implementation task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Module extraction follows strict dependency order to prevent circular dependencies
- All imports use `.js` extensions for browser compatibility
- Internal helpers (applyGroupMap) remain private, shared helpers (convertToPatternsWithGroupMap) are exported
- Backward compatibility is maintained throughout - existing imports continue to work
