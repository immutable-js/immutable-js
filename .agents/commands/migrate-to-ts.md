# Migrate a source file from JavaScript to TypeScript

Migrate the file `$ARGUMENTS` from JavaScript to TypeScript following the
conventions of the immutable-js 6.x branch.

## Steps

1. **Rename** the file: replace the `.js` extension with `.ts`.
   Make sure to update any imports of this file in other source files.

2. **Add explicit types** to all function parameters, return values, and
   class properties. Do not use `any` — use `unknown` or proper types instead.

3. **Remove JSDoc type annotations** (`@param {Foo}`, `@returns {Bar}`, etc.)
   where TypeScript types now make them redundant. Keep non-type JSDoc (e.g.
   `@deprecated`, meaningful descriptions).

4. **Fix imports**: use `import type` for type-only imports. Import from the
   concrete `.ts` source files, not from `type-definitions/immutable.d.ts`.

5. **Cross-reference `type-definitions/immutable.d.ts`** — this file is the
   authoritative source for the current public API types and documentation.
   It must not be modified during a file migration: it will be deleted in one
   shot once the full migration is complete.

   When writing types for the migrated file:

   - Open `immutable.d.ts` and find the declarations that correspond to the
     symbols you are migrating.
   - **Copy the JSDoc description** from `immutable.d.ts` to the migrated
     symbol. This is the authoritative public API documentation. Keep the
     full comment block, stripping only the `@param {Type}` and
     `@returns {Type}` type annotations that TypeScript types now replace;
     preserve `@param` descriptions, `@example` blocks, `@deprecated`,
     `@see`, etc.
   - If the hand-written declaration is **stricter** than what you would
     naturally write (narrower union, branded type, stricter generic
     constraint…), **keep that stricter typing** in the new `.ts` source —
     do not relax it.
   - **Preserve every overload signature.** Many methods are declared with
     multiple signatures in `immutable.d.ts` (e.g. `filter` and `partition`
     have a type-guard overload `=> value is F` plus a plain one; `flatMap`,
     `flatten`, `zip`, `zipWith`, `count`, `first`/`last`/`get` all have
     several). Do **not** collapse them into a single signature — copy each
     overload, then write **one loose implementation signature** that is
     compatible with all of them — use the widest parameter and return types
     (e.g. a rest parameter of `Array<unknown>` returning `unknown`). The
     implementation signature is not visible to callers; only the overloads
     are. Adapt the
     public collection types to the internal `*Impl` ones (e.g.
     `Collection<K, F>` → `CollectionImpl<K, F>`). When overriding an
     overloaded base method in a subclass, redeclare **all** the overloads
     with the `override` modifier — otherwise the inherited overloads are
     hidden.
   - If you are **unsure** whether your type matches the intent of the
     hand-written declaration, or if reconciling them feels complex, **stop
     and ask the user** before continuing.
   - The type-level tests in `type-definitions/ts-tests/` are your safety
     net: run `npm run test:types` to catch regressions.

6. **Do not add backwards-compatibility shims** or re-exports — remove code
   cleanly.

7. **Add or update type tests** in `type-definitions/ts-tests/`: if the
   migrated file introduces or refines public types that are not yet covered,
   add the missing tests. Run `npm run test:types` to verify.

8. **Verify**:
   ```bash
   npm run type-check
   npm run test:unit
   npm run test:types
   npm run lint
   ```
   Fix any errors before considering the migration complete.

## Conventions to follow

- Strict TypeScript: no `any`, honour `noUncheckedIndexedAccess`.
- Internal implementation classes are named `*Impl` and are not exported.
- Factory functions are not class constructors — do not expose `new` in the
  public API.
- Imports must be ordered alphabetically (`import/order` ESLint rule).
- `import type` for type-only imports (`verbatimModuleSyntax` is enabled).
- Run `npm run format` after editing to apply Prettier.
