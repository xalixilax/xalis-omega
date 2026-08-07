# Code Standard

This is the base standard for TypeScript and TSX code.

Use `MUST` for required rules, `SHOULD` for normal choices, and `MAY` for optional choices.

## Existing Rules

- Formatting and lint rules are defined in [`.oxfmtrc.json`](../.oxfmtrc.json) and [`.oxlintrc.json`](../.oxlintrc.json); package and route structure is defined in [`FILE_STRUCTURE.md`](./FILE_STRUCTURE.md).

## Tooling

- Oxfmt is the formatter. Run `pnpm format` to write formatting changes.
- Oxlint is the linter. Run `pnpm lint` to check the code and `pnpm lint:fix` to apply safe fixes.
- Run `pnpm check` before review. It checks formatting and lint rules without changing files.

## Naming

- Use the product's domain terms. Keep names clear and specific.
- Use `camelCase` for variables, functions, object properties, and exported values.
- Use `PascalCase` for types, interfaces, classes, and React components.
- Use `UPPER_SNAKE_CASE` only for immutable configuration-like constants.
- New source files **SHOULD** use `kebab-case`. Framework and generated file names **MAY** differ.
- Use these role suffixes when they apply: `Schema`, `Service`, `ServerFn`, `QueryOptions`, `MutationOptions`, and `Props`.

## TypeScript

- Do not use `any` or type assertions unless there is a clear reason.
- Derive types from validation schemas, database schemas, or library types when possible.

## Modules

- Keep feature-specific code in the structure defined by [`FILE_STRUCTURE.md`](./FILE_STRUCTURE.md).
- Use `@/`, `@shared/`, and `@design-system/` for cross-feature or cross-package imports; use relative imports for small, local features.
- Oxfmt **MUST** format files and organize imports. Do not hand-maintain import order.
- Do not add barrel files unless they define a deliberate public API.

## React

- Keep components focused on rendering and user interaction.
- Move reusable stateful logic into `use*` hooks.
- Define non-trivial component prop types near the component and use the `Props` suffix.
- Do not use an effect for a value that can be derived during render or handled by an event.

## Validation And Errors

- Validate untrusted input at the boundary.
- Throw or return an explicit error when an operation cannot meet its contract.
- Do not ignore errors silently.
- Catch an error only to add context, translate it to a safe response, or recover.

## Tests

- Add tests for new or changed business logic, validation, server functions, and bug fixes.
- Test important user-visible component behavior using Storybook.
- Do not require tests for trivial wrappers or generated files.
- Keep tests near the related feature or in the documented `tests` directories.

## Comments And Documentation

- Comments **SHOULD** explain why code is needed, not what clear code already says.
- Document domain constraints, workarounds, and public module contracts.
- Keep comments and documentation current.

## Generated Code

- Do not edit generated files by hand.
- Change the source or configuration, then run the generator.
- Generated output **MAY** be committed when the repository already tracks it.
