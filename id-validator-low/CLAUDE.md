# CLAUDE.md

You are building the app described in `README.md`. The README is the spec: its rules are decisions, not suggestions. If something in it seems wrong, say so instead of quietly doing something else.

## Constraints

- Plain HTML, CSS and JavaScript (ES modules). No frameworks, no npm dependencies, no build step. Tests use Node's built-in `node:test` and `node:assert`.
- `validator.js` must be a pure ES module with no DOM or browser APIs, so Node can import it directly. `index.html` imports it with `<script type="module">`.
- Exactly three files: `index.html`, `validator.js`, `validator.test.mjs`.

## The validator contract

```js
// validator.js
export function validate(id, today = new Date()) → {
  valid: boolean,
  errors: string[],              // one readable message per failed rule; [] when valid
  dateOfBirth?: string,          // 'YYYY-MM-DD', only when valid
  gender?: 'female' | 'male',    // only when valid
  citizenship?: 'citizen' | 'permanent_resident' | 'refugee', // only when valid
}
```

- `today` exists so tests can pin the date for the century rule. The page calls `validate(id)`.
- Never throw. Any non-string input returns `{ valid: false, errors: [...] }`.
- Do not trim, normalise or strip the input. `' 8001015009087'` is invalid.

## Pitfalls to avoid

- Don't build dates by parsing strings (`new Date('1980-01-01')` is UTC and can shift a day in local time). Check the day against a days-in-month table with a proper leap-year rule.
- Don't stop at the first failed rule. Collect all of them.
- Don't treat `C` values above `2` as valid, and don't validate `A`.
- A number can pass Luhn and still be invalid (`0000000000000` passes Luhn but has month `00`).

## How to work

1. Write `validator.test.mjs` first: at least one passing and one failing case for every numbered rule in the README, plus the boundaries (`4999`/`5000`, leap days in 1900/2000/1999, the century cut-over using a pinned `today`, and the worked example).
2. Implement `validator.js` until `node --test` passes.
3. Build `index.html`: one input, validate as the user types, and show either the decoded details or the list of errors. Clean and readable; no extra features (no ID generator, no history, no storage).

## Done means

- `node --test` passes, and every README rule has at least one test.
- The page works when served with `npx serve .`.
- You've stated anything in the README you disagreed with or couldn't follow.
