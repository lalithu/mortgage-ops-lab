import { describe, expect, it } from 'vitest';
import { seedState } from '../src/domain/seed';
import { formatMoney, priceOffer, rankOffers } from '../src/domain/pricing';
import { nextStage, transitionLoan } from '../src/domain/workflow';
import { fixtures, validateRecommendation } from '../src/domain/validation';

describe('Money-safe marketplace', () => {
  it('recomputes gross and net; highest quote loses to explicit fees', () => {
    const { loans, offers } = seedState();
    expect(priceOffer(loans[0], offers[0])).toMatchObject({ grossCents: 49080000, netCents: 48430000 });
    expect(rankOffers(loans[0], offers).map(o => o.id)).toEqual(['o2', 'o3', 'o1']);
    expect(rankOffers(loans[0], offers)[0].netCents - rankOffers(loans[0], offers)[1].netCents).toBe(70000);
  });
  it('fee changes recompute ranking and excludes ineligible offers', () => {
    const { loans, offers } = seedState();
    expect(rankOffers(loans[0], offers.map(o => o.id === 'o1' ? { ...o, feeCents: 0 } : o))[0].id).toBe('o1');
    expect(rankOffers(loans[0], offers.map(o => ({ ...o, eligible: o.id !== 'o2' })))[0].id).toBe('o3');
    expect(rankOffers(loans[0], offers.map(o => ({ ...o, eligible: false })))).toEqual([]);
  });
  it('rounds exactly half a cent up using integer arithmetic', () => {
    const { loans, offers } = seedState();
    expect(priceOffer({ ...loans[0], amountCents: 1 }, { ...offers[0], priceBps: 5000, feeCents: 0 }).grossCents).toBe(1);
    expect(priceOffer({ ...loans[0], amountCents: 1 }, { ...offers[0], priceBps: 4999, feeCents: 0 }).grossCents).toBe(0);
    expect(formatMoney(123456)).toBe('$1,234.56');
  });
  it('rejects fractional money and unsafe proceeds', () => {
    const { loans, offers } = seedState();
    expect(() => priceOffer(loans[0], { ...offers[0], feeCents: 0.1 })).toThrow();
    expect(() => priceOffer({ ...loans[0], amountCents: Number.MAX_SAFE_INTEGER }, { ...offers[0], priceBps: 20000 })).toThrow();
  });
});

describe('Lifecycle invariants', () => {
  it('blocks missing insurance, skips, backward transitions and manual sales', () => {
    const loan = seedState().loans[0];
    expect(transitionLoan(loan, 'Underwriting Review')).toMatchObject({ allowed: false });
    expect(transitionLoan(loan, 'Underwriting Review').reason).toContain('homeowners insurance');
    expect(transitionLoan(loan, 'Approved').allowed).toBe(false);
    expect(transitionLoan(loan, 'Application').allowed).toBe(false);
    expect(transitionLoan({ ...loan, stage: 'Funded' }, 'Sold').allowed).toBe(false);
    expect(nextStage('Sold')).toBeUndefined();
  });
  it('permits complete progression after required evidence verification', () => {
    let loan = seedState().loans[0];
    loan = { ...loan, documents: { income: true, appraisal: true, insurance: true } };
    for (const target of ['Underwriting Review', 'Approved', 'Funded'] as const) {
      expect(transitionLoan(loan, target).allowed).toBe(true);
      loan = { ...loan, stage: target };
    }
  });
  it('checks documents at each decision stage', () => {
    const loan = seedState().loans[0];
    expect(transitionLoan({ ...loan, stage: 'Approved' }, 'Funded').allowed).toBe(false);
    expect(transitionLoan({ ...loan, stage: 'Application' }, 'Processing').allowed).toBe(true);
  });
});

describe('Model-output guardrails', () => {
  it('catches all three bad fixtures with precise invariants', () => {
    const state = seedState();
    expect(fixtures.map(f => validateRecommendation(f.output, state).findings[0].code)).toEqual(['NET_PROCEEDS', 'WORKFLOW', 'ARITHMETIC']);
    expect(validateRecommendation(fixtures[2].output, state).expected).toContain('48690000');
  });
  it('accepts corrected bid, arithmetic and permitted progression', () => {
    const state = seedState();
    expect(validateRecommendation({ kind: 'bid', loanId: 'l1', offerId: 'o2' }, state).valid).toBe(true);
    expect(validateRecommendation({ kind: 'arithmetic', loanId: 'l1', offerId: 'o2', netCents: 48690000 }, state).valid).toBe(true);
    state.loans[0].documents.insurance = true;
    expect(validateRecommendation(fixtures[1].output, state).valid).toBe(true);
  });
  it('handles malformed schema and invalid references without throwing', () => {
    const state = seedState();
    for (const value of [null, [], 'bad', {}, { kind: 'bid', loanId: 'missing', offerId: 'o1' }, { kind: 'bid', loanId: 'l1', offerId: 'missing' }, { kind: 'transition', loanId: 'l1', target: 'Magical approval' }, { kind: 'arithmetic', loanId: 'l1', offerId: 'o1', netCents: 0.5 }]) expect(validateRecommendation(value, state).valid).toBe(false);
  });
  it('checks eligibility and handles no eligible alternatives', () => {
    const state = seedState();
    state.offers[1].eligible = false;
    expect(validateRecommendation({ kind: 'bid', loanId: 'l1', offerId: 'o2' }, state).findings[0].code).toBe('ELIGIBILITY');
    state.offers.forEach(o => { o.eligible = false; });
    expect(validateRecommendation(fixtures[0].output, state).findings[0].code).toBe('NO_ELIGIBLE_OFFERS');
  });
});

it('seed resets are deterministic and return independent mutable state', () => {
  const first = seedState();
  const second = seedState();
  expect(first).toEqual(second);
  first.loans[0].documents.insurance = true;
  expect(second.loans[0].documents.insurance).toBe(false);
  expect(seedState()).toEqual(second);
});
