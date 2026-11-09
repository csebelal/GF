## Business problem

New leads from the website form landed in a single queue. Whoever noticed a lead first assigned it, usually by reading the company address and guessing the region. Leads that arrived late in the day or over a weekend could wait well over a day before anyone responded, and nobody could say which leads had been missed.

The request from sales leadership was short: *"Get every lead to the right rep quickly, and tell us when one slips."*

## Stakeholders

| Group | What they need |
| --- | --- |
| Sales development reps | Leads assigned to them without having to watch a shared queue |
| Regional sales managers | Confidence that their region's leads arrive in their queue, and an alert when one is ignored |
| Marketing operations | Routing that respects the lead source and campaign fields they already maintain |
| Salesforce admin | A rule set that can be changed without rebuilding the Flow |

## Role and scope

This sample covers requirements, the routing matrix, Flow design and build in a sandbox, test planning, deployment by change set and the one-page user guide. It does not cover lead scoring or changes to the web form.

## Requirements

1. Assign every new lead to a regional queue based on country and company size.
2. Send leads that match no rule to a fallback queue owned by the sales operations team, never to a default user.
3. If a lead is still unworked after one business day, notify the queue's manager and create a follow-up task.
4. Let admins change the routing matrix without editing the Flow.
5. Don't fire on leads created by bulk imports, which are routed by a separate process.

## Tools and environment

- Salesforce Sales Cloud, Developer Edition sandbox
- Record-triggered Flow (after save) with a scheduled path
- Custom metadata type `Lead_Routing_Rule__mdt` for the matrix
- Validation rule on `Country` so routing has the data it needs
- Change set for deployment

## Workflow

![Lead routing Flow diagram](/images/samples/lead-routing-cover.svg "The Flow at a glance: entry criteria, the routing lookup, queue assignment and the scheduled escalation.")

The Flow runs once, when a lead is created. It looks up the matching routing rule, assigns the queue, and schedules a check for one business day later. The scheduled path only acts if the lead status is still **New**.

### Routing rules as data

Keeping the matrix in custom metadata means a new region or a changed threshold is a record update, not a Flow change. Each rule holds:

| Field | Example | Notes |
| --- | --- | --- |
| `Country_Group__c` | `EMEA` | Mapped from the lead's country |
| `Min_Employees__c` | `200` | Inclusive lower bound |
| `Queue_Developer_Name__c` | `EMEA_Mid_Market` | Must match an existing queue |
| `Priority__c` | `10` | Lower numbers are evaluated first |

## Implementation steps

1. **Agree the matrix.** Work through existing assignments with each regional manager and write down the rules they apply from memory.
2. **Add the validation rule.** Leads from the web form must have a country, otherwise routing has nothing to work with.
3. **Build the lookup.** A `Get Records` element returns rules for the lead's country group, sorted by priority, and the Flow takes the first rule whose employee threshold fits.
4. **Assign and notify.** The lead owner is set to the queue; a task is created for queue members.
5. **Schedule the escalation.** A scheduled path runs one day after creation and checks the status before notifying anyone.

The entry condition excludes leads created by the integration user:

```text
AND(
  ISNEW(),
  $User.Username <> "integration@example.com",
  NOT(ISBLANK(Country))
)
```

## Key configuration decisions

- **After-save, not before-save.** Assignment needs the record ID for the task and the scheduled path, so the Flow runs after save.
- **Fallback queue instead of a default owner.** Unrouted leads stay visible to a team rather than disappearing into one person's list.
- **Escalation checks status, not time alone.** A lead that has already been worked never triggers a notification.

## Testing and edge cases

| Scenario | Expected result |
| --- | --- |
| Lead from Germany, 450 employees | Assigned to `EMEA_Mid_Market` |
| Lead with an unmapped country | Assigned to `Sales_Ops_Fallback`, task created |
| Bulk import of 2,000 leads by the integration user | Flow does not run |
| Lead still **New** after one business day | Manager notified, follow-up task created |
| Lead worked within an hour | No escalation |
| Two rules match the same lead | The rule with the lowest priority number wins |

## Results

This is a sample project, so there are no measured results. In a real rollout, the evidence to collect would be median time to first touch before and after go-live, the number of leads reaching the fallback queue each week, and the number of escalations per region.

## Limitations and tradeoffs

- Country groups are maintained by hand. A new country needs a mapping before its leads route correctly.
- The one-day escalation ignores public holidays unless business hours are configured for each region.

## Lessons learned

The routing matrix was the real project. Once managers agreed on the rules in plain language, the Flow itself was small.

## Possible next improvements

- Round-robin assignment within a queue
- A dashboard of fallback-queue volume so mapping gaps are spotted quickly
- Business hours per region for more accurate escalations
