## What this part covers

Cleaning duplicates that already exist, using a duplicate report and Data Loader, without losing good data.

## Before the load

1. Export a full backup of every field on the affected records.
2. Build the update file from the duplicate report: one row per record, with the surviving record's ID in a helper column.
3. Agree the survivor rule with the record owners — usually the most recently active record.

A trimmed example of the update file:

```csv
Id,Email,Status__c,Merge_Survivor__c
003XX0000012345,ana@example.com,Active,TRUE
003XX0000012346,ana@example.com,Inactive,FALSE
```

## Running the load

- Run a 20-row test batch first and check the results by hand.
- Keep the batch size small if Flows run on update.
- Save the success and error files with the backup.

## After the load

- Re-run the duplicate report and compare counts.
- Spot-check related records (cases, opportunities) on merged contacts.
- Keep the backup until record owners have confirmed the result.
