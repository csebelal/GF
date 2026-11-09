## What this part covers

Matching rules decide which records count as the same person or company. Duplicate rules decide what happens when a match is found.

## Matching keys

| Object | Match on | Why |
| --- | --- | --- |
| Contact | Email (exact) | Most reliable identifier for a person |
| Contact | First name (fuzzy) + last name (exact) + account | Catches records without an email |
| Account | Website domain (exact) | Company names vary too much to match on alone |

## Alert or block?

- **Block** when the match is exact on email. There's no good reason to create the record twice.
- **Alert** on fuzzy name matches, so users can decide. Blocking fuzzy matches frustrates people with common names.

## Test cases

1. Create a contact with an existing email: blocked.
2. Create "Jon Smith" when "John Smith" exists at the same account: alert shown, save allowed.
3. Integration user creates a duplicate: allowed and reported, so syncs don't fail.
