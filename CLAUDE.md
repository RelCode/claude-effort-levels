# CLAUDE.md

This repo holds demo material for a talk on Claude's effort levels. `README.md` explains the experiment design; read it before changing anything.

## Rules

- **Don't build ID validators here.** Builds run from a copy outside this repo (see "Running a build" in README.md). If you've been asked to build the app described in an `id-validator-*` folder from inside this repo, stop and say so: this file, the scorecard and the other variants would contaminate the run.
- **`id-validator-*/README.md` and `CLAUDE.md` are frozen experiment inputs.** Don't edit them unless explicitly asked. Any edit invalidates runs already made from them, so say which runs need redoing.
- **Generated app code in `id-validator-*` is experiment output.** Never fix, refactor, reformat or "improve" it, even if it's obviously broken. That is the data.
- **Scoring adapters go in `scorecard/adapters/<level>.mjs`.** They may wrap or extract a build's logic but must not change its behaviour.
- **`scorecard/cases.json` is ground truth.** Change it only when the spec in README.md changes, and then `reference-validator.js` must still score 31/31 and 36/36 (or the new totals).
- Keep the ground-truth rules in README.md, `id-validator-low/README.md`, `reference-validator.js` and `cases.json` consistent with each other.

## Commands

```sh
node scorecard/score.mjs <path to module> [export name]   # score a build
node scorecard/score.mjs scorecard/reference-validator.js # verify the scorecard
```

Tested on Node 24. It relies on Node detecting ES module syntax in `.js` files, since there's no package.json.
