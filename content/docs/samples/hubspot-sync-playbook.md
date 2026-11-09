## Business problem

When HubSpot and Salesforce disagree, the symptom rarely points at the cause. Marketing sees a contact that "didn't sync". Sales sees a lead with an empty field. Each report gets a quick manual fix, and the same error comes back the following week.

The goal of this playbook is to make every sync investigation follow the same order, so the root cause is found and fixed once.

## Who uses this playbook

- **Salesforce admins** investigating a reported sync error
- **Marketing operations** checking whether an issue is on the HubSpot side before escalating
- **Sales managers** who need a clear answer on why a lead is missing or incomplete

## Scope

The playbook covers contact, lead and company records syncing between HubSpot and Salesforce through the standard connector. Custom middleware and one-off imports are out of scope.

## The triage order

![Triage flowchart](/images/samples/hubspot-sync-triage.svg "Checks run from cheapest to most involved. Most issues are resolved by step three.")

Work through the checks in order. Each one rules out a category of cause before moving on.

### 1. Read the sync error itself

HubSpot's sync health view records the error message Salesforce returned. Copy it exactly. Errors such as `FIELD_CUSTOM_VALIDATION_EXCEPTION` or `INVALID_OR_NULL_FOR_RESTRICTED_PICKLIST` already tell you which of the later checks matters.

### 2. Confirm the record should sync at all

Check inclusion lists and sync rules before anything else. A surprising number of "sync failures" are records that were never meant to sync.

### 3. Compare field mappings

Open the mapping for the field in question and check both directions:

| Check | What to look for |
| --- | --- |
| Field type | A HubSpot dropdown mapped to a Salesforce text field, or the reverse |
| Sync rule | "Prefer Salesforce" vs "Two-way" vs "Don't sync" |
| Field-level security | The integration user must be able to edit the Salesforce field |
| Length | HubSpot values longer than the Salesforce field limit are rejected |

### 4. Compare picklist values

Restricted picklists reject any value that isn't defined in Salesforce. List the values HubSpot is sending and compare them with the picklist definition, including capitalization and trailing spaces.

### 5. Check validation rules

A validation rule written for human users can block the integration. Query recently modified records owned by the integration user to see which rules they are hitting:

```sql
SELECT Id, Email, LeadSource, LastModifiedDate
FROM Lead
WHERE LastModifiedBy.Username = 'integration@example.com'
  AND LastModifiedDate = LAST_N_DAYS:7
ORDER BY LastModifiedDate DESC
```

If a rule should not apply to integration updates, add an exception for the integration user rather than deactivating the rule.

### 6. Check ownership and sharing

If the record syncs but nobody can see it, check the owner HubSpot assigned and whether that user is active in Salesforce.

## Recording the fix

Every investigation ends with a short entry in the recurring-issues log:

| Field | Example |
| --- | --- |
| Symptom | Leads from webinar campaign missing `Industry` |
| Root cause | HubSpot sends "Health care", Salesforce picklist has "Healthcare" |
| Fix | Add a value mapping in HubSpot; correct the existing records |
| Prevention | Review picklist changes with both teams before release |

## Testing the playbook

To test the playbook, recreate six common error types in a sandbox and confirm each one is identified by the right step: restricted picklist values, a validation rule on `Phone`, a read-only field for the integration user, a text length overflow, an inactive owner and a record excluded by an inclusion list.

## Results

This is an illustrative project, so no outcomes are reported. Useful evidence in a real environment would be the count of open sync errors over time and how often the same root cause reappears in the log.

## Limitations

- The playbook assumes access to both systems' admin settings.
- High-volume errors caused by API limits need a different approach.

## Next improvements

- A Salesforce report of records modified by the integration user with validation errors
- A shared picklist change checklist for marketing and sales operations
