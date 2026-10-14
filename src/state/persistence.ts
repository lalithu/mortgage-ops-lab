import type { AppState, Stage } from '../domain/types';
import { seedState } from '../domain/seed';
import { stages } from '../domain/workflow';
export const STORAGE_KEY = 'mortgage-ops-lab:v1';

type RecordValue = Record<string, unknown>;
const record = (value: unknown): value is RecordValue => !!value && typeof value === 'object' && !Array.isArray(value);
const text = (value: unknown, max = 4000): value is string => typeof value === 'string' && value.length <= max;
const id = (value: unknown): value is string => text(value, 200) && value.trim().length > 0;
const integer = (value: unknown, min: number, max: number): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value >= min && value <= max;
const finite = (value: unknown, min: number, max: number): value is number => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
const money = (value: unknown): value is number => integer(value, 0, Number.MAX_SAFE_INTEGER);
const strings = (value: RecordValue, keys: string[]) => keys.every(key => text(value[key]));
const uniqueIds = (items: RecordValue[]) => items.every(item => id(item.id)) && new Set(items.map(item => item.id)).size === items.length;

/** Stored JSON is untrusted. Validate the complete shape and relationships before hydration. */
export function parseState(raw: string | null): AppState {
  if (!raw) return seedState();
  try {
    const value: unknown = JSON.parse(raw);
    if (!record(value) || value.version !== 1) throw Error('Unsupported state');
    for (const key of ['borrowers', 'loans', 'offers', 'events']) {
      if (!Array.isArray(value[key]) || !(value[key] as unknown[]).every(record)) throw Error('Invalid collection');
    }
    const borrowers = value.borrowers as RecordValue[];
    const loans = value.loans as RecordValue[];
    const offers = value.offers as RecordValue[];
    const events = value.events as RecordValue[];
    if (!borrowers.length || !loans.length || offers.length !== 3 || ![borrowers, loans, offers, events].every(uniqueIds)) throw Error('Invalid identity');
    for (const borrower of borrowers) {
      if (!strings(borrower, ['name', 'email', 'phone', 'notes', 'officer', 'nextAction']) || typeof borrower.status !== 'string' || !['New', 'Qualified', 'Application', 'Closed'].includes(borrower.status)) throw Error('Invalid borrower');
      if (borrower.loanId !== undefined && (!id(borrower.loanId) || !loans.some(loan => loan.id === borrower.loanId && loan.borrowerId === borrower.id))) throw Error('Invalid loan association');
    }
    for (const offer of offers) {
      if (!strings(offer, ['buyer', 'conditions']) || !integer(offer.priceBps, 0, 20000) || !integer(offer.feeCents, 0, 100000000) || !integer(offer.settlementDays, 1, 365) || typeof offer.eligible !== 'boolean') throw Error('Invalid offer');
    }
    for (const loan of loans) {
      if (!id(loan.borrowerId) || !borrowers.some(borrower => borrower.id === loan.borrowerId && borrower.loanId === loan.id)) throw Error('Invalid borrower association');
      if (typeof loan.stage !== 'string' || !stages.includes(loan.stage as Stage) || !integer(loan.amountCents, 1, Math.floor(Number.MAX_SAFE_INTEGER / 2)) || !money(loan.propertyValueCents) || loan.propertyValueCents === 0 || !finite(loan.dti, 0, 100) || !integer(loan.creditScore, 300, 850) || !integer(loan.rateBps, 0, 10000) || !integer(loan.termMonths, 1, 600) || !strings(loan, ['occupancy', 'purpose']) || typeof loan.listed !== 'boolean') throw Error('Invalid loan');
      if (!record(loan.documents) || !['income', 'appraisal', 'insurance'].every(key => typeof (loan.documents as RecordValue)[key] === 'boolean')) throw Error('Invalid documents');
      if (['Underwriting Review', 'Approved', 'Funded', 'Sold'].includes(loan.stage) && !['income', 'appraisal', 'insurance'].every(key => (loan.documents as RecordValue)[key] === true)) throw Error('Missing required evidence');
      if (loan.listed && !['Funded', 'Sold'].includes(loan.stage)) throw Error('Unfunded listing');
      if (loan.stage === 'Sold') {
        if (!loan.listed || !id(loan.acceptedOfferId) || !offers.some(offer => offer.id === loan.acceptedOfferId && offer.eligible)) throw Error('Invalid accepted offer');
      } else if (loan.acceptedOfferId !== undefined) throw Error('Premature offer acceptance');
    }
    for (const event of events) {
      if (!strings(event, ['action', 'previousState', 'newState', 'time', 'reason']) || !Number.isFinite(Date.parse(event.time as string))) throw Error('Invalid event');
      if (event.loanId !== undefined && (!id(event.loanId) || !loans.some(loan => loan.id === event.loanId))) throw Error('Invalid event loan');
      if (event.borrowerId !== undefined && (!id(event.borrowerId) || !borrowers.some(borrower => borrower.id === event.borrowerId))) throw Error('Invalid event borrower');
      if (event.loanId !== undefined && event.borrowerId !== undefined && !loans.some(loan => loan.id === event.loanId && loan.borrowerId === event.borrowerId)) throw Error('Inconsistent event references');
    }
    return value as unknown as AppState;
  } catch {
    return seedState();
  }
}
