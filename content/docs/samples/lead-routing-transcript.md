**[00:00]** This walkthrough covers a record-triggered Flow that routes new leads to regional queues.

**[00:12]** We start on the entry conditions. The Flow runs only when a lead is created, and it skips records created by the integration user so bulk imports follow their own process.

**[00:40]** Next is the routing lookup. Instead of hard-coding regions in decision elements, the Flow reads rules from a custom metadata type. That keeps changes to the matrix out of the Flow itself.

**[01:15]** Here's the assignment. The lead owner becomes the matching queue, and a task is created so queue members see the new lead straight away.

**[01:42]** If no rule matches, the lead goes to the fallback queue owned by sales operations.

**[02:05]** Finally, the scheduled path. One day after creation, the Flow checks whether the lead is still New. Only then does it notify the regional manager.

**[02:30]** That's the whole Flow. The written documentation on this page covers the test cases and the decisions behind each step.
