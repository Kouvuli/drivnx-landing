---
name: finish-branch
description: Wraps up a finished git branch - verify it fresh, bring it up to date with the base, tidy the history, then merge it, open a pull request or keep it as the user chooses, and clean up the branch and any worktree afterwards. Use when work on a branch is done and needs to be merged, integrated, turned into a PR or cleaned up.
license: MIT
---

# Finish branch

## Purpose
Close a branch deliberately: verified, current with its base, integrated the way the user wants, and leaving nothing dangling.

## When to use
- "I'm done with this branch", "merge it", "squash and merge", "open a PR for this branch", "clean up old branches".

## When NOT to use
- Writing the PR description, release notes or deploying: `delivery` (this skill gets the branch ready and integrated).
- Starting a branch: `work-branch`. Reviewing someone else's branch: `code-review`.

## Procedure
1. **Verify fresh** (`verification`): run the project's checks on the branch as it is now. Do not finish a red branch.
2. **Review the branch as a whole**: `git log <base>..HEAD` and `git diff <base>...HEAD`. Remove leftovers (debug code, stray files); make sure every commit belongs here.
3. **Update from the base**: fetch, then rebase (private branch) or merge the base in (shared branch); resolve conflicts carefully, re-run the checks.
4. **Tidy history only where safe**: squash fix-up commits on a private branch if the project prefers that; never rewrite history others have pulled.
5. **Offer the options and let the user choose**: merge locally (fast-forward or merge commit per project convention), push and open a pull request (description via `delivery`), or keep the branch as is. Push, merge into shared branches and delete remote branches only on explicit request.
6. **Clean up after integration**: delete the merged local branch (`git branch -d`, never `-D` without asking), remove its worktree (`worktrees`), and report the final state.

## Output
Checks result, how the branch was integrated (or why not), and what was cleaned up.

## Failure modes
- Merging without re-running checks after updating from the base.
- Force-pushing or rewriting a shared branch; deleting unmerged branches.
- Merging or pushing without the user's choice.
