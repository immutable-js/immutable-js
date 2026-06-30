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

8. **Un-skip the matching source-pass type tests** in
   `type-definitions/ts-tests-src/`. These files are duplicates of the ones in
   `type-definitions/ts-tests/`, but their `tsconfig.json` resolves `immutable`
   against the **TS source** (`src/Immutable.js`) instead of the hand-written
   `type-definitions/immutable.d.ts`. They validate the types actually emitted
   by the migration, not the reference declarations.

   Every test there starts as `test.skip(...)` because, mid-migration, the
   public factories (`List`, `Map`, …) and public type names (`List<number>` as
   a _type_) live only in `immutable.d.ts` — a test routed through a not-yet-
   migrated factory cannot even type-check against the source (its errors are
   suppressed only because the test is skipped).

   **This is the skip-list to keep up to date.** When you migrate a file:

   - In the corresponding `ts-tests-src/*.ts` file(s), change `test.skip(` back
     to `test(` for the tests that now pass against the source, and run
     `npm run test:types`. A test only goes green here once **everything it
     touches** is migrated (the factory _and_ the methods _and_ the public type
     name it asserts) — so a single collection migration may un-skip a whole
     file, or only part of it.
   - If a d.ts-only type was removed from a duplicate's imports (e.g. `MapOf`,
     `RecordOf`, `DeepCopy` — see the header comment in each file), add it back
     once it exists in the source.
   - When the skip-list is empty and every source-pass test is green, the
     migration is complete: flip the `immutable` path in
     `type-definitions/ts-tests/tsconfig.json` to the source too (or delete the
     duplicate directory) and remove `type-definitions/immutable.d.ts`.

9. **Verify**:
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

## Covariant `this` return types (`slice` / `reverse` / `sort` / `skip` / …)

A family of methods (`slice`, `reverse`, `sort`, `sortBy`, `skip`, `skipLast`,
`skipWhile`, `skipUntil`, `take`, `takeLast`, `takeWhile`, `rest`, `butLast`,
`interpose`, `interleave`) is declared **once** on the base `Collection`
interface as `: this`. `CollectionImpl`/`IndexedCollectionImpl` implement them
through the generic helpers `reify<S>(iter, seq: S): S` and
`sliceFactory<C extends CollectionImpl>(c: C, …): C` (`src/operations/`). Because
those signatures are _generic identities_, calling `reify(this, sliceFactory(this, …))`
infers `S = C = this`, so the base returns `this` with **no call-site cast** —
the single `as unknown as` cast lives once inside `reify`. `List`/`Map`/`Stack`
inherit this and need nothing.

The problem only appears in a **leaf** that _overrides_ one of these methods and
rebuilds its result via a **concrete factory** (`new RangeImpl(…)`, `Range(…)`,
`makeStack(…)`, `OrderedMap(…)`): TypeScript cannot prove the concrete instance
equals the polymorphic `this`. Decision rule when migrating such a leaf:

1. **You don't override it** → nothing to do (inherited via `reify`, cast-free).
2. **You rebuild through a generic-identity helper** (`reify(this, …Factory(this, …))`,
   or an internal factory you type `<C extends XImpl>(c: C, …): C` — e.g.
   `setListBounds`) → cast-free; the generic carries `this`. **Prefer this**: when
   the result derives from the receiver, make the internal factory generic-identity
   instead of casting.
3. **You rebuild from scratch via a concrete factory** → keep the `: this`
   return type and cast the constructed value: `return Range(…) as this;`. This is
   the same cast `reify` hides, just surfaced because the helper is bypassed.
4. **The override returns a _divergent_ concrete type** (e.g. `Map.sort` →
   `OrderedMap`) → type it as the intersection the d.ts already uses,
   `this & OrderedMap<K, V>` (assignable to `this`, so a valid override), and cast:
   `return OrderedMap(…) as this & OrderedMap<K, V>;`.

The `as this` / `as this & …` cast is **erased at compile time — zero runtime
cost**. Do **not** reach for an F-bounded `Self` type parameter (viral across the
whole class hierarchy, risks `tsc` slowdowns, and cannot express the divergent
`sort` return) nor a runtime `__reconstruct()` hook (adds runtime code, same
`sort` limitation). The localized cast is the minimum and the idiomatic choice
here. Known sites: `Range.slice`, and (once migrated) `Repeat.slice`,
`Stack.slice`, `Map.sort`/`sortBy`, `Set.sort`/`sortBy`.
