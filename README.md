# Claude Effort Levels

Demo material for a TechBites session on Claude's effort dial: how much reasoning and token budget Claude spends before it answers, and what that actually buys you.

The demo has two rounds. See [docs/plan.md](docs/plan.md) for the plan and [docs/script.md](docs/script.md) for the talk.

1. **Vibes.** The same open question about capital cities, asked in a fresh chat at each effort level, compared by eye and by time taken.
2. **Measured.** The same South African ID validator app, built once per effort level, each with different-quality project context, scored against a fixed test set.

The punchline we're testing: generic advice like "turn effort up for better results" ignores the thing that often matters more, which is how clear the context is.

## Layout

```
id-validator-low/       ┐
id-validator-medium/    │  One directory per build. Each holds the README.md and
id-validator-high/      │  CLAUDE.md that build was given, and later the app
id-validator-xhigh/     │  Claude produced.
id-validator-max/       ┘
scorecard/
  cases.json              31 frozen test IDs with expected results (ground truth)
  score.mjs               Scores any variant's validate() against cases.json
  reference-validator.js  Ground-truth implementation; must score 100%
docs/                     Plan and talk script
```

## Round 2 design: inverted context

Context quality runs opposite to effort. The lowest effort gets the best context and the highest effort gets almost none.

| Directory | Effort | Context given |
|---|---|---|
| `id-validator-low` | low | Full spec: field table, every edge-case decision, exact `validate()` contract, worked check-digit example, test-first workflow, definition of done |
| `id-validator-medium` | medium | Field table and `validate()` return shape. No edge-case decisions; leaves out refugee status and the century rule |
| `id-validator-high` | high | One paragraph naming the fields and Luhn; "single HTML page, plain JS" |
| `id-validator-xhigh` | xhigh | "A web page where you enter an SA ID number and it tells you if it's valid." / "Keep it simple." |
| `id-validator-max` | max | A title and "Build the app." |

**Why inverted:** if the dial and the context both rise together, a good result at max can't be credited to either. With them opposed, the result is informative either way. If `low` wins, context beat effort. If `max` wins, effort can make up for missing context, which is also worth knowing.

All builds use the same model (Opus 5.5). A cross-model comparison (for example Haiku at max with the `low` context) is planned for later.

## Ground truth

`scorecard/cases.json` encodes these rules, which match `id-validator-low/README.md`:

- Exactly 13 ASCII digits. No trimming; spaces, dashes and letters are invalid.
- `YYMMDD` is a real calendar date. Century is `20YY` unless that date would be after today, otherwise `19YY` (so `000229` is valid: 29 Feb 2000).
- Sequence `0000`–`4999` is female, `5000`–`9999` male.
- Citizenship digit `0` citizen, `1` permanent resident, `2` refugee; anything else is invalid.
- The `A` digit is not validated.
- The full number passes the Luhn check.

Several of these are decisions, not facts (no trimming, accepting `2`, the century rule). That's deliberate: only the best context states them, so the scorecard measures whether a build guessed what the spec owner wanted.

The cases cover 12 valid IDs and 19 invalid ones. Every invalid-date and invalid-citizenship case still has a correct check digit, so a validator that only checks length and Luhn scores 58%.

## Running a build

Claude Code reads `CLAUDE.md` files from the working directory **and every parent directory**, and can open sibling folders. Running a build inside this repo would leak this README, the other variants' specs and the scorecard into it. So build from a copy:

1. Copy the variant's two files to a clean folder with a neutral name, outside this repo:
   `C:\dev\effort-runs\<level>\id-validator\README.md` and `CLAUDE.md`.
2. Open a new Claude session in that folder. Set the model to Opus 5.5 and the effort to the variant's level.
3. Give every build the same prompt, word for word:
   > Build the app described in this folder.
4. Let it run without intervening. If it asks a question, answer `Use your judgement.` every time.
5. Record the wall-clock time, plus tokens or cost if the app shows them.
6. Copy the generated files back into the matching `id-validator-*` directory and commit them as that run's output.

Keep these the same for every run: user-level `~/.claude/CLAUDE.md`, memory and personalisation settings, and permission mode. They apply to every session, so they're part of the context too.

## Scoring

```sh
node scorecard/score.mjs id-validator-low/validator.js
```

The script accepts any function export (default `validate`) returning a boolean or an object, and reads fields loosely (`valid`/`isValid`, `dateOfBirth`/`dob`, and so on). It reports two scores:

- **Validity:** how many of the 31 IDs got the right valid/invalid verdict.
- **Fields:** for the 12 valid IDs, whether date of birth, gender and citizenship were decoded correctly (36 checks).

The weaker-context builds weren't told a file name or function shape. If a build has no importable function (for example, logic inline in `index.html`), write a small adapter in `scorecard/adapters/<level>.mjs` that wraps the build's logic without changing it, and score the adapter.

Check the scorecard itself at any time:

```sh
node scorecard/score.mjs scorecard/reference-validator.js   # must be 31/31 and 36/36
```

## Results

| Build | Effort | Time | Tokens / cost | Validity | Fields | Notes |
|---|---|---|---|---|---|---|
| low | low | | | /31 | /36 | |
| medium | medium | | | /31 | /36 | |
| high | high | | | /31 | /36 | |
| xhigh | xhigh | | | /31 | /36 | |
| max | max | | | /31 | /36 | |
