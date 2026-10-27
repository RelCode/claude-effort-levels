# CLAUDE.md

Build the SA ID validator described in `README.md`.

- Plain HTML and JavaScript, no frameworks or dependencies.
- Keep the logic in `validator.js` as an ES module, separate from the UI.
- `validator.js` exports `validate(id)`, which returns `{ valid, errors, dateOfBirth, gender, citizenship }`.
- The page should show the decoded details for a valid number, or the errors for an invalid one.
