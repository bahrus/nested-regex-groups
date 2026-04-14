# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Core parsing functionality with `nestedRegex()`, `createParser()`, `tryPatterns()`
- Template tag syntax with `rx`, `rxPattern`, and `rxParser` for clean code-based patterns
- **Runtime parsing with `parsePattern()` and `parsePatterns()` for JSON config workflows**
- Support for dot notation in capture group names via groupMap
- Automatic conversion from dots to underscores in template tags and runtime parsers
- Full TypeScript support with type inference
- Comprehensive test suite (57 tests)
- Documentation: README, GETTING_STARTED, TEMPLATE_TAG, JSON_CONFIG, PUBLISHING guides
- Examples for core API, template tags, and JSON config workflows
- Support for multiple nesting levels
- Pattern priority ordering
- Verbose error mode
- Zero dependencies

### Features
- ✨ Template tag syntax for clean, intuitive patterns in code
- 📄 Runtime parsing for JSON config files (perfect for .mjs → JSON workflow)
- 🎯 Multiple pattern matching with priority order
- 📦 Zero dependencies, tiny footprint
- 🔒 Type-safe with full TypeScript support
- 🚀 Fast with minimal overhead
- 🧩 Composable parsers
- 🌳 Tree-shakeable template tag module
- 🔄 Dynamic pattern loading from files, APIs, databases

## [0.1.0] - TBD

Initial release.
