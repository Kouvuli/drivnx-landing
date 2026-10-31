---
name: refactoring
description: Restructures existing code without changing its behaviour - moving logic into its own module, extracting or splitting modules, removing duplication and dead code, deepening shallow modules, renaming, or migrating to a new major framework or language version - with proof that nothing behaves differently. Use when asked to refactor, clean up, restructure, untangle, move or modernise code, to make a change easier before building it, or to upgrade or migrate a version without behaviour changes.
license: MIT
---

# Refactoring

## Purpose
Better structure, same behaviour - and proof of the "same". A refactor that changes behaviour is a feature or a bug fix wearing the wrong label.

## When to use
- "Refactor / clean up / extract / split / untangle this", removing duplication or dead code, turning shallow modules into deep ones.
- Preparing code so a planned change becomes easy ("make the change easy, then make the easy change").
- Upgrading a framework or language version (Java 8 -> 21, a major library release) where behaviour must not change.

## When NOT to use
- Behaviour is supposed to change: `implementation`, `tdd` or `debugging`.
- Deciding the target structure itself: `architecture` (then come back here to move the code).
- A mechanical change across hundreds of call sites: sequence it as expand - migrate in batches - contract tickets (`planning`).
- Speed: `performance`. Bloat review without moving code: `simplicity-guard`.

## Procedure
1. **Draw the preservation boundary**: what must stay identical - public interfaces, outputs, error behaviour, ordering, side effects, compatibility - and what may change (internal names, file layout). Write it down in one or two lines.
2. **Choose where, if not given**: favour code that changes often (`git log --stat` hot spots) and friction you can name - a concept spread over many small modules, an interface as complex as its implementation, code untestable through its interface. Apply the deletion test (`architecture`). Present candidates with a strength (strong / worth exploring / speculative) and let the user pick.
3. **Pin behaviour before touching code**: run the existing tests and confirm they are green. Where coverage is thin, add characterization tests through the public interface that assert what the code **does now** - literal inputs and outputs, every branch, boundary values (zero, negative, empty, maximum) - even where the result looks wrong. The current code is the oracle: record suspected bugs separately; fixing them is a different change.
4. **Prove the pins can fail**: break the code in one small way that matters (a rounding mode, an off-by-one, a flipped comparison), see at least one test go red, restore it. If nothing fails, add cases.
5. **Move in small steps**, one boundary at a time: each step compiles and the tests stay green; commit at green points. No feature changes, no new dependencies or configuration, no "while I'm here" fixes inside the refactor.
6. **Version upgrades**: list the breaking changes between the two versions from the official release notes and migration guides, migrate one module or project at a time with the smallest diff, run its tests after each, and keep the old and new versions' results comparable.
7. **Verify with the same proof**: the same tests, now green against the new structure; report how many tests actually ran (a suite that is green because everything was skipped proves nothing). The diff should read as behaviour-neutral; commit it as a refactor.

## Output
The preservation boundary, the characterization tests added (and that each was seen failing on a deliberate break), the restructured code in green steps, suspected bugs found along the way (reported, not fixed), and the final test run with counts.

## Failure modes
- Restructuring before any test pins the behaviour, or with tests that cannot fail.
- "Fixing" a bug inside a refactor, so neither change can be reviewed or reverted alone.
- Big-bang moves that are red for many steps; mixing formatting, renames and logic in one commit.
- Adding abstraction layers or dependencies in the name of clean code (`simplicity-guard`).
- Calling it done because tests passed when the moved code has no tests.
