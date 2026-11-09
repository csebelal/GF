## Business problem

Duplicate contacts split activity history across records. Reps called people who had already been contacted, marketing emails went out twice, and reports overstated the number of active customers.

## Approach

The work is split into two parts because the two causes need different fixes:

1. **Prevent new duplicates** with matching and duplicate rules (part 1).
2. **Clean existing duplicates** with a reviewed Data Loader update and a rollback plan (part 2).

Doing them in this order matters. Cleaning first, without prevention in place, just starts the clock on the next cleanup.

## Requirements

- No record is deleted without a backup and owner sign-off.
- Integration users must not be blocked by duplicate rules.
- Users get an alert rather than a hard block for fuzzy matches.

## Risks and how they were handled

| Risk | Mitigation |
| --- | --- |
| Merging the wrong records | Survivor rule agreed with owners; 20-row test batch first |
| Automation firing on mass update | Small batch size; Flows reviewed for update triggers |
| Syncs failing on blocked duplicates | Integration user exempt from blocking rules |

## Results

This is a sample project. In a real cleanup, the evidence to report would be duplicate report counts before and after, and the number of new duplicates created per week once the rules were active.

## Lessons learned

The duplicate report is also a data-entry report. Patterns in where duplicates come from point to the form, import or integration that needs fixing.
