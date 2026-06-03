# Releasing

ViteCharts uses [Changesets](https://github.com/changesets/changesets) for versioning and
publishing, automated through GitHub Actions. Packages are published to npm with
[provenance](https://docs.npmjs.com/generating-provenance-statements).

## Day-to-day: adding a changeset

Any PR that changes a publishable package should include a changeset describing the change:

```bash
pnpm changeset
```

Pick the affected packages and a bump type (`patch` / `minor` / `major`), and write a
human-readable summary. This creates a markdown file under `.changeset/` — commit it with
your PR. Run `pnpm changeset status` to see what's pending.

## Automated release flow

On every push to `main`, `.github/workflows/release.yml` runs the Changesets action:

1. **If unreleased changesets exist** → it opens (or updates) a **"Version Packages"** PR
   that bumps versions and writes `CHANGELOG.md` files.
2. **When that PR is merged** → it runs `pnpm release`, which builds, verifies package
   exports (`publint` + `arethetypeswrong`), and runs `changeset publish` to publish the
   changed packages to npm.

You never publish from your laptop; merging the version PR is the release.

## One-time setup (before the first publish)

- **npm:** create the `@vitecharts` org (or change the scope) and a granular **automation
  access token**. Add it to the repo as the `NPM_TOKEN` secret
  (`Settings → Secrets and variables → Actions`).
- **Provenance:** already enabled via `publishConfig.provenance` + the workflow's
  `id-token: write` permission and `NPM_CONFIG_PROVENANCE=true`. No extra config needed.
- **Repo permissions:** under `Settings → Actions → General → Workflow permissions`, allow
  GitHub Actions to create and approve pull requests (needed to open the version PR).
- **Placeholders to replace:** the `repository`/`homepage`/`bugs` URLs in each package's
  `package.json` currently point at `github.com/vitecharts/vitecharts` — update them to the real
  repo, and confirm the `@vitecharts` npm scope is the one you want.

## Manual release (escape hatch)

```bash
pnpm changeset version   # bump versions + changelogs locally
pnpm release             # build + verify exports + changeset publish
```

Requires you to be logged in to npm (`npm whoami`) with publish rights to the scope.

## What gets published

Only non-private packages under `packages/*`. Apps (`apps/sandbox`, future `apps/docs`)
are `private` and ignored by Changesets.
