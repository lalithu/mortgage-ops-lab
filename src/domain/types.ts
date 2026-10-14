export type Stage = 'Application' | 'Processing' | 'Underwriting Review' | 'Approved' | 'Funded' | 'Sold';
export type LeadStatus = 'New' | 'Qualified' | 'Application' | 'Closed';
export interface Borrower { id: string; name: string; email: string; phone: string; status: LeadStatus; notes: string; officer: string; nextAction: string; loanId?: string }
export interface Loan { id: string; borrowerId: string; amountCents: number; propertyValueCents: number; dti: number; creditScore: number; rateBps: number; termMonths: number; occupancy: string; purpose: string; stage: Stage; documents: {income: boolean; appraisal: boolean; insurance: boolean}; listed: boolean; acceptedOfferId?: string }
export interface Offer { id: string; buyer: string; priceBps: number; feeCents: number; settlementDays: number; conditions: string; eligible: boolean }
export interface AuditEvent { id: string; loanId?: string; borrowerId?: string; action: string; previousState: string; newState: string; time: string; reason: string }
export interface AppState { version: 1; borrowers: Borrower[]; loans: Loan[]; offers: Offer[]; events: AuditEvent[] }
export interface PricedOffer extends Offer { grossCents: number; netCents: number }
export interface ValidationFinding { code: string; message: string }
export interface ValidationResult { valid: boolean; findings: ValidationFinding[]; expected: string }
export type Recommendation = { kind: 'bid'; loanId: string; offerId: string } | {kind: 'transition'; loanId: string; target: Stage} | {kind: 'arithmetic'; loanId: string; offerId: string; netCents: number};
