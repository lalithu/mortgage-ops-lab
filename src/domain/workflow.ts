import type { Loan, Stage } from './types';

export const stages: Stage[] = ['Application', 'Processing', 'Underwriting Review', 'Approved', 'Funded', 'Sold'];

export function nextStage(stage: Stage): Stage | undefined {
  const index = stages.indexOf(stage);
  return index < 0 ? undefined : stages[index + 1];
}

export function transitionLoan(loan: Loan, target: Stage): { allowed: boolean; reason: string } {
  if (!stages.includes(loan.stage) || !stages.includes(target)) return { allowed: false, reason: 'Unknown lifecycle stage.' };
  if (nextStage(loan.stage) !== target) return { allowed: false, reason: 'Advance one stage at a time; skipped and backward transitions are blocked.' };
  if (target === 'Sold') return { allowed: false, reason: 'Use simulated offer acceptance to record a sale and its selected investor.' };
  if (['Underwriting Review', 'Approved', 'Funded'].includes(target)) {
    const missing = (Object.keys(loan.documents) as (keyof Loan['documents'])[]).filter(key => !loan.documents[key]);
    if (missing.length) return { allowed: false, reason: `Verify missing ${missing.map(key => key === 'insurance' ? 'homeowners insurance' : key).join(', ')} evidence before advancing.` };
  }
  return { allowed: true, reason: `Simulation requirements satisfied for ${target}. This is not a real underwriting decision.` };
}
