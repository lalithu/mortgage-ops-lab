import {describe,it,expect} from 'vitest';
import {parseState} from '../src/state/persistence';
import {seedState} from '../src/domain/seed';
describe('versioned persistence',()=>{
 it('round trips progress',()=>{const s=seedState();s.loans[0].documents.insurance=true;s.borrowers[0].notes='Saved';expect(parseState(JSON.stringify(s))).toEqual(s)});
 it('resets deterministically',()=>expect(seedState()).toEqual(seedState()));
 it.each([null,'{','{"version":2}',JSON.stringify({version:1,borrowers:[],loans:[],offers:[],events:[]})])('recovers corrupt storage %s',raw=>expect(parseState(raw)).toEqual(seedState()));
 it('rejects unsafe monetary values',()=>{const s=seedState();s.loans[0].amountCents=-1;expect(parseState(JSON.stringify(s))).toEqual(seedState())});
});

describe('complete persisted-state validation',()=>{
 const mutations: [string,(s:ReturnType<typeof seedState>)=>void][]=[
  ['missing contact',s=>{delete (s.borrowers[0] as Partial<typeof s.borrowers[0]>).email}],
  ['non-string officer',s=>{Object.assign(s.borrowers[0],{officer:42})}],
  ['array lead status',s=>{Object.assign(s.borrowers[0],{status:['Application']})}],
  ['duplicate borrower',s=>{s.borrowers[1].id=s.borrowers[0].id}],
  ['duplicate loan',s=>{s.loans[1].id=s.loans[0].id}],
  ['duplicate offer',s=>{s.offers[1].id=s.offers[0].id}],
  ['duplicate event',s=>{s.events.push({...s.events[0]})}],
  ['blank identity',s=>{s.offers[0].id=' '}],
  ['broken borrower loan reference',s=>{s.borrowers[0].loanId='missing'}],
  ['mismatched association',s=>{s.loans[0].borrowerId='b2'}],
  ['zero principal',s=>{s.loans[0].amountCents=0}],
  ['unsafe pricing principal',s=>{s.loans[0].amountCents=Number.MAX_SAFE_INTEGER}],
  ['zero property',s=>{s.loans[0].propertyValueCents=0}],
  ['negative DTI',s=>{s.loans[0].dti=-1}],
  ['excess DTI',s=>{s.loans[0].dti=101}],
  ['out of range credit',s=>{s.loans[0].creditScore=851}],
  ['fractional term',s=>{s.loans[0].termMonths=360.5}],
  ['negative rate',s=>{s.loans[0].rateBps=-1}],
  ['missing occupancy',s=>{delete (s.loans[0] as Partial<typeof s.loans[0]>).occupancy}],
  ['invalid document shape',s=>{Object.assign(s.loans[0],{documents:[]})}],
  ['unfunded listing',s=>{s.loans[0].listed=true}],
  ['funded without evidence',s=>{s.loans[0].stage='Funded'}],
  ['premature acceptance',s=>{s.loans[0].acceptedOfferId='o2'}],
  ['sale without acceptance',s=>{s.loans[1].stage='Sold';s.loans[1].listed=true}],
  ['sale to unknown offer',s=>{s.loans[1].stage='Sold';s.loans[1].listed=true;s.loans[1].acceptedOfferId='missing'}],
  ['invalid quote',s=>{s.offers[0].priceBps=20001}],
  ['invalid fee',s=>{s.offers[0].feeCents=100000001}],
  ['zero settlement',s=>{s.offers[0].settlementDays=0}],
  ['missing buyer',s=>{delete (s.offers[0] as Partial<typeof s.offers[0]>).buyer}],
  ['invalid event time',s=>{s.events[0].time='not a date'}],
  ['missing previous state',s=>{delete (s.events[0] as Partial<typeof s.events[0]>).previousState}],
  ['orphan event reference',s=>{s.events[0].loanId='missing'}],
  ['mismatched event references',s=>{s.events[0].borrowerId='b3'}],
 ];
 it.each(mutations)('safely resets %s',(_label,mutate)=>{const state=seedState();mutate(state);expect(parseState(JSON.stringify(state))).toEqual(seedState())});
 it('accepts a completed sale with edited offer assumptions and audit events',()=>{
  const state=seedState();state.loans[0].documents.insurance=true;state.loans[0].stage='Sold';state.loans[0].listed=true;state.loans[0].acceptedOfferId='o2';state.borrowers[0].status='Closed';state.offers[1].feeCents=170000;
  state.events.push({id:'sale-event',loanId:'l1',action:'Simulated offer accepted',previousState:'Funded',newState:'Sold',time:'2026-10-14T14:00:00.000Z',reason:'Synthetic sale.'});
  expect(parseState(JSON.stringify(state))).toEqual(state);
 });
 it('accepts a new borrower application and document progression',()=>{
  const state=seedState();state.borrowers[1].loanId='loan-b2';state.borrowers[1].status='Application';state.loans.push({...state.loans[0],id:'loan-b2',borrowerId:'b2',stage:'Application',documents:{income:false,appraisal:false,insurance:false}});
  expect(parseState(JSON.stringify(state))).toEqual(state);
 });
 it.each(['null','[]','42',JSON.stringify({...seedState(),offers:[null,null,null]})])('rejects incompatible JSON shape %s',raw=>expect(parseState(raw)).toEqual(seedState()));
});
