import type { AppState } from './types';

export function seedState(): AppState {
  return {
    version: 1,
    borrowers: [
      { id: 'b1', name: 'Maya Chen', email: 'maya.chen@example.com', phone: '(212) 555-0142', status: 'Application', notes: 'First home purchase. Income and appraisal verified; insurance evidence outstanding.', officer: 'Alex Morgan', nextAction: 'Verify homeowners insurance', loanId: 'l1' },
      { id: 'b2', name: 'Jordan Ellis', email: 'jordan.ellis@example.com', phone: '(718) 555-0188', status: 'Qualified', notes: 'Exploring a refinance. Ready to open a simulated application.', officer: 'Sam Rivera', nextAction: 'Create refinance application' },
      { id: 'b3', name: 'Avery Patel', email: 'avery.patel@example.com', phone: '(917) 555-0136', status: 'Application', notes: 'Funded purchase loan; ready for a secondary-market comparison.', officer: 'Alex Morgan', nextAction: 'List funded loan', loanId: 'l2' },
    ],
    loans: [
      { id: 'l1', borrowerId: 'b1', amountCents: 48000000, propertyValueCents: 60000000, dti: 32, creditScore: 756, rateBps: 625, termMonths: 360, occupancy: 'Primary residence', purpose: 'Purchase', stage: 'Processing', documents: { income: true, appraisal: true, insurance: false }, listed: false },
      { id: 'l2', borrowerId: 'b3', amountCents: 32500000, propertyValueCents: 45000000, dti: 28, creditScore: 782, rateBps: 600, termMonths: 360, occupancy: 'Primary residence', purpose: 'Purchase', stage: 'Funded', documents: { income: true, appraisal: true, insurance: true }, listed: false },
    ],
    offers: [
      { id: 'o1', buyer: 'Harbor Capital', priceBps: 10225, feeCents: 650000, settlementDays: 5, conditions: 'Complete verified file; explicit transfer adjustment.', eligible: true },
      { id: 'o2', buyer: 'Meridian Credit', priceBps: 10175, feeCents: 150000, settlementDays: 7, conditions: 'Complete verified file; servicing transfer fee.', eligible: true },
      { id: 'o3', buyer: 'Cedar Institutional', priceBps: 10150, feeCents: 100000, settlementDays: 10, conditions: 'Complete verified file; settlement fee.', eligible: true },
    ],
    events: [{ id: 'seed-1', loanId: 'l1', borrowerId: 'b1', action: 'Application moved to processing', previousState: 'Application', newState: 'Processing', time: '2026-10-14T13:00:00.000Z', reason: 'Synthetic income and appraisal evidence verified; insurance pending.' }],
  };
}
