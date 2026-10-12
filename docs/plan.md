# Demo plan

Working notes behind the decisions in CLAUDE.md. Status: planning, nothing built yet.

## Task candidates

Pick by calibration: run each at low and high, n=5, keep the one where pass rates differ most and high still finishes in minutes. If effort makes no difference on some tasks, say so on screen. Showing every task tried is the defence against cherry-picking.

**SA ID number validator (preferred).** Synthetic IDs only. Traps:
- Luhn checksum
- invalid dates (29 Feb in a non-leap year, `000231`)
- century inference from a 2-digit year (ambiguous: score as "interpretation", not pass/fail)
- citizenship digit
- spaces, wrong length, non-digits

**SA business days between two dates (backup).** Traps:
- public holidays, with a Sunday holiday moving to Monday
- Good Friday and Family Day from Easter
- inclusive vs exclusive range ends
- start date after end date

## Lanes

| Lane | Effort | Spec |
|---|---|---|
| 1 | low | loose |
| 2 | medium | loose |
| 3 | high | loose |
| 4 | low | tight (rules only, no test cases) |

Same model in every lane, so only one variable changes at a time. Hypothesis for lane 4 (unproven until measured): edge cases get thought of either by you in the spec or by Claude in billed tokens.

## Reveal and metrics

- Heatmap: rows = runs (n per level), columns = hidden tests grouped happy / edge / adversarial / interpretation.
- Cost per pass = total spend / passes.
- Expected cost of "retry low until it passes" (when a verifier exists), from the measured pass rate.
- Distribution of tokens and time per level (dot plot), not single runs.
- Session running total, including calibration runs: "this research cost R___".
- Thariq's data as the at-scale context, labelled "Anthropic internal" with caveats, next to our own n.

## Honesty mechanics

- Pre-register predictions and the "inconclusive" rule (e.g. a difference of 1 pass or less out of 5) in a git commit before any runs.
- The app applies the inconclusive label automatically.
- Replay keeps recorded stream timings; any speed-up is labelled (e.g. "8x").
- During live runs show the timer and streaming text only; tokens and cost appear once `usage` arrives. Never estimate.

## Runtime (about 9 min)

| Time | Beat |
|---|---|
| 0:00 | Question + pre-registered predictions |
| 1:00 | Task spec shown, audience bets by show of hands |
| 2:00 | Race (replay; optional live low lane) |
| 4:00 | Heatmap reveal |
| 5:30 | Cost per pass, retry maths, spec lane |
| 7:00 | Thariq's numbers vs ours |
| 8:30 | Takeaway + what is still inconclusive |

## Engineering

- Runner script separate from UI: runs the matrix via `claude -p`, writes one JSON file per run (request, model ID, effort, raw usage, stream event timestamps in SAST, test results).
- Hidden tests run in a child process with a timeout (low-effort code may loop forever). Test files never in the run's working dir.
- Spend cap: `--max-budget-usd` per run plus a session cap in the server. Abort kills the process.
- Works offline at the venue: replay JSON bundled with the app.
- Budget planning (not for screen): 3 tasks x 3 levels x n=5 = 45 calibration-scale runs; watch seat usage limits and spread runs out.
