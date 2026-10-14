import type { AppState, Recommendation, Stage, ValidationResult } from './types';
import { priceOffer, rankOffers } from './pricing';
import { stages, transitionLoan } from './workflow';

export const fixtures: { id: string; label: string; output: Recommendation }[] = [
  { id: 'bid', label: 'Incorrect bid recommendation', output: { kind: 'bid', loanId: 'l1', offerId: 'o1' } },
  { id: 'transition', label: 'Invalid workflow transition', output: { kind: 'transition', loanId: 'l1', target: 'Underwriting Review' } },
  { id: 'arithmetic', label: 'Arithmetic error', output: { kind: 'arithmetic', loanId: 'l1', offerId: 'o2', netCents: 48840000 } },
];

export function validateRecommendation(input: unknown, state: AppState): ValidationResult {
  const fail = (code: string, message: string, expected = 'Provide a recommendation matching the documented schema.'): ValidationResult => ({ valid: false, findings: [{ code, message }], expected });
  if (!input || typeof input !== 'object' || Array.isArray(input)) return fail('SCHEMA', 'Recommendation must be a JSON object.');
  const value = input as Record<string, unknown>;
  if (!['bid', 'transition', 'arithmetic'].includes(String(value.kind)) || typeof value.loanId !== 'string') return fail('SCHEMA', 'Use kind bid, transition, or arithmetic and a string loanId.');
  const loan = state.loans.find(item => item.id === value.loanId);
  if (!loan) return fail('LOAN_REFERENCE', `Unknown loan ${value.loanId}.`, 'Reference an existing loan ID.');
  if (value.kind === 'transition') {
    if (typeof value.target !== 'string' || !stages.includes(value.target as Stage)) return fail('SCHEMA', 'target must be a supported loan stage.');
    const result = transitionLoan(loan, value.target as Stage);
    return result.allowed ? { valid: true, findings: [], expected: result.reason } : fail('WORKFLOW', result.reason, 'Resolve required evidence and advance only to the next permitted stage.');
  }
  if (typeof value.offerId !== 'string') return fail('SCHEMA', 'offerId must be a string.');
  const offer = state.offers.find(item => item.id === value.offerId);
  if (!offer) return fail('OFFER_REFERENCE', `Unknown offer ${value.offerId}.`, 'Reference an existing offer ID.');
  if (value.kind === 'arithmetic') {
    if (!Number.isSafeInteger(value.netCents)) return fail('SCHEMA', 'netCents must be an integer number of cents.');
    const priced = priceOffer(loan, offer);
    const expected = `Expected netCents: ${priced.netCents}. Gross ${priced.grossCents} cents minus explicit fees ${offer.feeCents} cents.`;
    return value.netCents === priced.netCents ? { valid: true, findings: [], expected } : fail('ARITHMETIC', `Reported ${value.netCents} cents differs from deterministic net proceeds ${priced.netCents} cents.`, expected);
  }
  const ranked = rankOffers(loan, state.offers);
  if (!ranked.length) return fail('NO_ELIGIBLE_OFFERS', 'No eligible offer can be recommended.', 'Wait for an eligible offer.');
  const best = ranked[0];
  const expected = `${best.buyer} (${best.id}) maximizes net proceeds: ${best.netCents} cents after explicit fees.`;
  if (!offer.eligible) return fail('ELIGIBILITY', 'Recommended offer is ineligible.', expected);
  if (priceOffer(loan, offer).netCents !== best.netCents) return fail('NET_PROCEEDS', 'Quoted price alone ignores explicit fees; the recommended offer does not maximize net proceeds.', expected);
  return { valid: true, findings: [], expected };
}
