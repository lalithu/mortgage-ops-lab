import type { Loan, Offer, PricedOffer } from './types';

/** Prices use basis points: 10,000 = 100%. Half cents round up. */
export function priceOffer(loan: Loan, offer: Offer): PricedOffer {
  if (!Number.isSafeInteger(loan.amountCents) || loan.amountCents < 0 || !Number.isSafeInteger(offer.priceBps) || offer.priceBps < 0 || !Number.isSafeInteger(offer.feeCents) || offer.feeCents < 0) throw new Error('Pricing requires nonnegative integer cents and basis points.');
  const gross = (BigInt(loan.amountCents) * BigInt(offer.priceBps) + 5000n) / 10000n;
  const grossCents = Number(gross);
  if (!Number.isSafeInteger(grossCents)) throw new Error('Proceeds exceed the supported money range.');
  return { ...offer, grossCents, netCents: grossCents - offer.feeCents };
}

export function rankOffers(loan: Loan, offers: Offer[]): PricedOffer[] {
  return offers.filter(offer => offer.eligible).map(offer => priceOffer(loan, offer)).sort((a, b) => b.netCents - a.netCents || a.id.localeCompare(b.id));
}

export function formatMoney(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(cents / 100);
}
