---
name: ci-cd
description: Builds and fixes CI/CD pipelines (GitHub Actions, GitLab CI, Jenkins) - running the project's real build, lint and test commands on pull requests, caching, pinned action and image versions, least-privilege permissions, secrets handling, and gated deploy stages with environments and rollback. Use when setting up, changing or debugging a pipeline or workflow, or automating build, test or deployment.
license: MIT
---

# CI/CD

## Purpose
Every change is built and tested the same way automatically, and deploys are repeatable, gated and reversible.

## When to use
- Creating or editing `.github/workflows/*`, `.gitlab-ci.yml`, `Jenkinsfile`; a failing or slow pipeline; automating releases or deployments.

## When NOT to use
- Container images themselves: `docker`. Infrastructure resources: `terraform`. Writing release notes or doing a one-off release: `delivery`.

## Procedure
1. **Use the project's real commands**: read the build files, scripts and docs (`package.json` scripts, Makefile, `pom.xml`, `pyproject.toml`, README) and run the same install, lint, type-check, test and build commands a developer runs. Do not invent new ones.
2. **Pull request pipeline**: trigger on PRs and the main branch; install with the lockfile (`npm ci`, `pip install -r`, `mvn -B`), run lint/type-check/tests/build; fail fast; upload test reports when useful.
3. **Reproducible and fast**: pin runtime versions to what the project uses; pin third-party actions to a version or commit SHA; cache dependencies keyed on the lockfile; use a matrix only for versions the project really supports.
4. **Secure by default**: least-privilege `permissions:` (read-only by default), secrets only from the CI secret store and never echoed, no secrets for workflows triggered by forks, review `pull_request_target` carefully, scan dependencies if the project already uses a scanner.
5. **Deploy stages**: build once and promote the same artifact; separate environments (staging -> production) with required approval for production; run migrations deliberately; post-deploy smoke test; documented rollback.
6. **Verify the pipeline**: lint the workflow syntax if a tool exists, explain how to trigger it, and state that it has not run until it has.

## Output
The pipeline files, which commands each job runs and where they came from, required secrets/variables (names only), and how to verify.

## Failure modes
- CI commands that differ from what developers run, or that invent scripts which do not exist.
- Unpinned actions (`@main`), `permissions: write-all`, secrets printed in logs.
- Rebuilding a different artifact for production than the one tested.
- Claiming a workflow passes without it having run.
