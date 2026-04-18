# Requirements Document

## Introduction

This feature enables modular imports for the nested-regex-groups library, allowing users to import only the functions they need without loading the entire module. This is critical for buildless environments where tree-shaking is not available, reducing bundle size and improving load times for users who only need specific functionality.

## Glossary

- **Library**: The nested-regex-groups package
- **Module**: A separate JavaScript file containing one or more exported functions
- **Buildless_Environment**: A runtime environment where JavaScript is executed directly without a build step or bundler
- **Tree_Shaking**: Build-time optimization that removes unused code (not available in buildless environments)
- **Barrel_Export**: The main index.js file that re-exports all functions from individual modules
- **Subpath_Export**: A package.json exports field entry that maps an import path to a specific module file

## Requirements

### Requirement 1: Independent Module Files

**User Story:** As a developer, I want to import individual functions from separate files, so that I only load the code I need in buildless environments.

#### Acceptance Criteria

1. THE Library SHALL provide a separate module file for each independent function or closely related function group
2. WHEN a module has no dependencies on other Library functions, THE Library SHALL place it in a standalone file
3. WHEN multiple functions share dependencies and are commonly used together, THE Library SHALL group them in a single module file
4. THE Library SHALL maintain the splitStatements function in a standalone module with no internal dependencies
5. THE Library SHALL maintain utility functions (flatToNested, mergeResults) in separate modules based on their dependency relationships

### Requirement 2: Subpath Export Configuration

**User Story:** As a developer, I want to use clean import paths like 'nested-regex-groups/split-statements', so that my code is readable and maintainable.

#### Acceptance Criteria

1. THE Library SHALL define subpath exports in package.json for each module file
2. WHEN a user imports from a subpath, THE Library SHALL resolve to the corresponding module file
3. THE Library SHALL provide both .js file extensions and extensionless subpath exports
4. THE Library SHALL include TypeScript type definitions for each subpath export
5. FOR ALL subpath exports, THE Library SHALL follow the naming pattern 'nested-regex-groups/{function-name}' in kebab-case

### Requirement 3: Backward Compatibility

**User Story:** As an existing user, I want my current imports to continue working, so that I don't need to refactor my code when upgrading.

#### Acceptance Criteria

1. THE Barrel_Export SHALL re-export all functions from individual modules
2. WHEN a user imports from 'nested-regex-groups', THE Library SHALL provide all functions as before
3. THE Library SHALL maintain identical function signatures and behavior
4. THE Library SHALL maintain identical TypeScript type exports
5. THE Library SHALL not introduce breaking changes to the public API

### Requirement 4: Buildless Environment Support

**User Story:** As a developer using buildless environments, I want to import only what I need, so that I minimize the code loaded in the browser.

#### Acceptance Criteria

1. WHEN a user imports a single function via subpath export, THE Library SHALL load only that function's module and its dependencies
2. THE Library SHALL use ESM import/export syntax compatible with modern browsers
3. THE Library SHALL not require a build step for subpath imports to function correctly
4. WHEN a module depends on another Library module, THE Library SHALL use relative imports between module files
5. THE Library SHALL ensure all module files have .js extensions in import statements for browser compatibility

### Requirement 5: Module Dependency Organization

**User Story:** As a maintainer, I want modules organized by dependency relationships, so that the codebase is maintainable and import chains are minimal.

#### Acceptance Criteria

1. THE Library SHALL place zero-dependency functions in standalone modules
2. THE Library SHALL group functions that depend on the same core utilities
3. WHEN a function depends on multiple other functions, THE Library SHALL evaluate whether to group them or keep them separate based on common usage patterns
4. THE Library SHALL document module dependencies in code comments
5. THE Library SHALL minimize circular dependencies between modules

### Requirement 6: Type Definition Organization

**User Story:** As a TypeScript user, I want type definitions for each module, so that I get proper type checking and autocomplete for subpath imports.

#### Acceptance Criteria

1. THE Library SHALL provide a .d.ts file for each module file
2. WHEN a user imports from a subpath in TypeScript, THE Library SHALL provide correct type information
3. THE Library SHALL re-export shared types from the central types file
4. THE Library SHALL ensure type definitions match the runtime exports exactly
5. THE Library SHALL include JSDoc comments in type definitions for IDE documentation

### Requirement 7: Core Function Modules

**User Story:** As a developer, I want to import core parsing functions independently, so that I can use just the parsing functionality I need.

#### Acceptance Criteria

1. THE Library SHALL provide nestedRegex in a core module with minimal dependencies
2. THE Library SHALL provide createParser in a module that depends only on nestedRegex and tryPatterns
3. THE Library SHALL provide parsePattern in a module for runtime pattern parsing
4. THE Library SHALL provide parsePatterns in a module for JSON config parsing
5. THE Library SHALL group tryPatterns with related pattern-matching utilities

### Requirement 8: Statement Processing Modules

**User Story:** As a developer, I want to import statement processing functions independently, so that I can parse multi-statement inputs without loading unused parsers.

#### Acceptance Criteria

1. THE Library SHALL provide splitStatements as a standalone module with zero dependencies
2. THE Library SHALL provide parseGroupedCaptures in a module for flat group parsing
3. THE Library SHALL provide parseGroupedCaptureStatements in a module that depends on splitStatements and parseGroupedCaptures
4. THE Library SHALL provide parsePatternStatements in a module that depends on splitStatements and pattern parsing functions
5. THE Library SHALL provide parseParagraph as an alias export in the parsePatternStatements module

### Requirement 9: Template Tag Module Separation

**User Story:** As a developer, I want the template tag functionality to remain separate, so that I can continue using the existing modular structure.

#### Acceptance Criteria

1. THE Library SHALL maintain template.js as a separate module
2. THE Library SHALL ensure template.js imports only necessary functions from other modules
3. THE Library SHALL maintain the existing 'nested-regex-groups/template' subpath export
4. THE Library SHALL not duplicate code between template.js and other modules
5. THE Library SHALL update template.js imports to use the new modular structure

### Requirement 10: Documentation and Examples

**User Story:** As a developer, I want documentation showing how to use subpath imports, so that I can understand the new import options.

#### Acceptance Criteria

1. THE Library SHALL document all available subpath imports in the README
2. THE Library SHALL provide examples of selective imports for common use cases
3. THE Library SHALL document which functions are grouped together and why
4. THE Library SHALL explain the benefits of subpath imports in buildless environments
5. THE Library SHALL provide a migration guide showing both old and new import styles
