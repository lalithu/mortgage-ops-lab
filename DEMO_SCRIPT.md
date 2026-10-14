# 90-second walkthrough

Start with **Reset Demo** so the reviewer sees the reproducible initial scenario. All names, records, offers, and actions are synthetic.

| Time | Action | Narration |
| --- | --- | --- |
| 0–10 s | Open Overview and click **Explore the Demo**. | “Baby Swish AI Demo connects the borrower relationship, origination workflow, and secondary-market decision in one shared state.” |
| 10–20 s | Open **Borrowers**, select **Maya Chen**, and open her loan file. | “This borrower record carries the loan, notes, next action, and activity into the operational workflow.” |
| 20–35 s | In **Origination**, inspect the missing insurance evidence and attempt the blocked transition. | “The next stage is guarded by a deterministic rule. A recommendation cannot bypass required evidence.” |
| 35–45 s | Verify the fictional evidence and advance through the remaining permitted stages to Funded. | “Resolving the blocker enables progression. Each transition leaves a reasoned audit event.” |
| 45–65 s | Submit the funded loan to **Marketplace** and compare the three offers. | “A quoted price is only one part of the decision. Gross proceeds minus explicit fees produces net proceeds, rounded to cents. The highest quote can lose after fees.” |
| 65–75 s | Simulate accepting the recommended eligible offer. | “The recommendation selects the highest net proceeds under the displayed assumptions. Acceptance updates the same loan and its audit trail.” |
| 75–90 s | Open **AI Review**, select the incorrect bid fixture, and run validation. | “This is a prewritten model-output example, checked by real validation code. The system recomputes the numbers and explains the violated invariant.” |

If extra time is available, show the invalid-transition and arithmetic fixtures, refresh to demonstrate persistence, then reset to show deterministic recovery. Explain that this is an educational simulation, with no live underwriting, trading, or model service.
