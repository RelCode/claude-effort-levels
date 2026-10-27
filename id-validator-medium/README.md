# SA ID Validator

A web page that checks whether a South African ID number is valid and shows the details encoded in it.

## ID number format

A South African ID number has 13 digits: `YYMMDD SSSS C A Z`.

| Digits | Meaning |
|---|---|
| 1–6 | Date of birth (`YYMMDD`) |
| 7–10 | Gender: `0000`–`4999` female, `5000`–`9999` male |
| 11 | `0` South African citizen, `1` permanent resident |
| 12 | Usually `8` |
| 13 | Check digit (Luhn algorithm) |

## Files

- `index.html`: the page
- `validator.js`: the validation logic
