# CLAUDE.md

## Project

Interactive demo site for my TechBites talk "The cost of effort - Better outcomes or Just a Bigger Bill" (30 Oct 2026, 20-25 min, hundreds of devs, mixed seniority). Last session of my AI series (earlier: gen AI fundamentals, prompting as a skill, an LLM visualizer built in React).

Scope is Claude only. Never make claims about Codex, ChatGPT or Copilot. Say "tested on Claude" on screen.

Inspired by Thariq Shihipar's "Using Claude Code: Spending your effort" (claude.dev, 25 Sep 2026). Credit it once, then verify with my own runs.

## Purpose

Test assumptions: does higher effort buy better outcomes, or just a bigger bill? The demo is an 8-10 min live segment. It is not a feature tour.

## Non-negotiables

- Every number on screen is either measured by this app (show n) or cited with its source and labelled "Anthropic internal".
- Token counts come from API usage fields, never estimates.
- Say "inconclusive" when the data is. Small n: show n, imply no statistical certainty.
- Prices live in one constants file with source and date. USD to ZAR rate is a configurable constant with its date displayed. I'm in South Africa: show ZAR beside USD, times in SAST.

## Verified reference facts (source: Thariq's article, Fable 5.1, 370 attempts per setting, Terminal-Bench 3.0)

- Low to max: passed 140 to 214; missed edge cases 59 to 24; wrong calls 133 to 107; picked wrong reading 25 to 47; median tokens 73k to 222k.
- html-js-filter: 1/5 at low, 5/5 at xhigh (about 2 min vs about 33 min per attempt).
- Pass rate low to top effort: security 64 to 87%, hardware 34 to 75%, operations 12 to 22%.
- Fitness app (Opus 5.5, single runs): 1.5 / 4 / 11 / 67 min from low to max; with an interview-derived spec: 16 / 22 / 33 / 79 min.
- Caveats: Anthropic internal runs, 5 attempts per task, small categories, failure types labelled by a model judge.
- Opus 5.5 list prices per M tokens: $4 input, $20 output, $0.20 cache read. Fable 5.1: $10 / $50 / $0.25.
- Opus 5.5 default effort is medium. Thinking is billed as output.

## Do not present as fact

- "Opus 5.5 high matches Fable 5.1 max at half the tokens": the chart annotation exists but I haven't confirmed which points it links, and the runs aren't controlled.
- "Effort doesn't fix wrong approaches": wrong calls fell 20%; only "wrong reading" rose.
- Fixed thinking budgets per level (1k/4k/8k): unsourced. Effort is a trained behaviour signal affecting all output tokens, including tool calls.
- Cache survives an effort change: documented for API key or subscription on Opus 5.5, cleared on Bedrock, Google Cloud and gateways. Verify via cache-read tokens.

## Demo design

1. Anchor: edge-case stress test. Small task with a hidden test suite, run at low / medium / high, pass/fail revealed live. Hidden tests never shown to the model or the audience until the reveal.
2. Effort race: parallel lanes with per-lane timer, tokens, cost (USD + ZAR), and an output diff.
3. Running cost total across the session.

Decided (details and ideas in docs/plan.md):

- Compact segment, leave time for Q&A. One model, 3 lanes (low / medium / high, loose spec) + 1 twist lane: low + tight spec, same model. Max only if calibration shows it finishes in minutes.
- Tight spec states rules, never the hidden test cases. Show the human time spent writing it.
- Task candidates: SA ID number validator (preferred), SA business-days calculator (backup). Calibrate (low vs high, n=5) before choosing.
- Reveal as a heatmap: rows = runs, columns = tests grouped happy / edge / adversarial / interpretation.
- Headline metric: cost per pass. Pre-register predictions and the "inconclusive" rule in git before running.
- Build the app spec-first (short spec per component before code).

Rules:

- Run each setting multiple times (n=5 if budget allows). Save results as JSON.
- Replay from saved JSON is the default. Live runs are a bonus, never a dependency.
- Pick tasks where high finishes in minutes, not tens of minutes.
- Hard spend cap and an abort button on every live run.

## Tech

- React + Vite + small Node server (approved).
- Runs go through Claude Code headless, no API key: `claude -p --model <id> --effort <level> --output-format stream-json --max-budget-usd <cap> --no-session-persistence --safe-mode`, restricted `--tools`. Server spawns it; abort = kill the process.
- Each run in a fresh temp dir outside the repo, so CLAUDE.md, memory and hidden tests never reach the model.
- Tokens from stream-json `usage`. Cost = tokens x list price, labelled "API list-price equivalent" (seat billing isn't per token). Claude Code's own system prompt/tool overhead is included and shown, not hidden.
- If an API key is ever used instead: server-side only, never in browser or repo, `.env` gitignored. Take request shape and model IDs from official docs (platform.claude.com/docs/en/build-with-claude/effort and adaptive-thinking).
- Projector legibility: large type, high contrast, no tiny tooltips.

## Code style

Minimal complete solutions. Omit obvious imports. Comments very short.

## Workflow

Interview me on anything ambiguous before building. Build on medium effort, I review, then verify on high (edge cases, cost math, replay fallback). Keep this file lean, since it is resent every turn.

## Open questions (ask me, don't assume)

Work PC (enterprise seat) is the demo machine; personal AI tools are not allowed at work. Re-check there:

- `claude --version` (Opus 5.5 needs v2.1.280+; personal PC had 2.1.295 with `--effort`) and `claude auth status`.
- Do enterprise seats allow scripted `claude -p` runs, and what usage limits apply to ~45+ runs?
- Which model? (Proposed: Opus 5.5 only.)
- Final task, after calibration.

Next step: one tiny smoke test, `claude -p "say hi" --effort low --output-format stream-json --verbose`, to confirm usage fields and effort are reported. Then calibration.
