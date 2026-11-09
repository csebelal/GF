## The problem

Admin backlogs grow from every direction: access requests, new fields, report changes, automation ideas and bugs. Without a shared way to rank them, the loudest request wins and important but quiet work — data quality, retiring unused fields — never gets scheduled.

This exercise treats the backlog the way a product manager treats a roadmap: every request is scored on the same criteria, and the scores are visible to the people who asked.

## Who it's for

- **Requesters** in Sales, Marketing and Customer Success, who want to know when their request will be done and why
- **Team leads**, who need to agree priorities across departments
- **The admin**, who needs a defensible plan for each release

## Scoring model

Each request gets three scores from 1 to 5.

| Criterion | 1 | 5 |
| --- | --- | --- |
| User impact | One person, minor inconvenience | A whole team, daily blocker |
| Effort | Several sprints, many dependencies | Under an hour, no dependencies |
| Risk if ignored | Cosmetic | Data loss, compliance or revenue risk |

The priority score is `impact × risk + effort`, so a cheap fix can't outrank a serious problem, but it can break a tie.

## Example backlog

| Request | Impact | Effort | Risk | Score |
| --- | --- | --- | --- | --- |
| Fix lead routing for new region | 5 | 3 | 5 | 28 |
| Retire 40 unused opportunity fields | 3 | 4 | 3 | 13 |
| Add "Preferred contact time" field | 2 | 5 | 1 | 7 |
| Rebuild case dashboard | 4 | 2 | 2 | 10 |
| Permission set clean-up for Support | 3 | 3 | 4 | 15 |

![Impact and effort matrix](/images/samples/backlog-cover.svg "The same backlog plotted by impact and effort. The top-left quadrant holds the quick wins.")

## From scores to a release plan

1. Take the top items that fit the next release window.
2. Pair one quick win with one larger item, so every release delivers something visible.
3. Publish the plan to requesters with the scores, so the reasoning is open to challenge.

## Where AI helps

An assistant such as Claude can summarize long request threads into a consistent template — problem, affected users, current workaround — before scoring. The scoring itself stays with people, because it depends on context the request text doesn't contain.

## Tradeoffs

- Scores feel precise but are judgements. Revisit them when circumstances change.
- A scoring model can hide strategic work. Reserve a fixed share of each release for org health.

## What this exercise is practising

Product thinking applied to admin work: defining the problem before the solution, making tradeoffs visible, and communicating a plan that people can disagree with constructively.
