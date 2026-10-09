import type { QuoteRequest as QuoteRow } from '../../generated/prisma/client';
import type { LeadStatus } from '../ai/types';
import { getPrisma, isUuid } from '../prisma';
import type { QuoteRequestInput } from './schema';

export type QuoteRequest = Omit<QuoteRow, 'createdAt' | 'updatedAt'> & { createdAt: string; updatedAt: string };

function toQuote(row: QuoteRow): QuoteRequest {
  return { ...row, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() };
}

export async function createQuoteRequest(input: QuoteRequestInput) {
  const { website: _honeypot, ...data } = input;
  void _honeypot;
  return toQuote(await getPrisma().quoteRequest.create({ data }));
}

export async function listQuoteRequests() {
  const rows = await getPrisma().quoteRequest.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  return rows.map(toQuote);
}

export async function getQuoteOverview() {
  const prisma = getPrisma();
  const [newCount, total, recent] = await Promise.all([
    prisma.quoteRequest.count({ where: { status: 'NEW' } }),
    prisma.quoteRequest.count(),
    prisma.quoteRequest.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
  ]);
  return { newCount, total, recent: recent.map(toQuote) };
}

export async function updateQuoteStatus(id: string, status: LeadStatus) {
  if (!isUuid(id)) return null;
  const { count } = await getPrisma().quoteRequest.updateMany({ where: { id }, data: { status } });
  return count > 0;
}

export async function deleteQuoteRequest(id: string) {
  if (!isUuid(id)) return false;
  const { count } = await getPrisma().quoteRequest.deleteMany({ where: { id } });
  return count > 0;
}
