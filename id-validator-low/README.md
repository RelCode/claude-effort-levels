# SA ID Validator

A single web page that checks whether a South African ID number is valid and, if it is, shows the date of birth, gender and citizenship encoded in it. No dependencies and no build step.

## Running it

Browsers block ES module imports from `file://`, so serve the folder instead of double-clicking `index.html`:

```sh
npx serve .
```

Then open the URL it prints, type or paste an ID number, and the page shows either the decoded details or every reason the number is invalid.

Run the tests with:

```sh
node --test
```

## How an SA ID number is built

A valid number is exactly 13 digits: `YYMMDD SSSS C A Z`.

| Digits | Field | Meaning |
|---|---|---|
| 1–6 | `YYMMDD` | Date of birth |
| 7–10 | `SSSS` | Sequence number. `0000`–`4999` is female, `5000`–`9999` is male |
| 11 | `C` | Citizenship. `0` citizen, `1` permanent resident, `2` refugee |
| 12 | `A` | Historically encoded race, now usually `8`. Not validated |
| 13 | `Z` | Check digit, calculated with the Luhn algorithm over digits 1–12 |

## Rules the validator enforces

1. **Format.** The input must be exactly 13 ASCII digits. Nothing is trimmed or stripped: spaces, dashes, letters and leading or trailing whitespace make the number invalid.
2. **Date of birth.** `YYMMDD` must be a real calendar date, including leap years (29 February only in leap years; 1900 was not a leap year, 2000 was).
3. **Century.** Use `20YY` unless that date would be after today, in which case use `19YY`. So `450817` is 17 August 1945, and `000229` is 29 February 2000 (valid).
4. **Citizenship.** `C` must be `0`, `1` or `2`.
5. **Race digit.** `A` can be any digit.
6. **Check digit.** The whole 13-digit number must pass the Luhn check.

All rules are checked and every failure is reported, not just the first one.

## Worked example: `8001015009087`

- Date of birth `800101`: 1 January 1980 (2080 would be in the future).
- Sequence `5009`: male.
- `C` = `0`: citizen. `A` = `8`.
- Check digit: in the first 12 digits `800101500908`, double every second digit counting from the right (`8`, `9`, `0`, `1`, `1`, `0`), giving `16`, `18`, `0`, `2`, `2`, `0`. Replace two-digit results with the sum of their digits: `7`, `9`, `0`, `2`, `2`, `0` = **20**. Add the other six digits (`0`, `0`, `5`, `0`, `0`, `8`) = **13**. Total **33**. Check digit = `(10 - 33 mod 10) mod 10` = **7**, which matches the last digit.

Change the last digit to anything else (for example `8001015009088`) and the number is invalid.

## Files

| File | Purpose |
|---|---|
| `index.html` | The page: input, result panel, styling |
| `validator.js` | Pure validation logic (ES module, no DOM access) |
| `validator.test.mjs` | `node:test` tests for every rule above |
